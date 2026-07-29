/**
 * Lapisan penggabung: kalender + aturan + tabel Excel + koreksi peranda.
 *
 * Aturan pokok mengenai kepercayaan data:
 *   1. Koreksi rapat peranda (basis data)  — paling tinggi, selalu menang.
 *   2. Tabel Excel yang telah diaudit      — untuk 7 Juni 2026 s/d 7 Juni 2045.
 *   3. Hasil hitungan aturan               — di luar rentang itu, ditandai
 *                                            sebagai PROYEKSI, bukan kepastian.
 */
import { db } from './db.js';
import { dayInfo, gradesAt, dayIndex, isoOf, parseTP, EXCEL_RANGE, TARAF, META } from './calendar.js';
import { parseKondisi, berlaku } from './rules.js';

const E_WUKU = ['Sinta','Landep','Ukir','Kulantir','Tolu','Gumbreg','Wariga','Warigadean',
  'Julungwangi','Sungsang','Dungulan','Kuningan','Langkir','Medangsia','Pujut','Pahang',
  'Krulut','Merakih','Tambir','Medangkungan','Matal','Uye','Menail','Prangbakat','Bala',
  'Ugu','Wayang','Kelawu','Dukut','Watugunung'];
import { muatMatriksExcel } from './db.js';

const MATRIKS = muatMatriksExcel();

/** Cache aturan hasil parsing, dibuang bila dewasa disunting. */
let cacheAturan = null;
export function bersihkanCache() { cacheAturan = null; cacheTika = null; }

function aturanDewasa() {
  if (cacheAturan) return cacheAturan;
  const baris = db.prepare('SELECT * FROM dewasa WHERE aktif = 1 ORDER BY nama').all();
  cacheAturan = baris.map((d) => {
    const { alternatif, takDikenali } = parseKondisi(d.kondisi);
    return { ...d, alternatif, takDikenali };
  });
  return cacheAturan;
}

export function daftarDewasa() { return aturanDewasa(); }

const dalamExcel = (i) => i >= EXCEL_RANGE.mulai && i <= EXCEL_RANGE.sampai;

/** Dewasa yang berlaku pada satu hari, beserta asal-usul keputusannya. */
export function dewasaPadaHari(i, hari) {
  const hasil = [];
  for (const d of aturanDewasa()) {
    let berlakuHariIni = false;
    let sumber;
    if (d.asal === 'excel' && dalamExcel(i) && MATRIKS.has(d.id)) {
      berlakuHariIni = MATRIKS.get(d.id).has(i);
      sumber = 'excel';
    } else {
      berlakuHariIni = berlaku(d.alternatif, hari);
      sumber = 'aturan';
    }
    if (berlakuHariIni) {
      hasil.push({
        id: d.id, nama: d.nama, sifat: d.sifat,
        keterangan: d.keterangan, kondisi: d.kondisi, sumber,
      });
    }
  }
  return hasil;
}

/** Seluruh keterangan satu hari, sesudah koreksi peranda diterapkan. */
export function hari(tanggalISO) {
  const i = dayIndex(tanggalISO);
  const dasar = dayInfo(i);
  const nilai = gradesAt(i);

  // 1. koreksi sasih/penanggal
  const kor = db.prepare('SELECT * FROM koreksi_sasih WHERE tanggal = ?').get(tanggalISO);
  if (kor) {
    if (kor.tp) dasar.tp = kor.tp;
    if (kor.sasih) dasar.sasih = kor.sasih;
    dasar.dikoreksi = { tp: kor.tp, sasih: kor.sasih, alasan: kor.alasan, oleh: kor.oleh };
    dasar.proyeksi = false;
  }

  // 2. penilaian Ngaben / Pawiwahan
  const pen = db.prepare('SELECT * FROM penilaian WHERE tanggal = ?').all(tanggalISO);
  const kunci = { 'ngaben:ayu': 'ngabenAyu', 'ngaben:ala': 'ngabenAla',
                  'pawiwahan:ayu': 'pawiwahanAyu', 'pawiwahan:ala': 'pawiwahanAla' };
  for (const p of pen) {
    const k = kunci[`${p.jenis}:${p.sisi}`];
    if (k) nilai[k] = { taraf: p.taraf, teks: p.teks, dikoreksi: true, oleh: p.oleh };
  }

  const catatan = db.prepare('SELECT * FROM catatan WHERE tanggal = ? ORDER BY dibuat').all(tanggalISO);

  const dewasa = dewasaPadaHari(i, dasar);
  return {
    ...dasar,
    nilai,
    dewasa,
    catatan,
    dalamRentangExcel: dalamExcel(i),
    putusan: putusan(nilai),
    kesimpulan: kesimpulanDewasa(dewasa),
    yadnya: yadnyaHari(dewasa),
    daftarYadnya: YADNYA.map(({ kunci, nama, jelas }) => ({ kunci, nama, jelas })),
  };
}

/**
 * Kesimpulan lima tingkat untuk satu hari, dari seluruh dewasa yang berlaku.
 * Berbeda dari putusan() yang membaca taraf warna Ngaben/Pawiwahan bawaan Excel —
 * yang ini menimbang sifat Ayu/Ala dari daftar dewasanya.
 */
export function kesimpulanDewasa(daftar) {
  let ayu = 0, ala = 0;
  for (const d of daftar) {
    if (d.sifat === 0) ayu += 1;
    else if (d.sifat === 1) ala += 1;
    else if (d.sifat === 2) { ayu += 0.5; ala += 0.5; }
  }
  const t = tingkatDari(ayu, ala);
  return { ayu, ala, tingkat: t, nama: t ? TINGKAT[t].nama : 'Tanpa penanda', ringkas: t ? TINGKAT[t].ringkas : '–' };
}

/**
 * Rincian Panca Yadnya untuk satu hari, dari dewasa yang berlaku hari itu.
 * Berbeda dengan papan tika: di sini dewasa yang bergantung Purnama/Tilem ikut
 * terhitung, sebab tanggalnya sudah pasti. Karena itu Dewa Yadnya pun terisi.
 */
export function yadnyaHari(daftar) {
  const out = {};
  for (const y of YADNYA) out[y.kunci] = { ayu: 0, ala: 0, tingkat: 0, dewasa: [] };
  for (const d of daftar) {
    const y = yadnyaDewasa(d.keterangan);
    for (const [k, nada] of Object.entries(y)) {
      out[k][nada === 'ala' ? 'ala' : 'ayu'] += 1;
      out[k].dewasa.push({ nama: d.nama, nada });
    }
  }
  for (const y of YADNYA) {
    const o = out[y.kunci];
    o.tingkat = tingkatDari(o.ayu, o.ala);
    o.nama = o.tingkat ? TINGKAT[o.tingkat].nama : null;
  }
  return out;
}

/** Terapkan "Rule of Decision" penyusun untuk menyimpulkan mutu hari. */
export function putusan(nilai) {
  const a = Math.max(nilai.pawiwahanAyu.taraf, nilai.ngabenAyu.taraf);
  const l = Math.max(nilai.pawiwahanAla.taraf, nilai.ngabenAla.taraf);
  if (a >= 3 && l === 0) return { kode: 'sangat-baik', teks: 'Hari sangat baik — Ayu kuat, tanpa Ala' };
  if (a > 0 && l === 0) return { kode: 'baik', teks: 'Hari baik — ada Ayu, tanpa Ala' };
  if (a > l && a > 0) return { kode: 'layak', teks: 'Masih layak — Ayu lebih kuat daripada Ala' };
  if (a > 0 && a === l) return { kode: 'timbang', teks: 'Perlu pertimbangan — Ayu dan Ala seimbang' };
  if (l > a && l >= 3) return { kode: 'pantang-berat', teks: 'Sangat dipantang — Ala kuat' };
  if (l > 0) return { kode: 'pantang', teks: 'Ada pantangan — Ala lebih kuat' };
  return { kode: 'netral', teks: 'Tanpa penanda khusus' };
}

/** Ringkasan satu bulan Masehi untuk tampilan kalender. */
export function bulan(tahun, bln) {
  const jml = new Date(Date.UTC(tahun, bln, 0)).getUTCDate();
  const out = [];
  for (let t = 1; t <= jml; t++) {
    const iso = `${tahun}-${String(bln).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
    const i = dayIndex(iso);
    const dasar = dayInfo(i);
    const nilai = gradesAt(i);
    const kor = db.prepare('SELECT tp, sasih FROM koreksi_sasih WHERE tanggal = ?').get(iso);
    if (kor) { if (kor.tp) dasar.tp = kor.tp; if (kor.sasih) dasar.sasih = kor.sasih; }
    for (const p of db.prepare('SELECT * FROM penilaian WHERE tanggal = ?').all(iso)) {
      const k = { 'ngaben:ayu': 'ngabenAyu', 'ngaben:ala': 'ngabenAla',
                  'pawiwahan:ayu': 'pawiwahanAyu', 'pawiwahan:ala': 'pawiwahanAla' }[`${p.jenis}:${p.sisi}`];
      if (k) nilai[k] = { taraf: p.taraf, teks: p.teks, dikoreksi: true };
    }
    const jmlCatatan = db.prepare('SELECT COUNT(*) c FROM catatan WHERE tanggal = ?').get(iso).c;
    const dewasa = dewasaPadaHari(i, dasar);
    out.push({
      tanggal: iso, hariKe: t, indeks: i,
      saptawara: dasar.saptawara, pancawara: dasar.pancawara, wuku: dasar.wuku,
      tp: dasar.tp, sasih: dasar.sasih, proyeksi: dasar.proyeksi && !kor,
      nilai, adaCatatan: jmlCatatan > 0, putusan: putusan(nilai),
      jumlahDewasa: dewasa.length,
      kesimpulan: kesimpulanDewasa(dewasa),
      // Fase bulan: tradisional (kolom penanggalan) dan astronomis (hasil audit
      // penyusun). Keduanya dikirim supaya selisihnya kelihatan, bukan disamarkan.
      purnama: dasar.purnama, tilem: dasar.tilem,
      penanggalan: dasar.penanggalan,
      tpAstronomis: dasar.tpAstronomis,
      purnamaAstro: parseTP(dasar.tpAstronomis).some((x) => x.jenis === 'penanggal' && x.angka === 15),
      tilemAstro: parseTP(dasar.tpAstronomis).some((x) => x.jenis === 'panglong' && x.angka === 15),
    });
  }
  return out;
}

/** Cari hari baik menurut keperluan, taraf minimal, dan syarat Ala. */
export function cariHariBaik({ dari, jenis = 'pawiwahan', tarafMin = 3, tanpaAla = true, batas = 150 }) {
  const mulai = dayIndex(dari);
  const kA = jenis === 'ngaben' ? 'ngabenAyu' : 'pawiwahanAyu';
  const kL = jenis === 'ngaben' ? 'ngabenAla' : 'pawiwahanAla';
  const hasil = [];
  for (let i = mulai; hasil.length < batas && i < mulai + 366 * 25; i++) {
    const iso = isoOf(i);
    const n = gradesAt(i);
    const kor = db.prepare('SELECT * FROM penilaian WHERE tanggal = ?').all(iso);
    for (const p of kor) {
      const k = { 'ngaben:ayu': 'ngabenAyu', 'ngaben:ala': 'ngabenAla',
                  'pawiwahan:ayu': 'pawiwahanAyu', 'pawiwahan:ala': 'pawiwahanAla' }[`${p.jenis}:${p.sisi}`];
      if (k) n[k] = { taraf: p.taraf, teks: p.teks };
    }
    const A = n[kA].taraf, L = n[kL].taraf;
    if (A < tarafMin) continue;
    if (tanpaAla ? L !== 0 : !(A > L)) continue;
    const d = dayInfo(i);
    hasil.push({
      tanggal: iso, indeks: i, saptawara: d.saptawara, pancawara: d.pancawara,
      wuku: d.wuku, tp: d.tp, sasih: d.sasih, proyeksi: d.proyeksi,
      taraf: A, tarafNama: TARAF[A]?.nama, teks: n[kA].teks,
      tarafAla: L, tarafAlaNama: TARAF[L]?.nama,
    });
  }
  return hasil;
}


/* ---------------- Penilaian 5 tingkat & Panca Yadnya ---------------- */

/** Lima tingkat kesimpulan, dari paling buruk ke paling baik. */
export const TINGKAT = [
  null,
  { kode: 1, nama: 'Sangat Tidak Baik', ringkas: 'Sangat Ala' },
  { kode: 2, nama: 'Tidak Baik', ringkas: 'Ala' },
  { kode: 3, nama: 'Sedang', ringkas: 'Sedang' },
  { kode: 4, nama: 'Baik', ringkas: 'Ayu' },
  { kode: 5, nama: 'Sangat Baik', ringkas: 'Sangat Ayu' },
];

/** Panca Yadnya beserta kata kunci pengenalnya di dalam teks keterangan. */
export const YADNYA = [
  { kunci: 'dewa', nama: 'Dewa Yadnya', jelas: 'Upacara kepada Hyang Widhi — piodalan, ngenteg linggih',
    pola: /dewa\s*yadnya|piodalan|pujawali|ngenteg|palinggih|sanggah|pelinggih|bhakti ring|ngaturang bhakti/i },
  { kunci: 'pitra', nama: 'Pitra Yadnya (Ngaben)', jelas: 'Upacara kepada leluhur — ngaben, atiwa-tiwa, memukur',
    pola: /pitra\s*yadnya|ngaben|atiwa|mamukur|memukur|ngelungah|nyekah|leluhur|pengabenan/i },
  { kunci: 'rsi', nama: 'Rsi Yadnya', jelas: 'Upacara kepada pandita — madiksa, mawinten',
    pola: /rsi\s*yadnya|resi\s*yadnya|diksa|madiksa|mawinten|winten|pandita/i },
  { kunci: 'manusa', nama: 'Manusa Yadnya (Pawiwahan)', jelas: 'Upacara manusia — pawiwahan, metatah, otonan',
    pola: /manusa\s*yadnya|pawiwahan|wiwaha|nikah|perkawinan|metatah|mapandes|mapendes|mepusung|otonan|nelu bulan/i },
  { kunci: 'bhuta', nama: 'Bhuta Yadnya', jelas: 'Upacara kepada bhuta kala — caru, tawur',
    pola: /bhuta\s*yadnya|mecaru|pecaruan|caru|tawur/i },
];

const NEGATIF = /tidak baik|tan becik|nenten becik|tan wenang|ala pisan|\bala\b|kaon|pantang|jangan/i;

/**
 * Tentukan, untuk satu dewasa, yadnya mana yang disebut dan dengan nada apa.
 * Teks dipecah per kalimat lebih dulu supaya "Ayu Dewa Yadnya. Ala Ngaben."
 * tidak tertukar nadanya.
 */
export function yadnyaDewasa(teks) {
  const hasil = {};
  if (!teks) return hasil;
  for (const kalimat of String(teks).split(/[.;]/)) {
    const k = kalimat.trim();
    if (!k) continue;
    const negatif = NEGATIF.test(k);
    for (const y of YADNYA) {
      if (y.pola.test(k)) hasil[y.kunci] = negatif ? 'ala' : 'ayu';
    }
  }
  return hasil;
}

/**
 * Ubah timbunan Ayu/Ala menjadi satu dari lima tingkat.
 * Kesimpulan ini TURUNAN — hasil pembacaan otomatis atas kalimat keterangan,
 * bukan angka yang tertulis di berkas Excel.
 */
export function tingkatDari(ayu, ala) {
  if (ayu === 0 && ala === 0) return 0;           // tanpa penanda
  const r = (ayu - ala) / (ayu + ala);
  if (r <= -0.6) return 1;
  if (r <= -0.2) return 2;
  if (r < 0.2) return 3;
  if (r < 0.6) return 4;
  return 5;
}

/* ---------------- Tika Pawukon (kisi 30 wuku x 7 saptawara) ---------------- */

/**
 * Ingkel mingguan menurut aturan baku: satu nilai per wuku, berputar tiap 6 wuku
 * mulai dari Sinta. Ini BUKAN kolom "Ing. Sadina" pada Excel — yang itu siklus
 * harian 6 hari. Keduanya sistem yang berbeda dan sengaja tidak dicampur.
 */
const INGKEL = ['Wong', 'Sato', 'Mina', 'Manuk', 'Taru', 'Buku'];

/**
 * Kecenderungan kolom Ngaben & Pawiwahan bawaan Excel untuk satu posisi pawukon.
 * Penilaian itu ikut penanggalan bulan, jadi untuk satu kotak tika ia TIDAK tetap
 * — di sini dirangkum sebagai kekerapan dari seluruh kemunculannya dalam data
 * Excel yang telah diaudit (kira-kira 33 kali per kotak).
 */
function kecenderunganExcel(p) {
  const out = { ngaben: { ayu: 0, ala: 0, n: 0 }, pawiwahan: { ayu: 0, ala: 0, n: 0 } };
  for (let i = 0; i <= EXCEL_RANGE.sampai; i++) {
    if ((i + META.p0) % 210 !== p) continue;
    const g = gradesAt(i);
    out.ngaben.n++; out.pawiwahan.n++;
    if (g.ngabenAyu.taraf > 0) out.ngaben.ayu++;
    if (g.ngabenAla.taraf > 0) out.ngaben.ala++;
    if (g.pawiwahanAyu.taraf > 0) out.pawiwahan.ayu++;
    if (g.pawiwahanAla.taraf > 0) out.pawiwahan.ala++;
  }
  return out;
}

let cacheTika = null;
export function tikaPawukon() {
  if (cacheTika) return cacheTika;

  // satu hari wakil untuk tiap posisi pawukon 0..209
  const wakil = new Array(210);
  for (let i = 0; wakil.filter(Boolean).length < 210 && i < 630; i++) {
    const h = dayInfo(i);
    if (!wakil[h.pawukonDay]) wakil[h.pawukonDay] = h;
  }

  const sel = Array.from({ length: 210 }, () => []);
  const daftar = [];
  for (const d of aturanDewasa()) {
    if (!d.alternatif.length) continue;
    // Dewasa yang bergantung penanggalan bulan tidak dapat dipakukan pada
    // kisi 210 hari, sebab letaknya bergeser tiap siklus. Dikecualikan.
    const lunar = d.alternatif.some((r) => r.penanggal || r.panglong || r.purnama || r.tilem || r.sasih);
    if (lunar) continue;
    const kena = [];
    for (let p = 0; p < 210; p++) if (berlaku(d.alternatif, wakil[p])) kena.push(p);
    if (!kena.length) continue;
    daftar.push({ id: d.id, nama: d.nama, sifat: d.sifat, keterangan: d.keterangan,
      jumlah: kena.length, yadnya: yadnyaDewasa(d.keterangan) });
    for (const p of kena) sel[p].push(d.id);
  }

  // Yang mendapat lambang: cukup khas (tidak memenuhi hampir semua sel)
  // namun cukup sering agar benar-benar tampak di papan.
  const bertanda = daftar
    .filter((x) => x.jumlah >= 2 && x.jumlah <= 40)
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 14)
    .map((x, i) => ({ ...x, lambang: i }));
  const petaLambang = new Map(bertanda.map((x) => [x.id, x.lambang]));

  const namaDewasa = new Map(daftar.map((x) => [x.id, x]));
  const baris = [];
  for (let w = 0; w < 30; w++) {
    const hari = [];
    for (let k = 0; k < 7; k++) {
      const p = w * 7 + k;
      const isi = sel[p].map((id) => namaDewasa.get(id));
      // Timbunan Ayu/Ala: sifat 2 (Ayu & Ala) dihitung setengah ke masing-masing sisi.
      const nilaiUmum = { ayu: 0, ala: 0 };
      const nilaiYadnya = {};
      for (const y of YADNYA) nilaiYadnya[y.kunci] = { ayu: 0, ala: 0, dewasa: [] };
      for (const x of isi) {
        if (x.sifat === 0) nilaiUmum.ayu += 1;
        else if (x.sifat === 1) nilaiUmum.ala += 1;
        else if (x.sifat === 2) { nilaiUmum.ayu += 0.5; nilaiUmum.ala += 0.5; }
        for (const [k, nada] of Object.entries(x.yadnya || {})) {
          nilaiYadnya[k][nada === 'ala' ? 'ala' : 'ayu'] += 1;
          nilaiYadnya[k].dewasa.push({ nama: x.nama, nada });
        }
      }
      const tingkat = { umum: tingkatDari(nilaiUmum.ayu, nilaiUmum.ala) };
      for (const y of YADNYA) tingkat[y.kunci] = tingkatDari(nilaiYadnya[y.kunci].ayu, nilaiYadnya[y.kunci].ala);

      hari.push({
        pawukon: p,
        lambang: isi.filter((x) => petaLambang.has(x.id)).map((x) => petaLambang.get(x.id)).sort((a, b) => a - b),
        dewasa: isi.map((x) => ({ id: x.id, nama: x.nama, sifat: x.sifat, yadnya: x.yadnya })),
        tingkat,
        hitung: { umum: nilaiUmum, yadnya: nilaiYadnya },
        excel: kecenderunganExcel(p),
      });
    }
    baris.push({ nomor: w + 1, wuku: E_WUKU[w], ingkel: INGKEL[w % 6], hari });
  }

  cacheTika = {
    baris,
    lambang: bertanda,
    saptawara: ['Redite', 'Soma', 'Anggara', 'Buda', 'Wraspati', 'Sukra', 'Saniscara'],
    tingkatan: TINGKAT,
    yadnya: YADNYA.map(({ kunci, nama, jelas }) => ({ kunci, nama, jelas })),
    ringkas: {
      pawukonSaja: daftar.length,
      bergantungBulan: aturanDewasa().filter((d) => d.alternatif.some(
        (r) => r.penanggal || r.panglong || r.purnama || r.tilem || r.sasih)).length,
      totalTanda: sel.reduce((a, b) => a + b.length, 0),
    },
  };
  return cacheTika;
}

export { TARAF, META, EXCEL_RANGE, isoOf, dayIndex };
