/**
 * Modul Tambahan Wariga (Dawuh, Kutika, Atiwa-tiwa, Eka Jala Reshi)
 * Berdasarkan spesifikasi pengetahuan/buku pedanda aan.md
 */

// 1. Panca Dawuh (Pembagian 12 jam siang: 06.00 - 18.00)
export function getPancaDawuh(jamDecimal) {
  if (jamDecimal < 6 || jamDecimal >= 18) return null;
  const idx = Math.min(4, Math.floor((jamDecimal - 6) / 2.4));
  const dawuhs = [
    { nama: 'Dharma Wangsa / Kertha', sifat: 'Sangat Baik (Sabda Ayu, asing kinarsan kasidan)' },
    { nama: 'Bhima / Pati', sifat: 'Sangat Keras (Tan kenin malelungan)' },
    { nama: 'Aruna / Arjuna / Ketara', sifat: 'Baik (Anandur ayu, mangrangsuk guna)' },
    { nama: 'Nakula / Peta', sifat: 'Buruk (Mawak peteng, keni ujar ala)' },
    { nama: 'Sadewa / Sunia', sifat: 'Misterius (Mawak sunia, kalepasan)' }
  ];
  return dawuhs[idx];
}

// 2. Kutika Lima Matriks Dewa harian
const KUTIKA_MATRIX = [
  ['Iswara', 'Brahma', 'Mahadeva', 'Vishnu', 'Rudra'],   // Tgl/Panglong 1, 6, 11
  ['Brahma', 'Mahadeva', 'Vishnu', 'Rudra', 'Iswara'],   // Tgl/Panglong 2, 7, 12
  ['Mahadeva', 'Vishnu', 'Rudra', 'Iswara', 'Brahma'],   // Tgl/Panglong 3, 8, 13
  ['Vishnu', 'Rudra', 'Iswara', 'Brahma', 'Mahadeva'],   // Tgl/Panglong 4, 9, 14
  ['Rudra', 'Iswara', 'Brahma', 'Mahadeva', 'Vishnu']    // Tgl/Panglong 5, 10, 15
];

export function getKutikaLima(jamDecimal, angkaTanggalAtauPanglong) {
  if (jamDecimal < 6 || jamDecimal >= 18) return null;
  const partisi = Math.min(4, Math.floor((jamDecimal - 6) / 2.4));
  const baris = (angkaTanggalAtauPanglong - 1) % 5;
  const dewa = KUTIKA_MATRIX[baris][partisi];
  return { partisi: partisi + 1, dewa };
}

// 3. Validasi Atiwa-tiwa (Pitra Yadnya)
export function checkAtiwaTiwaConstraint(wuku, saptawara, pancawara, astawara, tanggal, panglong, sasih) {
  const ingkelWong = ["Sinta", "Warigadean", "Medangsia", "Tambir", "Bala", "Ugu"];
  if (ingkelWong.includes(wuku)) {
    return { valid: false, reason: "Ingkel Wong: Pantangan Keras melakukan upacara Manusa & Pitra Yadnya." };
  }
  const sasihForbidden = [4, 5, 6, 8, 9, 10, 11, 12];
  if (sasihForbidden.includes(Number(sasih))) {
    return { valid: false, reason: `Sasih Terlarang: Sasih ${sasih} dilarang melakukan Atiwa-tiwa.` };
  }
  if ([1, 6, 8, 9, 14].includes(tanggal) || [1, 6, 8, 9, 14].includes(panglong)) {
    return { valid: false, reason: "Tanggal/Panglong Terlarang (Pati Paten)." };
  }
  if (["Dungulan", "Kuningan", "Langkir", "Pujut", "Watugunung"].includes(wuku)) {
    return { valid: false, reason: `Wuku Terlarang: Wuku ${wuku} dilarang keras untuk Atiwa-tiwa.` };
  }
  if (saptawara === 'Redite' && pancawara === 'Umanis') {
    return { valid: false, reason: "Redite Umanis: Atma tiba ring kawah (Roh jatuh ke kawah neraka)." };
  }
  if (saptawara === 'Anggara' && astawara === 'Ludra') {
    return { valid: false, reason: "Anggara nuju Rudra: Pitra tiba ring api." };
  }
  if (saptawara === 'Anggara' && astawara === 'Yama') {
    return { valid: false, reason: "Anggara nuju Yama: Pitra tiba ring kawah." };
  }
  if (saptawara === 'Sukra' && (pancawara === 'Keliwon' || pancawara === 'Pon')) {
    return { valid: false, reason: "Kala Gotongan / Semut Sedulur: Dangerous for moving corpse." };
  }
  return { valid: true, reason: "Ayu Atiwa-tiwa (Aman untuk pengabuan jenazah)." };
}

// 4. Amretha Masaning Sasih
const AMRETHA_SASIH = {
  1: { tgl: 10, ket: 'saraja karya ayu' },
  2: { tgl: 7, ket: 'amretha masa' },
  3: { tgl: 9, ket: 'ayu' },
  4: { jenis: 'purnama', ket: 'seraja karya ayu' },
  5: { jenis: 'tilem', ket: 'nandur sarwa bungkah ayu' },
  6: { tgl: 8, ket: 'amretha masa' },
  7: { tgl: 13, ket: 'amretha masa' },
  8: { tgl: 2, ket: 'ayu' },
  9: { tgl: 6, ket: 'ayu' },
  10: { tgl: 4, ket: 'saraja karya ayu' },
  11: { tgl: 5, ket: 'aworing desa ayu' },
  12: { tgl: 1, ket: 'ayu' }
};

export function getAmrethaMasaningSasih(sasih, jenisPenanggalan, angka) {
  const rule = AMRETHA_SASIH[Number(sasih)];
  if (!rule) return null;
  if (rule.jenis && rule.jenis === jenisPenanggalan) return rule.ket;
  if (rule.tgl && jenisPenanggalan === 'penanggal' && rule.tgl === angka) return rule.ket;
  return null;
}
