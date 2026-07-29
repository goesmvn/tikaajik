/**
 * Peladen Tika Digital — tanpa dependensi luar (node:http + node:sqlite).
 * Jalankan:  node server/index.js     (bawaan: http://localhost:8787)
 *
 * Wewenang:
 *   pembaca  — hanya melihat kalender
 *   peranda  — menyunting dewasa, koreksi sasih, penilaian, catatan
 *   admin    — semua di atas + mengelola pengguna
 *
 * Membaca kalender terbuka untuk umum; setiap perubahan wajib masuk.
 * Setel TIKA_WAJIB_MASUK=1 bila seluruh isi ingin ditutup dari umum.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, seed, catat } from './lib/db.js';
import * as svc from './lib/service.js';
import { parseKondisi } from './lib/rules.js';
import * as auth from './lib/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;
const KLIEN = path.join(__dirname, '../client/dist');
const ASAL_DEV = process.env.TIKA_ASAL_DEV || '';       // mis. http://localhost:5173
const AMAN = process.env.TIKA_HTTPS === '1';            // pasang bila di balik HTTPS
const WAJIB_MASUK = process.env.TIKA_WAJIB_MASUK === '1';

console.log('Menyiapkan basis data…', seed());
auth.bersihkanSesiKedaluwarsa();
const adminBaru = auth.siapkanAdminPertama();
if (adminBaru) {
  console.log('\n' + '='.repeat(62));
  console.log('  AKUN PENGELOLA PERTAMA DIBUAT');
  console.log('  Nama pengguna : ' + adminBaru.namaPengguna);
  console.log('  Kata sandi    : ' + adminBaru.sandi);
  console.log('  Sandi ini hanya ditampilkan SEKARANG. Segera ganti setelah masuk.');
  console.log('='.repeat(62) + '\n');
}
setInterval(() => { auth.bersihkanSesiKedaluwarsa(); auth.bersihkanPercobaan(); }, 3600e3).unref();

const json = (res, data, kode = 200, kepala = {}) => {
  res.writeHead(kode, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...kepala });
  res.end(JSON.stringify(data));
};
const galat = (res, pesan, kode = 400) => json(res, { galat: pesan }, kode);

const badan = (req) => new Promise((resolve, reject) => {
  let s = '';
  req.on('data', (c) => { s += c; if (s.length > 1e6) req.destroy(); });
  req.on('end', () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(e); } });
  req.on('error', reject);
});

const TGL = /^\d{4}-\d{2}-\d{2}$/;
const SIFAT = [0, 1, 2, 3];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  const q = url.searchParams;
  const alamat = req.socket.remoteAddress || '';

  // CORS: hanya untuk peladen pengembangan yang disebut tegas.
  // Tidak pernah '*', sebab kredensial cookie ikut dikirim.
  const asal = req.headers.origin;
  if (ASAL_DEV && asal === ASAL_DEV) {
    res.setHeader('Access-Control-Allow-Origin', ASAL_DEV);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const token = auth.bacaCookie(req, auth.NAMA_COOKIE);
  const saya = auth.penggunaDariToken(token);
  const menulis = req.method !== 'GET';

  // Penjaga lapis luar: setiap perubahan wajib masuk & berperan cukup.
  const jalurTerbuka = p === '/api/masuk' || p === '/api/keluar' || p === '/api/saya';
  if (p.startsWith('/api/') && !jalurTerbuka) {
    if (menulis && !auth.bolehMenyunting(saya))
      return galat(res, saya ? 'Peran Anda hanya dapat membaca. Hubungi pengelola untuk menyunting.'
                             : 'Silakan masuk terlebih dahulu.', saya ? 403 : 401);
    if (!menulis && WAJIB_MASUK && !saya) return galat(res, 'Silakan masuk terlebih dahulu.', 401);
  }
  const oleh = saya ? `${saya.nama} (${saya.namaPengguna})` : '';

  try {
    /* ================= autentikasi ================= */
    if (p === '/api/masuk' && req.method === 'POST') {
      const boleh = auth.bolehMencoba(alamat);
      if (!boleh.boleh)
        return galat(res, `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(boleh.detik / 60)} menit.`, 429);
      const b = await badan(req);
      const u = db.prepare('SELECT * FROM pengguna WHERE nama_pengguna = ?')
        .get(String(b.namaPengguna || '').trim().toLowerCase());
      // Pesan sengaja disamakan agar tidak membocorkan nama pengguna mana yang ada.
      if (!u || !u.aktif || !auth.cocokSandi(String(b.sandi || ''), u.garam, u.sandi_hash)) {
        auth.catatGagal(alamat);
        return galat(res, 'Nama pengguna atau kata sandi tidak cocok.', 401);
      }
      auth.hapusGagal(alamat);
      const { token: t } = auth.buatSesi(u.id, alamat);
      catat('sesi', u.id, 'masuk', null, null, `${u.nama} (${u.nama_pengguna})`);
      return json(res, {
        id: u.id, nama: u.nama, namaPengguna: u.nama_pengguna, peran: u.peran,
        wajibGanti: !!u.wajib_ganti,
      }, 200, { 'Set-Cookie': auth.cookieSesi(t, AMAN) });
    }
    if (p === '/api/keluar' && req.method === 'POST') {
      auth.hapusSesi(token);
      return json(res, { ok: true }, 200, { 'Set-Cookie': auth.cookieHapus() });
    }
    if (p === '/api/saya') {
      if (!saya) return json(res, { masuk: false, wajibMasuk: WAJIB_MASUK });
      const u = db.prepare('SELECT wajib_ganti FROM pengguna WHERE id = ?').get(saya.id);
      return json(res, { masuk: true, ...saya, wajibGanti: !!u?.wajib_ganti, wajibMasuk: WAJIB_MASUK });
    }
    if (p === '/api/ganti-sandi' && req.method === 'POST') {
      if (!saya) return galat(res, 'Silakan masuk terlebih dahulu.', 401);
      const b = await badan(req);
      const u = db.prepare('SELECT * FROM pengguna WHERE id = ?').get(saya.id);
      if (!auth.cocokSandi(String(b.sandiLama || ''), u.garam, u.sandi_hash))
        return galat(res, 'Kata sandi lama tidak cocok.');
      const buruk = auth.periksaKekuatanSandi(b.sandiBaru);
      if (buruk) return galat(res, buruk);
      const { garam, hash } = auth.racikSandi(b.sandiBaru);
      db.prepare('UPDATE pengguna SET sandi_hash=?, garam=?, wajib_ganti=0 WHERE id=?').run(hash, garam, saya.id);
      auth.hapusSesiPengguna(saya.id);            // paksa masuk ulang di semua perangkat
      catat('pengguna', saya.id, 'ganti-sandi', null, null, oleh);
      return json(res, { ok: true }, 200, { 'Set-Cookie': auth.cookieHapus() });
    }

    /* ================= kelola pengguna (admin) ================= */
    if (p.startsWith('/api/pengguna')) {
      if (!auth.bolehKelolaPengguna(saya)) return galat(res, 'Hanya pengelola yang boleh membuka bagian ini.', 403);

      if (p === '/api/pengguna' && req.method === 'GET')
        return json(res, db.prepare(
          'SELECT id,nama,nama_pengguna,peran,aktif,wajib_ganti,dibuat FROM pengguna ORDER BY nama').all());

      if (p === '/api/pengguna' && req.method === 'POST') {
        const b = await badan(req);
        const np = String(b.namaPengguna || '').trim().toLowerCase();
        if (!/^[a-z0-9._-]{3,32}$/.test(np))
          return galat(res, 'Nama pengguna 3–32 huruf kecil, angka, titik, garis bawah, atau strip.');
        if (!String(b.nama || '').trim()) return galat(res, 'Nama lengkap wajib diisi.');
        if (!auth.PERAN.includes(b.peran)) return galat(res, 'Peran tidak dikenal.');
        const buruk = auth.periksaKekuatanSandi(b.sandi);
        if (buruk) return galat(res, buruk);
        if (db.prepare('SELECT 1 FROM pengguna WHERE nama_pengguna=?').get(np))
          return galat(res, 'Nama pengguna sudah dipakai.');
        const { garam, hash } = auth.racikSandi(b.sandi);
        const r = db.prepare(`INSERT INTO pengguna (nama,nama_pengguna,sandi_hash,garam,peran,wajib_ganti)
                              VALUES (?,?,?,?,?,1)`).run(String(b.nama).trim(), np, hash, garam, b.peran);
        const id = Number(r.lastInsertRowid);
        catat('pengguna', id, 'tambah', null, { nama: b.nama, namaPengguna: np, peran: b.peran }, oleh);
        return json(res, { id }, 201);
      }

      const id = +p.split('/')[3];
      const target = db.prepare('SELECT * FROM pengguna WHERE id = ?').get(id);
      if (!target) return galat(res, 'Pengguna tidak ditemukan.', 404);

      if (req.method === 'PUT') {
        const b = await badan(req);
        if (b.peran && !auth.PERAN.includes(b.peran)) return galat(res, 'Peran tidak dikenal.');
        // Jangan sampai pengelola terakhir kehilangan wewenangnya.
        const jmlAdmin = db.prepare("SELECT COUNT(*) c FROM pengguna WHERE peran='admin' AND aktif=1").get().c;
        const turunPeran = target.peran === 'admin' && b.peran && b.peran !== 'admin';
        const dinonaktifkan = target.peran === 'admin' && b.aktif === 0;
        if (jmlAdmin <= 1 && (turunPeran || dinonaktifkan))
          return galat(res, 'Ini satu-satunya pengelola aktif. Angkat pengelola lain dahulu.');
        db.prepare('UPDATE pengguna SET nama=?, peran=?, aktif=? WHERE id=?')
          .run(b.nama ?? target.nama, b.peran ?? target.peran,
               b.aktif === undefined ? target.aktif : (b.aktif ? 1 : 0), id);
        if (b.aktif === 0 || (b.peran && b.peran !== target.peran)) auth.hapusSesiPengguna(id);
        if (b.sandiBaru !== undefined) {
          const buruk = auth.periksaKekuatanSandi(b.sandiBaru);
          if (buruk) return galat(res, buruk);
          const { garam, hash } = auth.racikSandi(b.sandiBaru);
          db.prepare('UPDATE pengguna SET sandi_hash=?, garam=?, wajib_ganti=1 WHERE id=?').run(hash, garam, id);
          auth.hapusSesiPengguna(id);
        }
        catat('pengguna', id, 'ubah', { nama: target.nama, peran: target.peran, aktif: target.aktif }, b, oleh);
        return json(res, { ok: true });
      }
      if (req.method === 'DELETE') {
        if (target.id === saya.id) return galat(res, 'Tidak dapat menghapus akun sendiri.');
        const jmlAdmin = db.prepare("SELECT COUNT(*) c FROM pengguna WHERE peran='admin' AND aktif=1").get().c;
        if (target.peran === 'admin' && jmlAdmin <= 1)
          return galat(res, 'Ini satu-satunya pengelola aktif.');
        auth.hapusSesiPengguna(id);
        db.prepare('DELETE FROM pengguna WHERE id=?').run(id);
        catat('pengguna', id, 'hapus', { nama: target.nama, namaPengguna: target.nama_pengguna }, null, oleh);
        return json(res, { ok: true });
      }
    }

    /* ================= keterangan kalender ================= */
    if (p === '/api/meta') {
      return json(res, {
        ...svc.META, taraf: svc.TARAF,
        rentangExcel: { mulai: svc.isoOf(svc.EXCEL_RANGE.mulai), sampai: svc.isoOf(svc.EXCEL_RANGE.sampai) },
        jumlahDewasa: db.prepare('SELECT COUNT(*) c FROM dewasa WHERE aktif=1').get().c,
      });
    }
    if (p === '/api/tika') return json(res, svc.tikaPawukon());
    if (p === '/api/hari') {
      const t = q.get('tanggal');
      if (!TGL.test(t || '')) return galat(res, 'Parameter "tanggal" harus YYYY-MM-DD');
      return json(res, svc.hari(t));
    }
    if (p === '/api/bulan') {
      const th = +q.get('tahun'), bl = +q.get('bulan');
      if (!(th >= 1900 && th <= 3000) || !(bl >= 1 && bl <= 12)) return galat(res, 'tahun/bulan tidak sah');
      return json(res, svc.bulan(th, bl));
    }
    if (p === '/api/hari-baik') {
      const dari = q.get('dari');
      if (!TGL.test(dari || '')) return galat(res, 'Parameter "dari" harus YYYY-MM-DD');
      return json(res, svc.cariHariBaik({
        dari, jenis: q.get('jenis') === 'ngaben' ? 'ngaben' : 'pawiwahan',
        tarafMin: Math.min(4, Math.max(1, +q.get('taraf') || 3)),
        tanpaAla: q.get('tanpaAla') !== '0',
      }));
    }

    /* ================= CRUD dewasa ================= */
    if (p === '/api/dewasa' && req.method === 'GET') {
      const cari = (q.get('cari') || '').toLowerCase();
      let baris = db.prepare('SELECT * FROM dewasa ORDER BY nama').all();
      if (cari) baris = baris.filter((d) =>
        (d.nama + ' ' + d.kondisi + ' ' + d.keterangan).toLowerCase().includes(cari));
      return json(res, baris.map((d) => {
        const { alternatif, takDikenali } = parseKondisi(d.kondisi);
        return { ...d, jumlahAturan: alternatif.length, kataTakDikenali: [...new Set(takDikenali)] };
      }));
    }
    if (p === '/api/dewasa' && req.method === 'POST') {
      const b = await badan(req);
      if (!b.nama?.trim()) return galat(res, 'Nama dewasa wajib diisi');
      if (!SIFAT.includes(+b.sifat)) return galat(res, 'Sifat harus 0-3');
      const r = db.prepare('INSERT INTO dewasa (nama,kondisi,keterangan,sifat,asal) VALUES (?,?,?,?,?)')
        .run(b.nama.trim(), b.kondisi || '', b.keterangan || '', +b.sifat, 'tambahan');
      const id = Number(r.lastInsertRowid);
      catat('dewasa', id, 'tambah', null, b, oleh);
      svc.bersihkanCache();
      return json(res, { id, ...parseKondisi(b.kondisi || '') }, 201);
    }
    if (p.startsWith('/api/dewasa/') && (req.method === 'PUT' || req.method === 'DELETE')) {
      const id = +p.split('/')[3];
      const lama = db.prepare('SELECT * FROM dewasa WHERE id = ?').get(id);
      if (!lama) return galat(res, 'Dewasa tidak ditemukan', 404);
      if (req.method === 'DELETE') {
        if (lama.asal === 'excel') {
          db.prepare("UPDATE dewasa SET aktif = 0, diubah = datetime('now') WHERE id = ?").run(id);
          catat('dewasa', id, 'nonaktif', lama, null, oleh);
        } else {
          db.prepare('DELETE FROM dewasa WHERE id = ?').run(id);
          catat('dewasa', id, 'hapus', lama, null, oleh);
        }
        svc.bersihkanCache();
        return json(res, { ok: true, asal: lama.asal });
      }
      const b = await badan(req);
      if (b.nama !== undefined && !String(b.nama).trim()) return galat(res, 'Nama tidak boleh kosong');
      if (b.sifat !== undefined && !SIFAT.includes(+b.sifat)) return galat(res, 'Sifat harus 0-3');
      db.prepare(`UPDATE dewasa SET nama=?, kondisi=?, keterangan=?, sifat=?, aktif=?,
                  diubah=datetime('now') WHERE id=?`)
        .run(b.nama ?? lama.nama, b.kondisi ?? lama.kondisi, b.keterangan ?? lama.keterangan,
             b.sifat ?? lama.sifat, b.aktif ?? lama.aktif, id);
      catat('dewasa', id, 'ubah', lama, b, oleh);
      svc.bersihkanCache();
      return json(res, { ok: true, ...parseKondisi(b.kondisi ?? lama.kondisi) });
    }

    /* ================= koreksi sasih ================= */
    if (p === '/api/koreksi-sasih' && req.method === 'GET')
      return json(res, db.prepare('SELECT * FROM koreksi_sasih ORDER BY tanggal').all());
    if (p === '/api/koreksi-sasih' && req.method === 'POST') {
      const b = await badan(req);
      if (!TGL.test(b.tanggal || '')) return galat(res, 'Tanggal harus YYYY-MM-DD');
      if (!b.tp && !b.sasih) return galat(res, 'Isi minimal salah satu: Penanggal/Panglong atau Sasih');
      const lama = db.prepare('SELECT * FROM koreksi_sasih WHERE tanggal=?').get(b.tanggal);
      db.prepare(`INSERT INTO koreksi_sasih (tanggal,tp,sasih,alasan,oleh) VALUES (?,?,?,?,?)
        ON CONFLICT(tanggal) DO UPDATE SET tp=excluded.tp, sasih=excluded.sasih,
        alasan=excluded.alasan, oleh=excluded.oleh, diubah=datetime('now')`)
        .run(b.tanggal, b.tp || null, b.sasih || null, b.alasan || '', oleh);
      catat('koreksi_sasih', b.tanggal, lama ? 'ubah' : 'tambah', lama, b, oleh);
      return json(res, { ok: true });
    }
    if (p.startsWith('/api/koreksi-sasih/') && req.method === 'DELETE') {
      const t = p.split('/')[3];
      const lama = db.prepare('SELECT * FROM koreksi_sasih WHERE tanggal=?').get(t);
      if (!lama) return galat(res, 'Koreksi tidak ditemukan', 404);
      db.prepare('DELETE FROM koreksi_sasih WHERE tanggal=?').run(t);
      catat('koreksi_sasih', t, 'hapus', lama, null, oleh);
      return json(res, { ok: true });
    }

    /* ================= penilaian ================= */
    if (p === '/api/penilaian' && req.method === 'POST') {
      const b = await badan(req);
      if (!TGL.test(b.tanggal || '')) return galat(res, 'Tanggal harus YYYY-MM-DD');
      if (!['ngaben', 'pawiwahan'].includes(b.jenis)) return galat(res, 'Jenis harus ngaben/pawiwahan');
      if (!['ayu', 'ala'].includes(b.sisi)) return galat(res, 'Sisi harus ayu/ala');
      const taraf = +b.taraf;
      if (!(taraf >= 0 && taraf <= 4)) return galat(res, 'Taraf harus 0-4');
      const lama = db.prepare('SELECT * FROM penilaian WHERE tanggal=? AND jenis=? AND sisi=?')
        .get(b.tanggal, b.jenis, b.sisi);
      db.prepare(`INSERT INTO penilaian (tanggal,jenis,sisi,taraf,teks,oleh) VALUES (?,?,?,?,?,?)
        ON CONFLICT(tanggal,jenis,sisi) DO UPDATE SET taraf=excluded.taraf, teks=excluded.teks,
        oleh=excluded.oleh, diubah=datetime('now')`)
        .run(b.tanggal, b.jenis, b.sisi, taraf, b.teks || '', oleh);
      catat('penilaian', `${b.tanggal}/${b.jenis}/${b.sisi}`, lama ? 'ubah' : 'tambah', lama, b, oleh);
      return json(res, { ok: true });
    }
    if (p.startsWith('/api/penilaian/') && req.method === 'DELETE') {
      const [, , , t, jenis, sisi] = p.split('/');
      const lama = db.prepare('SELECT * FROM penilaian WHERE tanggal=? AND jenis=? AND sisi=?').get(t, jenis, sisi);
      if (!lama) return galat(res, 'Penilaian tidak ditemukan', 404);
      db.prepare('DELETE FROM penilaian WHERE tanggal=? AND jenis=? AND sisi=?').run(t, jenis, sisi);
      catat('penilaian', `${t}/${jenis}/${sisi}`, 'hapus', lama, null, oleh);
      return json(res, { ok: true });
    }

    /* ================= catatan ================= */
    if (p === '/api/catatan' && req.method === 'POST') {
      const b = await badan(req);
      if (!TGL.test(b.tanggal || '')) return galat(res, 'Tanggal harus YYYY-MM-DD');
      if (!b.isi?.trim()) return galat(res, 'Isi catatan tidak boleh kosong');
      const r = db.prepare('INSERT INTO catatan (tanggal,isi,oleh) VALUES (?,?,?)')
        .run(b.tanggal, b.isi.trim(), oleh);
      catat('catatan', Number(r.lastInsertRowid), 'tambah', null, b, oleh);
      return json(res, { id: Number(r.lastInsertRowid) }, 201);
    }
    if (p.startsWith('/api/catatan/') && req.method === 'DELETE') {
      const id = +p.split('/')[3];
      const lama = db.prepare('SELECT * FROM catatan WHERE id=?').get(id);
      if (!lama) return galat(res, 'Catatan tidak ditemukan', 404);
      db.prepare('DELETE FROM catatan WHERE id=?').run(id);
      catat('catatan', id, 'hapus', lama, null, oleh);
      return json(res, { ok: true });
    }

    /* ================= riwayat ================= */
    if (p === '/api/riwayat')
      return json(res, db.prepare('SELECT * FROM riwayat ORDER BY id DESC LIMIT 200').all());

    /* ================= berkas klien ================= */
    if (!p.startsWith('/api/')) {
      let f = path.join(KLIEN, p === '/' ? 'index.html' : p.replace(/^\/+/, ''));
      if (!f.startsWith(KLIEN)) return galat(res, 'Terlarang', 403);
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(KLIEN, 'index.html');
      if (!fs.existsSync(f)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<h1>Tika Digital</h1><p>Antarmuka belum dibangun. Jalankan <code>npm run build</code> di folder <code>client</code>.</p>');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      return fs.createReadStream(f).pipe(res);
    }
    return galat(res, 'Alamat tidak dikenal', 404);
  } catch (e) {
    console.error(e);
    return galat(res, 'Terjadi kesalahan di peladen.', 500);
  }
});

server.listen(PORT, () => console.log(`Tika Digital siap di http://localhost:${PORT}`));
