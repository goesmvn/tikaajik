# Sumber & Atribusi Data

## Penyusun data

Seluruh data kalender di dalam repositori ini berasal dari berkas
**Semara Tika Digital.xlsx**, susunan:

> **Ida Bagus Ngurah Semara Manuaba**
> Grya Apuan, Bangli, Bali

Data tersebut merupakan hasil **audit manual sepanjang satu siklus Metonic
(19 tahun, 7 Juni 2026 – 7 Juni 2045)**, mencakup 220 ala-ayuning dewasa,
6.941 hari, dan 63.932 penanda harian, lengkap dengan penilaian Ngaben dan
Pawiwahan bergradasi warna beserta panduan penafsirannya.

Ini adalah karya intelektual dan warisan budaya. Mohon **cantumkan atribusi
kepada penyusun** pada setiap penggunaan, penyalinan, maupun pengembangan
lanjutan, dan hubungi beliau lebih dahulu untuk pemakaian komersial.

## Berkas turunan di repositori ini

| Berkas | Isi |
|---|---|
| `server/data/excel-source.json` | Hasil ekstraksi mentah dari Excel |
| `server/data/engine.json` | Tabel Pawukon 210 hari + tabel lunar 6.940 hari |
| `server/data/dewasa-seed.json` | 220 dewasa: nama, aturan, keterangan, hari berlaku |

Ketiganya adalah **turunan langsung** dari berkas Excel di atas, bukan karya
pengembang aplikasi.

## Yang dihitung sendiri oleh aplikasi

- **Wewaran & Wuku** — algoritmik, siklus Pawukon 210 hari.
- **Ingkel mingguan** pada Papan Tika — aturan baku, bukan dari Excel.
- **Kesimpulan lima tingkat** (Sangat Tidak Baik … Sangat Baik) dan
  **penggolongan Panca Yadnya** — hasil pembacaan otomatis atas kalimat
  keterangan. Ini **turunan**, bukan angka yang tertulis di Excel, dan
  sewaktu-waktu dapat dikoreksi lewat menu Kelola Data.

## Rujukan pembanding

Aturan keberlakuan dewasa telah dibandingkan dengan
<https://www.kalenderbali.org/referensialaayu.php>:

> **220 dari 220 nama cocok, dan 220 aturan sama persis (100%).**

Teks keterangannya berbeda susunan kalimat pada 51 dewasa (berkas Excel
memakai campuran bahasa Bali, rujukan memakai bahasa Indonesia), tetapi
tidak ada satu pun aturan keberlakuan yang berselisih.

Tidak ada teks dari situs tersebut yang disalin ke dalam repositori ini;
rujukan hanya dipakai untuk memeriksa silang.

### Catatan: *Karna Sula* dan *Karnasula*

Keduanya adalah **dewasa yang berlainan**, dan sama-sama ada pada kedua sumber:

| | Karna Sula | Karnasula |
|---|---|---|
| Dasar | Penanggalan bulan | Pawukon (Saptawara + Wuku) |
| Sifat | Ala | Ayu & Ala |
| Arti | Tidak baik untuk perkawinan, membeli ternak, rapat, berbicara | Baik untuk membuat kentongan, bajra, kendang; tidak baik membangun tempat tidur dan mengadakan rapat |

Perbedaan penulisan namanya (berspasi dan tidak) memang halus, sehingga mudah
tertukar bila nama dicocokkan dengan mengabaikan spasi.
