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

    // Dauh
    if (/\bDauh\b/i.test(s)) { r.dauh = true; dikenali++; }

    // Sanghyang Trio Dasa Saksi
    if (/\b(sanghyang\s+trio\s+dasa\s+saksi|trio\s+dasa\s+saksi|sanghyang\s+saksi|saksi)\b/i.test(s)) {
      r.saksi = true;
      dikenali++;
    }

    // kata per kata
    const sisa = s.replace(rePen, ' ').replace(rePang, ' ');
    for (let w of sisa.split(/[\s,:/]+/)) {
      w = norm(w.replace(/[^A-Za-zÀ-ÿ]/g, '').trim());
      if (!w || w.length < 3) continue;
      if (/^(purnama|tilem|penanggal|pangelong|panglong|sasih|wuku|miwah|utawi|dauh|saksi|sanghyang|trio|dasa)$/i.test(w)) continue;
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

/**
 * BOBOT ATURAN — dasar hukum "alah dening alah".
 *
 * Penyusun menetapkan bahwa warna pada kolom Ngaben/Pawiwahan menandai berapa
 * banyak keluarga parameter Wariga yang mengunci suatu hari:
 *
 *   1 Hitam  — Wewaran saja
 *   2 Coklat — Wewaran + Wuku
 *   3 Hijau  — Wewaran + Wuku + Tanggal/Panglong
 *   4 Biru   — Wewaran + Wuku + Tanggal/Panglong + Sasih
 *
 * Logika yang sama diterapkan di sini kepada aturan tiap dewasa, sehingga
 * seluruh dewasa memperoleh bobot pada skala yang sama. Ini PERLUASAN atas
 * kaidah penyusun — beliau menuliskannya untuk kolom warna, bukan untuk tiap
 * dewasa — namun terbukti selaras: makin tinggi bobotnya, makin jarang dewasa
 * itu muncul (rata-rata 154 → 104 → 67 hari per 2.100 hari untuk bobot 1→2→3).
 */
export function bobotAlternatif(r) {
  let b = 0;
  // Wewaran minor/utama/gabungan (Nistaning Nista, Nistaning Madya, Nistaning Utama)
  if (r.wara) {
    const hasUtama = r.wara.some((w) => ['Redite','Soma','Anggara','Buda','Wraspati','Sukra','Saniscara','Umanis','Paing','Pon','Wage','Keliwon'].map((x) => x.toLowerCase()).includes(w.toLowerCase()));
    b = Math.max(b, hasUtama ? 2 : 1);
    if (r.wara.length > 1) b = Math.max(b, 3);
  }
  // Wewaran + Wuku -> Madyaning Nista (4)
  if (r.wuku) b = Math.max(b, 4);
  // Penanggal/Panglong -> Madyaning Madya (5)
  if (r.penanggal || r.panglong || r.purnama || r.tilem) b = Math.max(b, 5);
  // Sasih -> Madyaning Utama (6)
  if (r.sasih) b = Math.max(b, 6);
  // Dauh -> Utamaning Nista (7)
  if (r.dauh) b = Math.max(b, 7);
  // Saksi -> Utamaning Madya (8)
  if (r.saksi) b = Math.max(b, 8);
  return b;
}

/**
 * Logika Alahing Sasih: Evaluasi sengketa waktu antara hari baik (ayu) & buruk (ala)
 * Hierarki Kekuatan: Wewaran < Wuku < Tanggal/Panglong < Sasih < Dawuh < Sanghyang Trayo Dhasa Saksi
 */
export function selesaikanSengketaAlahingSasih(aturanAyu, aturanAla, infoHari) {
  const bobotAyu = bobotPadaHari(aturanAyu, infoHari);
  const bobotAla = bobotPadaHari(aturanAla, infoHari);

  if (bobotAyu > bobotAla) {
    return { hasil: 'Ayu', alasan: `Hari Baik (bobot ${bobotAyu}) mengalahkan Hari Buruk (bobot ${bobotAla}) berdasarkan Alahing Sasih.` };
  } else if (bobotAla > bobotAyu) {
    return { hasil: 'Ala', alasan: `Hari Buruk (bobot ${bobotAla}) mengalahkan Hari Baik (bobot ${bobotAyu}) berdasarkan Alahing Sasih.` };
  } else {
    return { hasil: 'Netral', alasan: `Hari Baik dan Hari Buruk memiliki bobot kekuatan seimbang (${bobotAyu}).` };
  }
}

/**
 * Modul Penampihaning Sasih (Koreksi Sasih Astronomis nuju Purnama)
 */
export function koreksiPenampihaningSasih(sasihNama, saptawaraNama, purnama) {
  if (!purnama) return sasihNama;

  const s = sasihNama.toLowerCase();
  const w = saptawaraNama.toLowerCase();

  if (s === 'shrawana' && w === 'buda') return 'Asadha';
  if (s === 'asuji' && w === 'saniscara') return 'Bhadrapada';
  if (s === 'marghasirsa' && w === 'redite') return 'Pausya';
  if ((s === 'magha' || s === 'caitra') && w === 'anggara') return 'Phalguna';
  if (s === 'jyestha' && w === 'redite') return 'Waisyaka';

  return sasihNama;
}

/** Bobot satu dewasa = alternatif terkuat yang dimilikinya. */
export function bobotAturan(alternatif) {
  return alternatif.length ? Math.max(...alternatif.map(bobotAlternatif)) : 0;
}

/** Bobot alternatif yang benar-benar cocok pada hari tertentu. */
export function bobotPadaHari(alternatif, hari) {
  let b = 0;
  for (const r of alternatif) if (cocokAlternatif(r, hari)) b = Math.max(b, bobotAlternatif(r));
  return b;
}

const RANGDA_TIGA_WUKU = ['Julungwangi', 'Pujut', 'Pahang', 'Krulut', 'Prangbakat', 'Bala'];
const INGKEL_WONG_WUKU = ['Sinta', 'Warigadean', 'Medangsia', 'Tambir', 'Bala', 'Ugu'];

export function checkDewasaPawiwahan(infoHari) {
  const wuku = infoHari.wuku;
  const warnings = [];

  if (RANGDA_TIGA_WUKU.includes(wuku)) {
    warnings.push({ jenis: 'Rangda Tiga', pesan: `Wuku ${wuku} termasuk Rangda Tiga (pantangan keras perkawinan)` });
  }
  if (INGKEL_WONG_WUKU.includes(wuku)) {
    warnings.push({ jenis: 'Ingkel Wong', pesan: `Wuku ${wuku} terkena Ingkel Wong (pantangan manusia/perkawinan)` });
  }

  return {
    layak: warnings.length === 0,
    warnings
  };
}

export function checkDewasaAtiwaTiwa(infoHari) {
  const wuku = infoHari.wuku;
  const warnings = [];

  if (['Dungulan', 'Kuningan', 'Langkir', 'Pujut'].includes(wuku)) {
    warnings.push({ jenis: 'Wuku Terlarang', pesan: `Wuku ${wuku} dilarang keras untuk Atiwa-tiwa/Kremasi` });
  }
  if (INGKEL_WONG_WUKU.includes(wuku)) {
    warnings.push({ jenis: 'Ingkel Wong', pesan: `Wuku ${wuku} terkena Ingkel Wong (pantangan pengabenan/atiwa-tiwa)` });
  }

  return {
    layak: warnings.length === 0,
    warnings
  };
}
