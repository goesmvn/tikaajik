/**
 * Mesin kalender Bali.
 *
 * Dua bagian dengan sifat berbeda:
 *
 * 1. PAWUKON (wewaran + wuku) — murni algoritmik, siklus 210 hari.
 *    Tabel 210-hari diturunkan dari 33 siklus penuh dalam berkas Excel
 *    dan terbukti konsisten tanpa satu pun konflik. Berlaku untuk tahun
 *    mana pun, ke depan maupun ke belakang, tanpa perkiraan.
 *
 * 2. SASIH / PENANGGAL / PERTITHI — mengikuti peredaran bulan.
 *    Berkas Excel memuat tepat satu siklus Metonic (6.940 hari) yang telah
 *    diaudit manual oleh penyusun. Terbukti berulang: hari ke-0 dan hari
 *    ke-6940 sama persis. Di luar rentang Excel nilainya DIPROYEKSIKAN
 *    dengan mengulang siklus itu, dan selalu ditandai `proyeksi: true`
 *    karena penetapan sesungguhnya adalah wewenang rapat peranda.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const E = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/engine.json'), 'utf8'));

export const META = E.meta;
const MET = E.meta.metonic;      // 6940
const P0 = E.meta.p0;            // posisi pawukon pada hari ke-0
const EXCEL_DAYS = E.meta.excelDays;

const [sy, sm, sd] = E.meta.start.split('-').map(Number);
export const START = new Date(Date.UTC(sy, sm - 1, sd));
const MS = 86400000;

/** Ubah 'YYYY-MM-DD' menjadi indeks hari (boleh negatif / melebihi Excel). */
export function dayIndex(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - START.getTime()) / MS);
}
/** Kebalikannya: indeks hari menjadi 'YYYY-MM-DD'. */
export function isoOf(i) {
  return new Date(START.getTime() + i * MS).toISOString().slice(0, 10);
}
const mod = (n, m) => ((n % m) + m) % m;

/**
 * Buang seluruh angka urip & tanda baca di ekor label.
 * 'Beteng. 4' -> 'Beteng' ; 'Sri.6, 4' -> 'Sri' ; 'laba 5.' -> 'Laba'
 */
const stripUrip = (s) => {
  if (s == null) return null;
  let t = String(s).trim();
  let prev;
  do { prev = t; t = t.replace(/[\s.,]*\d+[\s.,]*$/, '').trim(); } while (t !== prev);
  t = t.replace(/[.,\s]+$/, '').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
};
/** Ambil angka urip pertama, mis. 'Beteng. 4' -> 4. */
const uripOf = (s) => {
  if (s == null) return null;
  const m = /(\d+)/.exec(String(s));
  return m ? +m[1] : null;
};
/** Singkatan Pancawara & Saptawara di berkas asli -> nama penuh. */
const PANCA_FULL = { Kel: 'Keliwon', Um: 'Umanis', Pai: 'Paing', Pon: 'Pon', Wag: 'Wage' };
const SAPTA_FULL = { Red: 'Redite', Som: 'Soma', Ang: 'Anggara', Bud: 'Buda', Wrs: 'Wraspati', Suk: 'Sukra', San: 'Saniscara' };

const WARA_KEYS = ['eka', 'dwi', 'tri', 'catur', 'sad', 'asta', 'sanga', 'ingsad', 'dasa', 'sap', 'pan', 'uku'];

/** Unsur Pawukon pada indeks hari tertentu — eksak, tanpa batas tahun. */
export function pawukonAt(i) {
  const p = mod(P0 + i, 210);
  const out = { pawukonDay: p, wukuIndex: Math.floor(p / 7) };
  for (const k of WARA_KEYS) {
    const raw = E.pawukon[k][p];
    out[k] = raw;                       // label apa adanya dari Excel
    out[k + 'Nama'] = stripUrip(raw);   // tanpa angka urip
    out[k + 'Urip'] = uripOf(raw);
  }
  out.wuku = E.wukuNames[out.wukuIndex];
  // Nama penuh diambil dari tabel hasil Excel, BUKAN dari urutan tebakan —
  // fase Pancawara di berkas ini mulai dari Paing, bukan Umanis.
  out.saptawara = SAPTA_FULL[out.sapNama] || out.sapNama;
  out.pancawara = PANCA_FULL[out.panNama] || out.panNama;

  // Himpunan semua nama wara hari ini, untuk mencocokkan aturan yang
  // memakai nama ambigu (mis. 'Sri' ada di Astawara, Caturwara, dan Dasawara).
  out.waraSet = new Set(
    [out.saptawara, out.pancawara, out.wuku, out.ekaNama, out.dwiNama, out.triNama,
     out.caturNama, out.sadNama, out.astaNama, out.sangaNama, out.ingsadNama, out.dasaNama]
      .filter(Boolean).map((x) => x.toLowerCase())
  );
  return out;
}

/** Penanggal/Panglong, Sasih, dan Pertithi. Ditandai bila hasil proyeksi. */
export function lunarAt(i) {
  const j = mod(i, MET);
  const proyeksi = i < 0 || i >= EXCEL_DAYS;
  return {
    tp: E.lunar.tp[j] || '',
    sasih: E.lunar.ss[j] || '',
    tpAstronomis: E.lunar.atp[j] || '',
    sasihAstronomis: E.lunar.ass[j] || '',
    pertithi: E.lunar.pertiti[j] || '',
    proyeksi,
  };
}

/** Penilaian Ngaben & Pawiwahan bawaan Excel (taraf warna + teksnya). */
export function gradesAt(i) {
  const j = mod(i, MET);
  const g = E.grades, t = E.gtexts;
  const mapT = (val) => {
    if (!val) return 0;
    // Map Excel 1-4 to 9 steps:
    // 1 -> 2 (Nistaning Madya)
    // 2 -> 4 (Madyaning Nista)
    // 3 -> 6 (Madyaning Utama)
    // 4 -> 8 (Utamaning Madya)
    if (val === 1) return 2;
    if (val === 2) return 4;
    if (val === 3) return 6;
    if (val === 4) return 8;
    return val;
  };
  return {
    ngabenAyu: { taraf: mapT(g.na[j]), teks: t.na[j] || '' },
    ngabenAla: { taraf: mapT(g.nl[j]), teks: t.nl[j] || '' },
    pawiwahanAyu: { taraf: mapT(g.pa[j]), teks: t.pa[j] || '' },
    pawiwahanAla: { taraf: mapT(g.pl[j]), teks: t.pl[j] || '' },
    proyeksi: i < 0 || i >= EXCEL_DAYS,
  };
}

/** Uraian penanggal: {jenis:'penanggal'|'panglong', angka} — bisa dua bila hari ganda. */
export function parseTP(tp) {
  const out = [];
  const a = /Penanggal\s*([\d\\/]+)/i.exec(tp || '');
  const b = /Pang?long\s*([\d\\/]+)/i.exec(tp || '');
  const nums = (s) => String(s).split(/[\\/]/).map((x) => parseInt(x, 10)).filter(Number.isFinite);
  if (a) for (const n of nums(a[1])) out.push({ jenis: 'penanggal', angka: n });
  if (b) for (const n of nums(b[1])) out.push({ jenis: 'panglong', angka: n });
  return out;
}

/** Gabungan seluruh keterangan satu hari. */
export function dayInfo(i) {
  const pw = pawukonAt(i);
  const ln = lunarAt(i);
  return {
    indeks: i,
    tanggal: isoOf(i),
    ...pw,
    ...ln,
    penanggalan: parseTP(ln.tp),
    purnama: parseTP(ln.tp).some((x) => x.jenis === 'penanggal' && x.angka === 15),
    tilem: parseTP(ln.tp).some((x) => x.jenis === 'panglong' && x.angka === 15),
  };
}

export const TARAF = [
  null,
  { nama: 'Nistaning Nista', dasar: 'Wewaran Minor' },
  { nama: 'Nistaning Madya', dasar: 'Wewaran Utama' },
  { nama: 'Nistaning Utama', dasar: 'Kombinasi Wewaran' },
  { nama: 'Madyaning Nista', dasar: 'Wewaran + Wuku' },
  { nama: 'Madyaning Madya', dasar: 'Wewaran + Wuku + Tanggal/Panglong' },
  { nama: 'Madyaning Utama', dasar: 'Wewaran + Wuku + Tanggal/Panglong + Sasih' },
  { nama: 'Utamaning Nista', dasar: 'Wewaran + Wuku + Tanggal/Panglong + Sasih + Dauh' },
  { nama: 'Utamaning Madya', dasar: 'Wewaran + Wuku + Tanggal/Panglong + Sasih + Dauh + Sanghyang Trio Dasa Saksi' },
  { nama: 'Utamaning Utama', dasar: 'Gabungan Aspek Paling Utama' },
];
export const EXCEL_RANGE = { mulai: 0, sampai: EXCEL_DAYS - 1, metonic: MET };
