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
const INGKEL_WUKU_MAP = ['Wong', 'Sato', 'Mina', 'Manuk', 'Taru', 'Buku'];

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
  out.ingkel = INGKEL_WUKU_MAP[out.wukuIndex % 6];
  // Nama penuh diambil dari tabel hasil Excel, BUKAN dari urutan tebakan —
  // fase Pancawara di berkas ini mulai dari Paing, bukan Umanis.
  out.saptawara = SAPTA_FULL[out.sapNama] || out.sapNama;
  out.pancawara = PANCA_FULL[out.panNama] || out.panNama;

  // Himpunan semua nama wara hari ini, untuk mencocokkan aturan yang
  // memakai nama ambigu (mis. 'Sri' ada di Astawara, Caturwara, dan Dasawara).
  out.waraSet = new Set(
    [out.saptawara, out.pancawara, out.wuku, out.ingkel, out.ekaNama, out.dwiNama, out.triNama,
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
  const d = new Date(START.getTime() + i * 86400000);
  const pm = getPranathaMangsa(d);
  const sapIndex = ['Redite', 'Soma', 'Anggara', 'Buda', 'Wraspati', 'Sukra', 'Saniscara'].indexOf(pw.saptawara);
  const sariningDawuh = getSariningDawuh(sapIndex >= 0 ? sapIndex : 0);
  return {
    indeks: i,
    tanggal: isoOf(i),
    ...pw,
    ...ln,
    penanggalan: parseTP(ln.tp),
    purnama: parseTP(ln.tp).some((x) => x.jenis === 'penanggal' && x.angka === 15),
    tilem: parseTP(ln.tp).some((x) => x.jenis === 'panglong' && x.angka === 15),
    pranathaMangsa: pm,
    sariningDawuh,
    ekaJalaReshi: getEkaJalaReshi(pw.wukuIndex, sapIndex >= 0 ? sapIndex : 0),
  };
}

export function getPranathaMangsa(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const md = m * 100 + d;

  if (md >= 622 && md <= 801) return { no: 1, nama: 'Shrawana', swen: '41 raina' };
  if (md >= 802 && md <= 824) return { no: 2, nama: 'BhadraPada', swen: '23 raina' };
  if (md >= 825 && md <= 917) return { no: 3, nama: 'Asuji', swen: '24 raina' };
  if (md >= 918 && md <= 1012) return { no: 4, nama: 'Kartika', swen: '25 raina' };
  if (md >= 1013 && md <= 1109) return { no: 5, nama: 'Marghasirsa', swen: '27 raina' };
  if (md >= 1110 && md <= 1122) return { no: 6, nama: 'Pausya', swen: '43 raina' };
  if (md >= 1123 || md <= 202) return { no: 7, nama: 'Magha', swen: '43 raina' };
  if (md >= 203 && md <= 229) return { no: 8, nama: 'Phalguna', swen: '26/27 raina' };
  if (md >= 230 && md <= 325) return { no: 9, nama: 'Caitra', swen: '25 raina' };
  if (md >= 326 && md <= 418) return { no: 10, nama: 'Waisyaka', swen: '24 raina' };
  if (md >= 419 && md <= 511) return { no: 11, nama: 'Jyesta', swen: '23 raina' };
  return { no: 12, nama: 'Asadha', swen: '41 raina' };
}

export function getSariningDawuh(saptawaraIndex) {
  const sarining = [
    { siang: '07.00 - 07.54 & 10.18 - 12.42', malam: '22.18 - 24.42 & 03.00 - 04.00' }, // Redite (0)
    { siang: '07.54 - 10.18', malam: '24.42 - 03.06' },                                 // Coma (1)
    { siang: '10.00 - 11.30 & 13.00 - 15.00', malam: '19.54 - 22.00 & 22.30 - 01.00' }, // Anggara (2)
    { siang: '07.34 - 08.30 & 11.30 - 12.42', malam: '22.18 - 23.30 & 02.30 - 03.00' }, // Budha (3)
    { siang: '05.30 - 07.54 & 12.42 - 14.30', malam: '20.30 - 22.18 & 03.06 - 05.30' }, // Wraspati (4)
    { siang: '08.30 - 10.18 & 16.00 - 17.30', malam: '17.30 - 19.00 & 24.42 - 02.03' }, // Sukra (5)
    { siang: '11.30 - 12.42', malam: '22.18 - 23.30' },                                 // Saniscara (6)
  ];
  return sarining[saptawaraIndex] || sarining[0];
}

const EKA_JALA_RESHI_TABLE = [
  ['Suka Pinanggih', 'Buat Suka', 'Manggih Suka', 'Buat Suka', 'Suka Pinanggih', 'Suka Pinanggih', 'Manggih Suka'], // Sinta (1)
  ['Kamaranan', 'Buat Suka', 'Kinasihan Jana', 'Wredhi Putra', 'Suka Rahayu', 'Suka Pinanggih', 'Sidha Kasobagian'], // Landep (2)
  ['Kinasihan Jana', 'Buat Suka', 'Kinasihan Jana', 'Tininggaling Suka', 'Rahayu', 'Buat Sebet', 'Buat Astawa'], // Ukir (3)
];

export function getEkaJalaReshi(wukuIndex, saptawaraIndex) {
  const row = EKA_JALA_RESHI_TABLE[wukuIndex];
  if (!row) return 'Rahayu';
  return row[saptawaraIndex] || 'Rahayu';
}

export function getDawuhKutikaLima(jamFormat) {
  // Format jamFormat: "HH:MM", misal "09:15"
  const [h, m] = jamFormat.split(':').map(Number);
  const totalMenit = h * 60 + m;

  // Kutika Lima berlaku jam 06.00 (360 menit) s/d 18.00 (1080 menit)
  if (totalMenit < 360 || totalMenit >= 1080) {
    return { rentang: 'Malam / Luar Kutika Lima', dawuh: 'Wengi', dewa: 'Malam', sifat: 'Waktu malam hari' };
  }

  let dawuhNama = '';
  let dewaList = [];
  let startMenit = 0;

  if (totalMenit >= 360 && totalMenit < 510) { // 06.00 - 08.30 (Dawuh I)
    dawuhNama = 'Dawuh I (Pisan) - 06.00 s/d 08.30';
    dewaList = ['Maheswara', 'Kala', 'Shri', 'Brahma', 'Wisnu'];
    startMenit = 360;
  } else if (totalMenit >= 510 && totalMenit < 660) { // 08.30 - 11.00 (Dawuh II)
    dawuhNama = 'Dawuh II (Kalih) - 08.30 s/d 11.00';
    dewaList = ['Wisnu', 'Maheswara', 'Kala', 'Shri', 'Brahma'];
    startMenit = 510;
  } else if (totalMenit >= 660 && totalMenit < 780) { // 11.00 - 13.00 (Dawuh III)
    dawuhNama = 'Dawuh III (Tiga) - 11.00 s/d 13.00';
    dewaList = ['Brahma', 'Wisnu', 'Maheswara', 'Kala', 'Shri'];
    startMenit = 660;
  } else if (totalMenit >= 780 && totalMenit < 930) { // 13.00 - 15.30 (Dawuh IV)
    dawuhNama = 'Dawuh IV (Kaping Pat) - 13.00 s/d 15.30';
    dewaList = ['Shri', 'Brahma', 'Wisnu', 'Maheswara', 'Kala'];
    startMenit = 780;
  } else { // 15.30 - 18.00 (Dawuh V)
    dawuhNama = 'Dawuh V (Kaping Lima) - 15.30 s/d 18.00';
    dewaList = ['Kala', 'Shri', 'Brahma', 'Wisnu', 'Maheswara'];
    startMenit = 930;
  }

  const offsetMenit = totalMenit - startMenit;
  const dewaIndex = Math.floor(offsetMenit / 10) % dewaList.length;
  const dewaPelindung = dewaList[dewaIndex];

  let sifat = '';
  if (dewaPelindung === 'Maheswara' || dewaPelindung === 'Shri') {
    sifat = 'Sangat baik (becik) untuk upacara keagamaan pribadi, kemasyarakatan, maupun kenegaraan.';
  } else if (dewaPelindung === 'Brahma') {
    sifat = 'Berenergi panas. Baik untuk membakar bata/gerabah, namun buruk untuk bertanam.';
  } else if (dewaPelindung === 'Wisnu') {
    sifat = 'Berenergi basah. Sangat baik untuk menanam padi, memohon hujan, atau mendirikan lumbung air.';
  } else {
    sifat = 'Berenergi keras/buruk. Dikhususkan untuk Bhuta Yadnya (caru) atau pertahanan fisik.';
  }

  return {
    dawuh: dawuhNama,
    dewa: dewaPelindung,
    sifat
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
