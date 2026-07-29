# Tika Digital — Wariga Bali

Aplikasi padewasan Bali berbasis React + peladen bersama.

> ### Sumber data
> Seluruh data kalender bersumber dari berkas **Semara Tika Digital.xlsx**
> susunan **Ida Bagus Ngurah Semara Manuaba** (Grya Apuan, Bangli) — hasil
> audit manual sepanjang satu siklus Metonic, 19 tahun.
> Mohon cantumkan atribusi kepada beliau pada setiap penggunaan.
> Rincian selengkapnya: [SUMBER.md](SUMBER.md).

## Menjalankan

```bash
cd tika-app
node server/index.js
```

Lalu buka <http://localhost:8787>. Peladen tidak memerlukan pemasangan apa pun
(memakai `node:http` dan `node:sqlite` bawaan Node 22+).

Untuk mengembangkan tampilan:

```bash
cd client && npm install && npm run dev     # http://localhost:5173
cd client && npm run build                  # bangun ulang untuk peladen
```

## Masuk & peran

Saat pertama dijalankan, peladen membuat akun pengelola dengan **kata sandi acak
yang hanya ditampilkan sekali di layar** — tidak ada sandi bawaan yang bisa
ditebak. Segera masuk dan gantilah; aplikasi memaksa penggantian sebelum bisa
dipakai.

| Peran | Wewenang |
|---|---|
| **Pembaca** | hanya melihat kalender |
| **Peranda** | menyunting dewasa, koreksi sasih, penilaian, catatan |
| **Pengelola** | semua di atas + mengatur pengguna |

Membaca kalender terbuka untuk umum; setiap perubahan wajib masuk.
Setel `TIKA_WAJIB_MASUK=1` bila seluruh isi ingin ditutup dari umum.

### Pengaturan lingkungan

| Variabel | Guna |
|---|---|
| `PORT` | nomor porta (bawaan 8787) |
| `TIKA_DB` | letak berkas basis data |
| `TIKA_HTTPS=1` | pasang bendera `Secure` pada cookie — **wajib** bila dilayani lewat HTTPS |
| `TIKA_ASAL_DEV` | asal peladen pengembangan yang diizinkan, mis. `http://localhost:5173` |
| `TIKA_WAJIB_MASUK=1` | tutup pembacaan dari umum |

### Cara pengamanan

- Sandi disimpan sebagai **scrypt + garam acak** per pengguna, dibandingkan
  dengan `timingSafeEqual`. Sandi asli tidak pernah tersimpan.
- Token sesi acak 32 bita; yang disimpan di basis data hanya **ringkasan
  SHA-256**-nya, sehingga bocornya basis data tidak langsung memberi sesi hidup.
- Cookie **httpOnly + SameSite=Strict**, tidak lewat URL maupun `localStorage`.
- Percobaan masuk dibatasi **8 kali gagal → jeda 15 menit** per alamat.
- Pesan gagal masuk sengaja disamakan agar tidak membocorkan nama pengguna mana
  yang terdaftar.
- Mengganti sandi atau peran **mengakhiri seluruh sesi** pengguna itu.
- Pengelola aktif terakhir tidak dapat diturunkan, dinonaktifkan, atau dihapus.
- CORS tidak pernah `*`; hanya asal pengembangan yang disebut tegas.
- Kolom `oleh` pada riwayat **diambil dari sesi, bukan dari kiriman klien**,
  sehingga atribusi tidak dapat dipalsukan.

## Sampai tahun berapa berlaku?

| Bagian | Jangkauan | Dasar |
|---|---|---|
| Wewaran & Wuku | **Tanpa batas** | Siklus Pawukon 210 hari, dihitung sendiri |
| Sasih & Penanggal | Tanpa batas, **ditandai proyeksi** di luar 2026–2045 | Pengulangan satu siklus Metonic (6.940 hari) |
| Dewasa | Tanpa batas | Tabel Excel s/d 2045, lalu dihitung dari aturan tertulis |

### Bukti kesahihan mesin Pawukon

Tabel 210 hari diturunkan dari 33 siklus penuh dalam Excel dan diuji ulang
terhadap seluruh 6.941 hari: **tidak ada satu pun konflik**. Karena itu wewaran
dan wuku berlaku untuk tahun mana pun tanpa perkiraan.

### Mengapa Sasih ditandai "proyeksi"

Berkas Excel memuat tepat satu siklus Metonic yang telah diaudit manual.
Terbukti berulang — hari ke-0 dan hari ke-6940 sama persis (Panglong 7,
Sasih 12, Pertithi Awidya). Proyeksi mengulang siklus itu, namun penetapan
sesungguhnya — terutama **Nampih Sasih**, Purnama, dan Tilem — tetap wewenang
rapat peranda. Hasil rapat dimasukkan lewat **Kelola Data → Koreksi Sasih**
dan akan menimpa perhitungan otomatis.

## Catatan kejujuran mengenai data sumber

Parser aturan diuji terhadap 63.932 penanda harian asli:

- **147 dari 220** dewasa cocok sempurna
- presisi **83,8%**, recall **94,9%**

Selisihnya bukan berasal dari parser, melainkan dari **ketidaksesuaian di dalam
Excel sendiri** — beberapa dewasa memiliki aturan tertulis yang tidak sejalan
dengan tabel hariannya. Contoh:

| Dewasa | Aturan tertulis | Hari yang sebenarnya ditandai |
|---|---|---|
| Kala Muncrat | Soma **Pon** Merakih | Soma **Paing** Merakih |
| Wredhi Guna | Buda Wage Penanggal 5 Kasa | Redite Paing, Penanggal 6/10 |

Selama masih di dalam rentang Excel hal ini tidak berpengaruh, karena tabel
harian yang dipakai. Untuk tahun-tahun berikutnya aturannyalah yang dihitung —
karena itu perbaikan sebaiknya ditetapkan lewat rapat dan dimasukkan pada menu
Kelola Data.

## Rancangan antarmuka

Ditujukan bagi peranda berusia 50 tahun ke atas:

- latar terang berkontras tinggi, bukan tema gelap berhuruf tipis
- pengatur ukuran huruf (18–27 px), tersimpan di peramban
- warna **selalu** berpasangan dengan tulisan — kotak hijau selalu bertuliskan
  "AYU" beserta nama tarafnya, tidak pernah mengandalkan warna semata
- sasaran klik minimal 3 rem

## Struktur

```
server/
  index.js            peladen + seluruh API
  lib/calendar.js     mesin Pawukon & lunar
  lib/rules.js        parser aturan dewasa
  lib/service.js      penggabung: Excel + aturan + koreksi
  lib/db.js           skema SQLite + riwayat perubahan
  data/engine.json    tabel kalender hasil ekstraksi Excel
client/               antarmuka React (Vite)
validate-rules.mjs    uji ulang parser terhadap data Excel
```

## Urutan kepercayaan data

1. **Koreksi rapat peranda** (basis data) — selalu menang
2. **Tabel Excel yang diaudit** — 7 Juni 2026 s/d 7 Juni 2045
3. **Hasil hitungan aturan** — di luar itu, ditandai proyeksi

Data asli Excel tidak pernah ditimpa. Dewasa bawaan Excel hanya dapat
dinonaktifkan, bukan dihapus, dan seluruh perubahan tercatat pada tabel
`riwayat`.
