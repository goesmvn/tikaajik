/**
 * Parser & penilai aturan keberlakuan dewasa.
 *
 * Kolom "kondisi" pada Excel berisi aturan dalam bahasa Bali, contoh:
 *   "Buda Landep Penanggal 2. Wraspati Medangkungan Purnama."
 *
 * Satu kalimat (dipisah titik) = satu alternatif. Kata-kata di dalamnya
 * digabung dengan DAN. Sebuah hari berlaku bila SALAH SATU alternatif cocok.
 *
 * Dengan mengubah teks menjadi predikat, dewasa dapat dihitung untuk tahun
 * berapa pun — tidak lagi terbatas pada tabel 2026-2045 di Excel.
 */

const SAPTAWARA = ['Redite', 'Soma', 'Anggara', 'Buda', 'Wraspati', 'Sukra', 'Saniscara'];
const PANCAWARA = ['Umanis', 'Paing', 'Pon', 'Wage', 'Keliwon'];
const WUKU = ['Sinta', 'Landep', 'Ukir', 'Kulantir', 'Tolu', 'Gumbreg', 'Wariga', 'Warigadean',
  'Julungwangi', 'Sungsang', 'Dungulan', 'Kuningan', 'Langkir', 'Medangsia', 'Pujut', 'Pahang',
  'Krulut', 'Merakih', 'Tambir', 'Medangkungan', 'Matal', 'Uye', 'Menail', 'Prangbakat', 'Bala',
  'Ugu', 'Wayang', 'Kelawu', 'Dukut', 'Watugunung'];
const ASTAWARA = ['Sri', 'Indra', 'Guru', 'Yama', 'Ludra', 'Brahma', 'Kala', 'Uma'];
const CATURWARA = ['Sri', 'Laba', 'Jaya', 'Menala'];
const EKADWI = ['Luang', 'Menga', 'Pepet'];
const TRIWARA = ['Pasah', 'Beteng', 'Kajeng'];
const SADWARA = ['Tungleh', 'Aryang', 'Urukung', 'Paniron', 'Was', 'Maulu'];
const SANGAWARA = ['Dangu', 'Jangur', 'Gigis', 'Nohan', 'Ogan', 'Erangan', 'Urungan', 'Tulus', 'Dadi'];
const DASAWARA = ['Pandita', 'Pati', 'Suka', 'Duka', 'Sri', 'Manuh', 'Manusa', 'Raja', 'Dewa', 'Raksasa'];
const SASIH = ['Kasa', 'Karo', 'Katiga', 'Kapat', 'Kalima', 'Kanem', 'Kapitu', 'Kaulu', 'Kasanga',
  'Kadasa', 'Jyestha', 'Sadha', 'Destha'];

/** Ejaan yang berbeda-beda di dalam berkas asli. */
const ALIAS = {
  Dunggulan: 'Dungulan', Kulawu: 'Kelawu', Kliwon: 'Keliwon', Klilwon: 'Keliwon',
  Wrespati: 'Wraspati', Werespati: 'Wraspati', Weraspati: 'Wraspati', Bhuda: 'Buda',
  Coma: 'Soma', Radite: 'Redite', Reditee: 'Redite', Saniscra: 'Saniscara',
  Medangkungan: 'Medangkungan', Prangbakat: 'Prangbakat', Warigadian: 'Warigadean',
  Julungwangi: 'Julungwangi', Kuningan: 'Kuningan', Umanis: 'Umanis', Paing: 'Paing',
};
const norm = (w) => ALIAS[w] || w;

const inList = (list, w) => list.find((x) => x.toLowerCase() === w.toLowerCase());

/**
 * Ubah teks kondisi menjadi daftar alternatif terstruktur.
 * Mengembalikan { alternatif:[...], takDikenali:[...] }.
 */
export function parseKondisi(teks) {
  const alternatif = [];
  const takDikenali = [];
  if (!teks) return { alternatif, takDikenali };

  for (const kalimat of String(teks).split(/[.;]/)) {
    const s = kalimat.trim();
    if (!s) continue;
    const r = {};
    let dikenali = 0;

    // "Penanggal 5", "Pangelong 12"
    let m;
    const rePen = /Penanggal\s*(\d+)/gi, rePang = /Pang?e?long\s*(\d+)/gi;
    while ((m = rePen.exec(s))) { (r.penanggal ||= []).push(+m[1]); dikenali++; }
    while ((m = rePang.exec(s))) { (r.panglong ||= []).push(+m[1]); dikenali++; }
    if (/\bPurnama\b/i.test(s)) { r.purnama = true; dikenali++; }
    if (/\bTilem\b/i.test(s)) { r.tilem = true; dikenali++; }

    // kata per kata
    const sisa = s.replace(rePen, ' ').replace(rePang, ' ');
    for (let w of sisa.split(/[\s,:/]+/)) {
      w = norm(w.replace(/[^A-Za-zÀ-ÿ]/g, '').trim());
      if (!w || w.length < 3) continue;
      if (/^(purnama|tilem|penanggal|pangelong|panglong|sasih|wuku|miwah|utawi)$/i.test(w)) continue;
      // Wuku & Sasih tetap bertipe khusus (namanya tidak bertabrakan).
      // Nama wewaran disimpan generik karena satu nama bisa dimiliki
      // beberapa sistem sekaligus (mis. 'Sri' = Astawara / Caturwara / Dasawara).
      let v;
      if ((v = inList(WUKU, w))) { (r.wuku ||= []).push(v); dikenali++; }
      else if ((v = inList(SASIH, w))) { (r.sasih ||= []).push(v); dikenali++; }
      else if ((v = inList(SAPTAWARA, w) || inList(PANCAWARA, w) || inList(CATURWARA, w) ||
                     inList(ASTAWARA, w) || inList(TRIWARA, w) || inList(SADWARA, w) ||
                     inList(SANGAWARA, w) || inList(DASAWARA, w) || inList(EKADWI, w))) {
        (r.wara ||= []).push(v); dikenali++;
      }
      else takDikenali.push(w);
    }
    if (dikenali > 0) alternatif.push(r);
  }
  return { alternatif, takDikenali };
}

const cocokSalahSatu = (daftar, nilai) =>
  !daftar || daftar.some((x) => String(nilai || '').toLowerCase().startsWith(x.toLowerCase()));

/** Apakah satu alternatif cocok dengan keterangan hari? */
export function cocokAlternatif(r, hari) {
  // Setiap nama wewaran harus cocok dengan SALAH SATU sistem wara hari itu.
  if (r.wara && !r.wara.every((w) => hari.waraSet.has(w.toLowerCase()))) return false;
  if (r.wuku && !cocokSalahSatu(r.wuku, hari.wuku)) return false;
  if (r.purnama && !hari.purnama) return false;
  if (r.tilem && !hari.tilem) return false;
  if (r.penanggal && !hari.penanggalan.some((p) => p.jenis === 'penanggal' && r.penanggal.includes(p.angka))) return false;
  if (r.panglong && !hari.penanggalan.some((p) => p.jenis === 'panglong' && r.panglong.includes(p.angka))) return false;
  if (r.sasih) {
    const idx = parseInt(String(hari.sasih).replace(/^M\./i, ''), 10);
    const nama = SASIH[idx - 1];
    if (!nama || !r.sasih.some((x) => x.toLowerCase() === nama.toLowerCase())) return false;
  }
  return true;
}

/** Apakah dewasa dengan aturan ini berlaku pada hari tersebut? */
export function berlaku(alternatif, hari) {
  return alternatif.length > 0 && alternatif.some((r) => cocokAlternatif(r, hari));
}
