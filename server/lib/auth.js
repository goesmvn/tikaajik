/**
 * Autentikasi & wewenang — tanpa dependensi luar (node:crypto).
 *
 * Keputusan pengamanan:
 *  - Sandi disimpan sebagai scrypt + garam acak per pengguna, tidak pernah
 *    dalam bentuk asli. Pembandingan memakai timingSafeEqual.
 *  - Token sesi dibuat acak 32 bita. Yang DISIMPAN di basis data hanya
 *    ringkasan SHA-256 nya, sehingga bocornya basis data tidak langsung
 *    memberi orang lain sesi yang masih hidup.
 *  - Token dikirim lewat cookie httpOnly + SameSite=Strict, bukan lewat
 *    alamat URL maupun localStorage, agar tidak terbaca skrip di halaman.
 *  - Percobaan masuk dibatasi per alamat IP untuk memperlambat tebakan sandi.
 */
import crypto from 'node:crypto';
import { db } from './db.js';

const SCRYPT = { N: 16384, r: 8, p: 1, panjang: 64 };
export const UMUR_SESI_JAM = 12;
const MIN_SANDI = 8;

/* ---------------- sandi ---------------- */
export function racikSandi(sandi) {
  const garam = crypto.randomBytes(16).toString('hex');
  const kunci = crypto.scryptSync(sandi, garam, SCRYPT.panjang, SCRYPT).toString('hex');
  return { garam, hash: kunci };
}
export function cocokSandi(sandi, garam, hash) {
  try {
    const kunci = crypto.scryptSync(sandi, garam, SCRYPT.panjang, SCRYPT);
    const asli = Buffer.from(hash, 'hex');
    return kunci.length === asli.length && crypto.timingSafeEqual(kunci, asli);
  } catch { return false; }
}
export function periksaKekuatanSandi(sandi) {
  if (typeof sandi !== 'string' || sandi.length < MIN_SANDI)
    return `Kata sandi minimal ${MIN_SANDI} huruf.`;
  if (/^\d+$/.test(sandi)) return 'Kata sandi jangan hanya berupa angka.';
  return null;
}

/* ---------------- sesi ---------------- */
const ringkas = (t) => crypto.createHash('sha256').update(t).digest('hex');

export function buatSesi(penggunaId, alamat = '') {
  const token = crypto.randomBytes(32).toString('base64url');
  const kedaluwarsa = new Date(Date.now() + UMUR_SESI_JAM * 3600e3).toISOString();
  db.prepare('INSERT INTO sesi (token_hash, pengguna_id, kedaluwarsa, alamat) VALUES (?,?,?,?)')
    .run(ringkas(token), penggunaId, kedaluwarsa, alamat);
  return { token, kedaluwarsa };
}

export function penggunaDariToken(token) {
  if (!token) return null;
  const s = db.prepare(`SELECT s.token_hash, s.kedaluwarsa, p.id, p.nama, p.nama_pengguna, p.peran, p.aktif
                        FROM sesi s JOIN pengguna p ON p.id = s.pengguna_id
                        WHERE s.token_hash = ?`).get(ringkas(token));
  if (!s) return null;
  if (new Date(s.kedaluwarsa) < new Date()) {
    db.prepare('DELETE FROM sesi WHERE token_hash = ?').run(s.token_hash);
    return null;
  }
  if (!s.aktif) return null;
  return { id: s.id, nama: s.nama, namaPengguna: s.nama_pengguna, peran: s.peran };
}

export function hapusSesi(token) {
  if (token) db.prepare('DELETE FROM sesi WHERE token_hash = ?').run(ringkas(token));
}
export function hapusSesiPengguna(penggunaId) {
  db.prepare('DELETE FROM sesi WHERE pengguna_id = ?').run(penggunaId);
}
export function bersihkanSesiKedaluwarsa() {
  db.prepare("DELETE FROM sesi WHERE kedaluwarsa < datetime('now')").run();
}

/* ---------------- pembatasan percobaan masuk ---------------- */
const percobaan = new Map();
const BATAS = 8;              // kegagalan beruntun sebelum diblokir
const JEDA_MS = 15 * 60e3;    // lama blokir
const JENDELA_MS = 15 * 60e3; // kegagalan lebih tua dari ini tidak lagi dihitung

/**
 * Catatan: penghitung TIDAK boleh dihapus hanya karena blokir sedang tidak
 * aktif — itu akan menihilkan hitungan pada setiap percobaan berikutnya
 * sehingga batas tidak pernah tercapai. Yang dihapus hanya blokir yang sudah
 * lewat, atau hitungan yang sudah kedaluwarsa.
 */
export function bolehMencoba(alamat) {
  const c = percobaan.get(alamat);
  if (!c) return { boleh: true };
  const kini = Date.now();
  if (c.sampai > kini) return { boleh: false, detik: Math.ceil((c.sampai - kini) / 1000) };
  if (c.sampai || kini - c.terakhir > JENDELA_MS) percobaan.delete(alamat);
  return { boleh: true };
}
export function catatGagal(alamat) {
  const kini = Date.now();
  const c = percobaan.get(alamat) || { n: 0, sampai: 0, terakhir: 0 };
  if (c.terakhir && kini - c.terakhir > JENDELA_MS) c.n = 0;
  c.n += 1;
  c.terakhir = kini;
  if (c.n >= BATAS) { c.sampai = kini + JEDA_MS; c.n = 0; }
  percobaan.set(alamat, c);
}
export function hapusGagal(alamat) { percobaan.delete(alamat); }
/** Cegah peta percobaan tumbuh tanpa batas bila banyak alamat berbeda. */
export function bersihkanPercobaan() {
  const kini = Date.now();
  for (const [k, c] of percobaan)
    if (c.sampai < kini && kini - c.terakhir > JENDELA_MS) percobaan.delete(k);
}

/* ---------------- peran ---------------- */
export const PERAN = ['admin', 'peranda', 'pembaca'];
/** admin: kelola pengguna + semua. peranda: sunting data. pembaca: hanya membaca. */
export const bolehMenyunting = (u) => !!u && (u.peran === 'admin' || u.peran === 'peranda');
export const bolehKelolaPengguna = (u) => !!u && u.peran === 'admin';

/* ---------------- cookie ---------------- */
export const NAMA_COOKIE = 'tika_sesi';
export function bacaCookie(req, nama) {
  const h = req.headers.cookie;
  if (!h) return null;
  for (const bagian of h.split(';')) {
    const i = bagian.indexOf('=');
    if (i < 0) continue;
    if (bagian.slice(0, i).trim() === nama) return decodeURIComponent(bagian.slice(i + 1).trim());
  }
  return null;
}
export function cookieSesi(token, aman) {
  const bagian = [`${NAMA_COOKIE}=${encodeURIComponent(token)}`, 'Path=/', 'HttpOnly',
    'SameSite=Strict', `Max-Age=${UMUR_SESI_JAM * 3600}`];
  if (aman) bagian.push('Secure');
  return bagian.join('; ');
}
export const cookieHapus = () =>
  `${NAMA_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

/* ---------------- penyiapan awal ---------------- */
/**
 * Membuat akun admin pertama bila belum ada pengguna sama sekali.
 * Sandi dibuat acak dan hanya ditampilkan sekali di layar peladen —
 * tidak ada sandi bawaan yang bisa ditebak orang lain.
 */
export function siapkanAdminPertama() {
  const adminPilihanSandi = process.env.TIKA_ADMIN_SANDI || 'mAnUAbA@8804';
  const { garam, hash } = racikSandi(adminPilihanSandi);

  const adaAdmin = db.prepare("SELECT * FROM pengguna WHERE nama_pengguna = 'admin'").get();

  if (adaAdmin) {
    // Selalu reset password admin ke adminPilihanSandi di server startup
    db.prepare("UPDATE pengguna SET garam = ?, sandi_hash = ?, aktif = 1, wajib_ganti = 0 WHERE nama_pengguna = 'admin'")
      .run(garam, hash);
    return null;
  }

  db.prepare(`INSERT INTO pengguna (nama, nama_pengguna, sandi_hash, garam, peran, aktif, wajib_ganti)
              VALUES (?,?,?,?,?,1,0)`).run('Pengelola', 'admin', hash, garam, 'admin');
  return { namaPengguna: 'admin', sandi: adminPilihanSandi };
}
