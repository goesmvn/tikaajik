# Dokumen Spesifikasi Teknis & Knowledge Base: Wariga Engine & Kalender Bali (v2)
## Berdasarkan Kitab Buka Dewasa Bali & Kriya Patra Upacara Manusa Yadnya (Halaman 1 - 118)

> **Catatan Integrasi Sistem:** Dokumen ini dikompilasi sebagai spesifikasi teknis dan basis data formal untuk arsitek perangkat lunak, database developer, dan developer engine kalender tradisional Bali. Semua aturan penanggalan, nilai *urip*, *genah*, *dewata*, matriks *Kala*, serta *Aed Dudonan Manusa Yadnya* (Lifecycle Rituals) bersumber langsung secara otentik dari naskah naskah terkait.

## DAFTAR ISI SYSTEM KNOWLEDGE
1. [MODUL 1: Dasar Penghitungan Wewaran & Wuku](#modul-1-dasar-penghitungan-wewaran--wuku)
2. [MODUL 2: Struktur Tanggal, Panglong, Sasih & Pranatha Mangsa](#modul-2-struktur-tanggal-panglong-sasih--pranatha-mangsa)
3. [MODUL 3: Logika Hierarki Alahing Sasih](#modul-3-logika-hierarki-alahing-sasih)
4. [MODUL 4: Sistem Dawuh & Kutika Lima (Sistem Jam Harian)](#modul-4-sistem-dawuh--kutika-lima-sistem-jam-harian)
5. [MODUL 5: Matriks Dewasa & Larangan Atiwa-tiwa (Pitra Yadnya)](#modul-5-matriks-dewasa--larangan-atiwa-tiwa-pitra-yadnya)
6. [MODUL 6: Matriks Dewasa & Larangan Pewarangan (Pawiwahan)](#modul-6-matriks-dewasa--larangan-pewarangan-pawiwahan)
7. [MODUL 7: Matriks Dewasa Manusa Yadnya Lainnya & Ngadakang Pesamuan](#modul-7-matriks-dewasa-manusa-yadnya-lainnya--ngadakang-pesamuan)
8. [MODUL 8: Matriks Dewasa Dewa Yadnya & Larangannya](#modul-8-matriks-dewasa-dewa-yadnya--larangannya)
9. [MODUL 9: Matriks Dewasa Pertanian, Mamacul & Larangan Tanah](#modul-9-matriks-dewasa-pertanian-mamacul--larangan-tanah)
10. [MODUL 10: Matriks Dewasa Ngewangun Ghraha & Sikut Ramuan](#modul-10-matriks-dewasa-ngewangun-ghraha--sikut-ramuan)
11. [MODUL 11: Matriks Dewasa Pamedal, Penyengker & Sistem Ingkel](#modul-11-matriks-dewasa-pamedal-penyengker--sistem-ingkel)
12. [MODUL 12: Matriks Dewasa Mekarya Sarana (Daftar 58 Kala Alat)](#modul-12-matriks-dewasa-mekarya-sarana-daftar-58-kala-alat)
13. [MODUL 13: Eka Jala Reshi (30 Wuku x 7 Hari Ramalan)](#modul-13-eka-jala-reshi-30-wuku-x-7-hari-ramalan)
14. [MODUL 14: Pratiti Sambut Padha, Palalintangan, Pararasan & Palelindon](#modul-14-pratiti-sambut-padha-palalintangan-pararasan--palelindon)
15. [MODUL 15: Kriya Patra Upacara Manusa Yadnya (Halaman 107 - 118)](#modul-15-kriya-patra-upacara-manusa-yadnya-halaman-107---118)
16. [MODUL 16: Skema Database & Implementasi Kode Engine](#modul-16-skema-database--implementasi-kode-engine)

## MODUL 1: Dasar Penghitungan Wewaran & Wuku

Sistem Wewaran (siklus hari) dan Wuku adalah pilar utama penghitungan Wariga. Setiap hari memiliki nilai numerik (*Urip*), arah mata angin (*Genah*), dan Dewa Pelindung (*Dewata*).

### 1.1 Tabel Konfigurasi Wewaran (Eka Wara hingga Dhasa Wara)
| Wara | Nama Hari | Urip | Genah (Arah) | Dewata Pelindung |
| :--- | :--- | :--- | :--- | :--- |
| **Eka Wara** | Luang | 1 | Aya Baya | Sanghyang Eka Taya / Sanghyang Licin |
| **Dwi Wara** | Menga | 5 | Purwa (Timur) | Sanghyang Ketu |
| | Pepet | 7 | Pascima (Barat) | Sanghyang Rabu |
| **Tri Wara** | Pasah / Dora | 9 | Daksina (Selatan) | Sanghyang Cika |
| | Beteng / Waya | 4 | Uttara (Utara) | Sanghyang Wacika |
| | Kajeng / Biantara | 7 | Pascima (Barat) | Sanghyang Manacika |
| **Catur Wara**| Sri | 6 | Uttara (Utara) | Bhagawan Bregu |
| | Laba | 5 | Purwa (Timur) | Bhagawan Kanwa |
| | Jaya | 9 | Daksina (Selatan) | Bhagawan Janaka |
| | Mandala | 7 | Pascima (Barat) | Bhagawan Narada |
| **Panca Wara**| Umanis | 5 | Purwa (Timur) | Sanghyang Korsika |
| | Pahing | 9 | Daksina (Selatan) | Sanghyang Garga / Dewa Brahma |
| | Pon | 7 | Pascima (Barat) | Sanghyang Metri / Dewa Mahadewa |
| | Wage | 4 | Uttara (Utara) | Sanghyang Kurusya / Dewa Wisnu |
| | Kliwon | 8 | Madya (Tengah) | Sanghyang Pretanjala / Dewa Siwa |
| **Sad Wara** | Tungleh | 7 | Pascima (Barat) | Sanghyang Indra |
| | Aryang | 6 | Ersania (Timur Laut) | Sanghyang Baruna |
| | Urukung | 5 | Purwa (Timur) | Sanghyang Kwera |
| | Paniron | 8 | Agneya (Tenggara) | Sanghyang Bayu |
| | Was | 9 | Daksina (Selatan) | Sanghyang Bajra |
| | Maulu | 3 | Nairiti (Barat Daya) | Sanghyang Erawana |
| **Sapta Wara**| Redite (Minggu) | 5 | Purwa (Timur) | Sanghyang Bhaskara |
| | Coma (Senin) | 4 | Uttara (Utara) | Sanghyang Candra |
| | Anggara (Selasa) | 3 | Nairiti (Barat Daya) | Sanghyang Anggara |
| | Budha (Rabu) | 7 | Pascima (Barat) | Sanghyang Udaka |
| | Wraspati (Kamis) | 8 | Agneya (Tenggara) | Sanghyang Sura Guru |
| | Sukra (Jumat) | 6 | Ersania (Timur Laut) | Sanghyang Bregu |
| | Saniscara (Sabtu) | 9 | Daksina (Selatan) | Sanghyang Wasurama |
| **Astha Wara**| Sri | 6 | Ersania (Timur Laut) | Bhatari Giri Putri |
| | Indra | 5 | Purwa (Timur) | Sanghyang Indra |
| | Guru | 8 | Agneya (Tenggara) | Sanghyang Guru |
| | Yama | 9 | Daksina (Selatan) | Sanghyang Yama |
| | Rudra | 3 | Nairiti (Barat Daya) | Sanghyang Rudra |
| | Brahma | 7 | Pascima (Barat) | Sanghyang Brahma |
| | Kala | 1 | Wayabya (Barat Laut) | Sanghyang Kalantaka |
| | Uma | 4 | Uttara (Utara) | Sanghyang Uma |
| **Sangha Wara**| Dangu | 5 | Purwa (Timur) | Bhuta Urungan |
| | Jangur | 6 | Ersania (Timur Laut) | Bhuta Pataka |
| | Gigis | 8 | Agneya (Tenggara) | Bhuta Jirek |
| | Nohan | 1 | Wayabya (Barat Laut) | Bhuta Raregek |
| | Ogan | 8 | Madya (Tengah) | Bhuta Jingkrak |
| | Erangan | 3 | Nairiti (Barat Daya) | Bhuta Jabung |
| | Urungan | 7 | Pascima (Barat) | Bhuta Kenyeng |
| | Tulus | 9 | Daksina (Selatan) | Sanghyang Saraswathi |
| | Dadi | 4 | Uttara (Utara) | Sanghyang Dharma |
| **Dhasa Wara**| Pandita | 5 | Purwa (Timur) | Sanghyang Aruna |
| | Pati | 7 | Pascima (Barat) | Sanghyang Kala |
| | Suka | 10 | Madya (Tengah) | Sanghyang Semara |
| | Duka | 4 | Uttara (Utara) | Sanghyang Durga |
| | Sri | 6 | Ersania (Timur Laut) | Sanghyang Bhasundari |
| | Manuh | 2 | Wayabya (Barat Laut) | Sanghyang Kala Lupa |
| | Manusa | 3 | Nairiti (Barat Daya) | Sanghyang Suksma Jati |
| | Raja | 8 | Agneya (Tenggara) | Sanghyang Kala Tangis |
| | Dewa | 9 | Daksina (Selatan) | Sanghyang Sambu |
| | Raksasa | 1 | Waya Baya (Barat Laut)| Sanghyang Kala Kopa |

### 1.2 Tabel Konfigurasi 30 Wuku
| No | Nama Wuku | Urip | Genah (Arah) | Dewata Pelindung |
|---|---|---|---|---|
| 1 | Sinta | 7 | Pascima (Barat) | Sanghyang Yama Dipati |
| 2 | Landep | 1 | Wayabya (Barat Laut) | Sanghyang Maha Dewa |
| 3 | Ukir | 4 | Uttara (Utara) | Sanghyang Maha Yekti |
| 4 | Kulantir | 6 | Ersania (Timur Laut) | Sanghyang Langsar |
| 5 | Tolu | 5 | Purwa (Timur) | Sanghyang Bhayu |
| 6 | Gumbreg | 8 | Agneya (Tenggara) | Sanghyang Candra |
| 7 | Wariga | 9 | Daksina (Selatan) | Sanghyang Semara |
| 8 | Warigadean | 3 | Nairiti (Barat Daya) | Sanghyang Maha Reshi |
| 9 | Julungwangi | 7 | Pascima (Barat) | Sanghyang Sambhu |
| 10 | Sungsang | 1 | Wayabya (Barat Laut) | Sanghyang Ghana |
| 11 | Dungulan | 4 | Uttara (Utara) | Sanghyang Kamajaya |
| 12 | Kuningan | 6 | Ersania (Timur Laut) | Sanghyang Indra |
| 13 | Langkir | 5 | Purwa (Timur) | Sanghyang Kala |
| 14 | Medangsia | 8 | Agneya (Tenggara) | Sanghyang Brahma |
| 15 | Pujut | 9 | Daksina (Selatan) | Sanghyang Guritna |
| 16 | Pahang | 3 | Nairiti (Barat Daya) | Sanghyang Tantra |
| 17 | Krulut | 7 | Pascima (Barat) | Sanghyang Wisnu |
| 18 | Merakih | 1 | Wayabya (Barat Laut) | Sanghyang Suranghana |
| 19 | Tambir | 4 | Uttara (Utara) | Sanghyang Shiwa |
| 20 | Medangkungan | 6 | Ersania (Timur Laut) | Sanghyang Basuki |
| 21 | Matal | 5 | Purwa (Timur) | Bhagawan Sakri |
| 22 | Uye | 8 | Agneya (Tenggara) | Sanghyang Kwera |
| 23 | Menail | 9 | Daksina (Selatan) | Sanghyang Citra Gotra |
| 24 | Prangbakat | 3 | Nairiti (Barat Daya) | Bhagawan Bisma |
| 25 | Bala | 7 | Pascima (Barat) | Sanghyang Dhurga |
| 26 | Ugu | 1 | Wayabya (Barat/Tenggara) | Sanghyang Singajalma |
| 27 | Wayang | 4 | Uttara (Utara) | Dewi Shri |
| 28 | Kulawu | 6 | Ersania (Timur Laut) | Sanghyang Sedana |
| 29 | Dukut | 5 | Purwa (Timur) | Sanghyang Baruna |
| 30 | Watugunung | 8 | Agneya (Tenggara) | Sanghyang Anantaboga |

## MODUL 2: Struktur Tanggal, Panglong, Sasih & Pranatha Mangsa

Siklus bulan dan orbit bumi menentukan umur sasih serta pembagian pranatha mangsa.

### 2.1 Konfigurasi Usia Sasih & Rashi (Zodiak)
| No | Nama Sasih (Bali / Tradisional) | Usia Hari | Rashi Padanan |
| :--- | :--- | :--- | :--- |
| 1 | Shrawana / Kasa | 30 | Singha (Singa) |
| 2 | Bhadrapada / Karo | 30 | Kania (Deha / Virgo) |
| 3 | Asuji / Ketiga | 30 | Tula (Dacin / Libra) |
| 4 | Kartika / Kapat | 31 | Wercika (Teledu / Scorpio) |
| 5 | Marghasirsa / Kelima | 30 | Dhanu (Panah / Sagittarius) |
| 6 | Pausya / Kenem | 30 | Makara (Gajah Mina / Capricorn) |
| 7 | Magha / Kepitu | 30 | Kumbha (Jun / Aquarius) |
| 8 | Phalguna / Kawulu | 31 | Mina (Ulam / Pisces) |
| 9 | Caitra / Kesanga | 31 | Mesha (Kambing / Aries) |
| 10 | Waishaka / Kedasa | 30 | Weresabha (Kebo / Taurus) |
| 11 | Jyestha / Jesta | 30 | Mithuna (Anak Kembar / Gemini) |
| 12 | Asadha / Sadha | 30 | Karka (Udang / Cancer) |

### 2.2 Siklus Pranatha Mangsa (Pembagian Musim Astronomis Tradisional)
| No | Nama Mangsa | Rentang Hari (Swennyane) | Konversi Kalender Masehi (Rentang Tanggal) |
|---|---|---|---|
| I | Shrawana | 41 raina | 22 Juni - 1 Agustus |
| II | BhadraPada | 23 raina | 2 Agustus - 24 Agustus |
| III | Asuji | 24 raina | 25 Agustus - 17 September |
| IV | Kartika | 25 raina | 18 September - 12 Oktober |
| V | Marghasirsa | 27 raina | 13 Oktober - 9 November |
| VI | Pausya | 43 raina | 10 November - 22 November |
| VII | Magha | 43 raina | 23 November - 2 Februari |
| VIII | Phalguna | 26 / 27 raina | 3 Februari - 28/29 Februari |
| IX | Caitra | 25 raina | 1 Maret - 25 Maret |
| X | Waisyaka | 24 raina | 26 Maret - 18 April |
| XI | Jyesta | 23 raina | 19 April - 11 Mei |
| XII | Asadha | 41 raina | 12 Mei - 21 Juni |

## MODUL 3: Logika Hierarki Alahing Sasih

Logika penyelesaian sengketa waktu (*dewasa conflict resolution*) apabila terdapat kombinasi hari baik (*dewasa ayu*) dan hari buruk (*dewasa ala*) dihitung menggunakan prioritas **Alahing Sasih**.

### 3.1 Aturan Hierarki Otoritas Waktu
Semakin bawah posisi suatu unsur, maka ia memiliki kekuatan mengalahkan (*kakwasan / kawenangan*) unsur di atasnya:

1. **Wewaran** dikalahkan oleh (**alah dening**) **Wuku**.
2. **Wuku** dikalahkan oleh (**alah dening**) **Tanggal/Panglong**.
3. **Tanggal/Panglong** dikalahkan oleh (**alah dening**) **Sasih**.
4. **Sasih** dikalahkan oleh (**alah dening**) **Dawuh**.
5. **Dawuh** dikalahkan oleh (**alah dening**) **Sanghyang Trayo Dhasa Saksi**.

### 3.2 Modul Penampihaning Sasih (Sasih Koreksi)
Sistem engine harus mengoreksi pembacaan sasih apabila nuju Purnama/Panglong bertepatan dengan kondisi berikut:
* **Shrawana (I)** nuju Budha Purnama -> menjadi sasih **Asadha (XII)**.
* **Asuji (III)** nuju Saniscara Purnama -> menjadi sasih **Bhadrapada (II)**.
* **Margha Sirsa (V)** nuju Redite Purnama -> menjadi sasih **Pausya (VI)**.
* **Magha (VII)** miwah **Caitra (IX)** nuju Anggara Purnama -> menjadi sasih **Phalguna (VIII)**.
* **Jyestha (XI)** nuju Redite Purnama -> menjadi sasih **Waisyaka (X)**.

## MODUL 4: Sistem Dawuh & Kutika Lima (Sistem Jam Harian)

Setiap 1 hari (24 jam) dibagi menjadi waktu siang (*raina*) 12 jam dan malam (*wengi*) 12 jam. Untuk kebutuhan aplikasi kalender, jam harian dikelompokkan ke dalam sub-sistem berikut:

### 4.1 Dawuh Kutika Lima (Jam Pembagian Waktu Tradisional)
Digunakan untuk mendeteksi dewa pelindung dan sifat waktu jam tertentu:

1. **Dawuh I (Pisan) - Jam 06.00 s/d 08.30:**
   * Urutan dewa per 10 menit bergilir: Maheswara, Kala, Shri, Brahma, Wisnu, Maheswara, Kala, Shri, Brahma, Wisnu, Maheswara, Kala, Shri, Brahma, Wisnu.
2. **Dawuh II (Kalih) - Jam 08.30 s/d 11.00:**
   * Urutan dewa bergilir: Wisnu, Maheswara, Kala, Shri, Brahma, Wisnu, Maheswara, Kala, Shri, Brahma, Wisnu, Maheswara.
3. **Dawuh III (Tiga) - Jam 11.00 s/d 13.00:**
   * Urutan dewa bergilir: Brahma, Wisnu, Maheswara, Kala, Shri, Brahma, Wisnu, Maheswara, Kala, Shri, Brahma, Wisnu, Maheswara, Kala, Shri.
4. **Dawuh IV (Kaping Pat) - Jam 13.00 s/d 15.30:**
   * Urutan dewa bergilir: Shri, Brahma, Wisnu, Maheswara, Kala, Shri.
5. **Dawuh V (Kaping Lima) - Jam 15.30 s/d 18.00:**
   * Urutan dewa bergilir: Kala, Shri, Brahma, Wisnu, Maheswara, Kala, Shri, Brahma, Wisnu, Maheswara, Kala, Shri, Brahma, Wisnu, Maheswara.

### 4.2 Aturan Sifat Waktu Berdasarkan Dewa Pelindung Jam
* **Maheswara & Shri:** Sangat baik (*becik*) digunakan untuk upacara keagamaan berskala pribadi, kemasyarakatan, maupun kenegaraan.
* **Brahma:** Waktu berenergi panas, baik untuk membakar bata, menembak/membakar citakan tanah, namun buruk untuk bertanam.
* **Wisnu:** Waktu berenergi basah, sangat baik untuk menanam padi, memohon hujan, atau mendirikan lumbung air.
* **Kala:** Waktu berenergi keras/buruk, dikhususkan untuk melangsungkan Bhuta Yadnya (caru) atau pertahanan fisik.

### 4.3 Sarining Dawuh (Jam Emas Presisi per Hari)
Aplikasi harus memunculkan notifikasi jam emas untuk memulai pekerjaan berdasarkan hari berikut:
* **Redite (Minggu):** Siang: 07.00 - 07.54 & 10.18 - 12.42. Malam: 22.18 - 24.42 & 03.00 - 04.00.
* **Coma (Senin):** Siang: 07.54 - 10.18. Malam: 24.42 - 03.06.
* **Anggara (Selasa):** Siang: 10.00 - 11.30 & 13.00 - 15.00. Malam: 19.54 - 22.00 & 22.30 - 01.00.
* **Budha (Rabu):** Siang: 07.34 - 08.30 & 11.30 - 12.42. Malam: 22.18 - 23.30 & 02.30 - 03.00.
* **Wraspati (Kamis):** Siang: 05.30 - 07.54 & 12.42 - 14.30. Malam: 20.30 - 22.18 & 03.06 - 05.30.
* **Sukra (Jumat):** Siang: 08.30 - 10.18 & 16.00 - 17.30. Malam: 17.30 - 19.00 & 24.42 - 02.03.
* **Saniscara (Sabtu):** Siang: 11.30 - 12.42. Malam: 22.18 - 23.30.

## MODUL 5: Matriks Dewasa & Larangan Atiwa-tiwa (Pitra Yadnya)

Matriks penjadwalan upacara Atiwa-tiwa/Kremasi (Halaman 1 - 10):

### 5.1 Tika Dewasa Atiwa-tiwa (Kombinasi Wuku x Sapta Wara)
Wuku berikut pada Sapta Wara bertanda **X** adalah hari baik (*Ayu Atiwa-tiwa*). Jika bernilai `Ingkel Wong`, maka otomatis dilarang keras:

| Wuku | Red | Com | Ang | Bud | Wra | Suk | San | Keterangan |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Sinta |  |  |  |  |  |  |  | Ingkel Wong (Dilarang) |
| Landep | X |  |  |  |  |  |  |  |
| Ukir | X | X | X |  | X | X | X |  |
| Kulantir |  |  |  |  | X |  |  |  |
| Tolu |  |  |  |  |  | X | X |  |
| Gumbreg |  |  |  |  |  |  |  |  |
| Wariga |  |  |  |  |  |  | X |  |
| Warigadean | X |  |  |  |  |  |  | Ingkel Wong (Dilarang) |
| Julungwangi | X |  |  | X |  |  |  |  |
| Sungsang |  |  | X |  |  |  |  |  |
| Dungulan |  |  |  |  |  |  |  |  |
| Kuningan |  |  |  |  |  |  |  |  |
| Langkir |  |  |  |  |  |  |  |  |
| Medangsia | X |  |  | X | X |  |  | Ingkel Wong (Dilarang) |
| Pujut |  |  |  |  |  |  |  |  |
| Pahang |  |  | X |  |  | X |  |  |
| Krulut | X |  |  |  |  | X |  |  |
| Merakih | X |  | X |  |  | X |  |  |
| Tambir |  |  |  |  |  |  |  | Ingkel Wong (Dilarang) |
| Medangkungan |  |  |  |  | X |  |  |  |
| Matal |  |  |  |  |  | X | X |  |
| Uye |  |  |  |  | X |  |  |  |
| Menail | X |  |  |  |  |  |  |  |
| Prangbakat | X |  |  |  |  |  |  |  |
| Bala |  |  |  |  |  |  |  | Ingkel Wong (Dilarang) |
| Ugu |  | X |  |  |  |  |  |  |
| Wayang | X |  |  | X |  |  |  |  |
| Kulawu |  |  |  |  | X | X |  |  |
| Dukut | X | X |  | X |  |  |  |  |
| Watugunung |  |  |  |  |  |  |  |  |

### 5.2 Hari Baik Spesifik (Bacakan Atiwa-tiwa Ayu)
* **Redite Wage Landep (Tgl 2, 6, 8):** Wangke Ayu Swarga (roh langsung mendapat surga).
* **Budha Paing Landep (Tgl 1, Pang 1):** Swarga Menga, Kawah Maineb (surga terbuka, neraka tutup).
* **Anggara Pon Ukir (Tgl 11):** Atma diterima langsung oleh Bhatara Mahadewa ring surga.
* **Wraspati Kliwon Ukir (Tgl 6, 11):** Bhatara Siwa asih anampi Atma, suka sugih rendah.
* **Coma Umanis Tolu (Tgl 10):** Swargan Bhatara Iswara nampi Atma, caru kawenangan.
* **Sukra Paing Gumbreg (Tgl 1, 5, 7):** Atma mulih swargan Wisnu Loka.
* **Redite Umanis Warigadean (Tgl 5, 7):** Luwih, wenang sang Pandita (khusus upacara kematian Pendeta).

### 5.3 Aturan Larangan Keras (Atiwa-tiwa Ala)
Engine wajib memblokir tanggal upacara jika masuk dalam kondisi berikut:
1. **Tanggal/Panglong Ping:** 1, 6, 8, 9, 14.
2. **Sasih Terlarang:** IV (Kartika), V (Margasirsa), VI (Pausya), VIII (Phalguna), IX (Caitra), X (Waisyaka), XI (Jyestha), XII (Asadha).
3. **Wuku Terlarang:** Dungulan, Kuningan, Langkir, Pujut.
4. **Hari Mati Paten:** Sungsang nuju Indra, Tambir nuju Shri, Klau nuju Uma, Wariga nuju Kala, Pahang nuju Yama, Bala nuju Brahma, Kulantir nuju Rudra, Langkir nuju Uma, Uye nuju Guru, Sinta nuju Rudra.
5. **Gagak Anungsang Pati:** Tanggal 9 & Panglong 1, 6, 14 (roh akan tetap memikul cacat/kaunggahang mala).
6. **Was Penganten:** Dua unsur 'Was' dalam Sad Wara seminggu pada hari Redite & Saniscara ring Wuku Tolu, Dungulan, Krulut, Menail, Dukut.

## MODUL 6: Matriks Dewasa & Larangan Pewarangan (Pawiwahan)

Matriks penjadwalan upacara pernikahan (Pewarangan / Pawiwahan / Awiwaha) (Halaman 11 - 20):

### 6.1 Tika Awiwaha (Kombinasi Wuku x Sapta Wara)
Tanda **X** menunjukkan hari yang diperbolehkan untuk upacara pernikahan:

| Wuku | Red | Com | Ang | Bud | Wra | Suk | San | Keterangan |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Sinta |  |  |  |  |  |  |  | Ingkel Wong (Dilarang) |
| Landep | X | X |  | X | X |  |  |  |
| Ukir | X |  |  |  |  | X |  |  |
| Kulantir |  | X |  |  |  |  |  |  |
| Tolu |  | X |  | X |  |  |  |  |
| Gumbreg |  |  |  | X |  | X |  |  |
| Wariga |  |  |  |  |  |  |  |  |
| Warigadean |  |  |  |  |  |  |  | Ingkel Wong (Dilarang) |
| Julungwangi | X |  |  |  |  | X |  | Rangda Tiga |
| Sungsang |  | X |  | X |  | X |  |  |
| Dungulan |  |  |  |  | X | X |  |  |
| Kuningan |  |  |  |  |  |  |  | Was Penganten, Tanpa Guru |
| Langkir |  |  |  |  |  |  |  |  |
| Medangsia |  |  |  | X | X |  |  | Ingkel Wong (Dilarang) |
| Pujut |  |  |  |  |  |  |  | Rangda Tiga |
| Pahang |  |  |  |  |  |  |  | Rangda Tiga |
| Krulut | X | X |  |  |  |  |  | Rangda Tiga |
| Merakih | X |  |  | X |  | X |  |  |
| Tambir |  |  |  |  |  |  |  |  |
| Medangkungan | X | X |  | X |  |  |  | Ingkel Wong (Dilarang) |
| Matal |  |  |  | X |  |  |  |  |
| Uye |  | X |  |  | X | X |  |  |
| Menail |  |  |  |  |  |  |  | Was Penganten |
| Prangbakat |  |  |  |  |  |  |  | Rangda Tiga |
| Bala |  |  |  |  |  |  |  | Ingkel Wong / Rangda Tiga |
| Ugu | X |  |  |  | X |  |  | Ingkel Wong (Dilarang) |
| Wayang | X |  |  |  |  | X |  |  |
| Kulawu |  | X |  |  |  |  |  |  |
| Dukut |  |  |  | X |  |  |  |  |
| Watugunung |  |  |  | X | X | X |  |  |

### 6.2 Bacakan Pewarangan Ayu
1. **Tanggal Ayu:** 1, 2, 3, 5, 7, 10, 13.
2. **Hari Ametha Bumi:** Coma Wage Tanggal 1 & Budha Pon Tanggal 10.
3. **Hari Derman Bagia:** Coma Tanggal 2, 3, 5, 12.
4. **Hari Kama Jaya:** Budha Tanggal 2, 3, 5, 12.
5. **Hari Amretha Yoga / Dewa Jaya:** Coma Tanggal 3, 5, 8.
6. **Hari Amretha Sadana:** Budha Pon Paing Tanggal 5.
7. **Hari Purna Suka:** Sukra Umanis Tanggal 15 (Purnama).

### 6.3 Aturan Larangan Pewarangan (Dewasa Ala Pernikahan)
Engine harus mengeluarkan peringatan merah jika diinput kondisi berikut:
* **Kala Mretyu:** Redite Sinta, Merakih; Coma Menail; Anggara Medangsia, Wayang; Budha Sinta; Wraspati Tolu; Sukra Julungwangi; Saniscara Medangsia.
* **Kala Temah:** Redite Medangsia, Pujut, Klawu, Dukut; Coma Sinta, Landep, Tolu, Wariga, Warigadean, Julungwangi, Langkir, Pahang, Medangkungan, Menail, Watugunung; Anggara Ukir, Sungsang, Kuningan, Krulut, Tambir; Sukra Ukir, Tolu, Julungwangi, Langkir, Pahang, Medangkungan, Menail, Watugunung; Saniscara Ukir, Medangsia, Pujut, Dukut.
* **Rangda Tiga (Dilarang Menikah):** Wuku Julungwangi, Pujut, Pahang, Krulut, Prangbakat, Bala.
* **Dina Carik:** Redite Tanggal 12; Coma Tanggal 11; Anggara Tanggal 10; Budha Tanggal 9; Wraspati Tanggal 8; Sukra Tanggal 7; Saniscara Tanggal 6.
* **Geheng Manyinget:** Redite Tanggal 14; Coma Tanggal 1, Panglong 7; Anggara Tanggal 2, 10; Budha Tanggal 10; Wraspati Tanggal 5; Sukra Tanggal 14; Saniscara Tanggal 1, 9.

## MODUL 7: Matriks Dewasa Manusa Yadnya Lainnya & Ngadakang Pesamuan

Matriks penjadwalan upacara Lifecycle Manusa Yadnya selain pernikahan serta kegiatan kolektif (Halaman 21 - 26):

### 7.1 Dewasa Metatah (Potong Gigi / Mapes)
* **Amretha Dewata:** Sukra Tanggal 12.
* **Amretha Murthi:** Budha Kliwon Tanggal 12.
* **Dhasa Amretha:** Sukra Pahing Tanggal 10.
* **Dewi Wredhi:** Sukra Wage Tanggal 10.
* **Dirga Yasa:** Budha Pon Tanggal 10.
* **Panca Wredhi:** Coma Pahing Tanggal 5.
* **Wredhi Ghuna:** Budha Wage Tanggal 5 ring Sasih Kasa.
* **Amretha Yoga (Hari emas metatah):**
  * Coma Umanis - Wuku Tolu, Medangkungan.
  * Coma Pahing - Wuku Menail.
  * Coma Pon - Wuku Ugu.
  * Coma Wage - Wuku Medangsia, Dukut.
  * Coma Kliwon - Wuku Landep, Krulut.

### 7.2 Dewasa Amelas Rare / Pama Ayu Rare (Upacara Anak)
1. **Nuju Pasah:** Hari baik memisahkan anak dari menyusu (Amelas Rare).
2. **Tutu Masih:** Redite Merakih; Coma Julungwangi, Kuningan, Langkir, Wayang; Wraspati Sinta; Sukra Tambir (baik amelas rare).
3. **Kala Pegat:** Budha Kuningan & Saniscara Ukir, Merakih.
4. **Mengunting / Mapetik (Potong Rambut Pertama Anak):** Wraspati Wage Tanggal 1; Shrawana Tanggal 5; Coma Pahing Tanggal 5.
5. **Pama Ayu Rare:** Budha Pon Tanggal 10 (anak diramalkan berumur panjang/Amanggih Dirgayusa).
6. **Cinta Manik:** Budha Sinta, Ukir, Tolu, Wariga, Julungwangi, Dungulan, Langkir, Pujut, Krulut, Tambir, Matal, Menail, Bala, Dukut.

### 7.3 Dewasa Ngadakang Pesamuan Muah Perkumpulan (Rapat/Organisasi)
* **Kala Ketemu (Sangat Baik):** Redite Sinta, Julungwangi, Pujut; Coma Ukir, Tolu, Krulut; Anggara Dungulan, Pahang, Tambir, Watugunung; Wraspati Sinta, Julungwangi, Pujut; Sukra Ukir, Krulut; Saniscara Tolu, Dungulan, Pahang, Tambir, Wayang.
* **Sri Tanggal:** Tanggal 2 (Sri), Tanggal 4 (Indra), Tanggal 9 (Guru), Tanggal 8 (Yama), Tanggal 7 (Rudra), Tanggal 6 (Brahma), Tanggal 4 (Kala).
* **Uma Tanggal 3:** Sangat baik untuk pertemuan desa, perareman, negosiasi, memancing, menjebak, dan latihan fisik.
* **Larangan Rapat (Tan Becik Ngadakang Pesamuan):**
  * Anggara Tanggal 1.
  * Hari Prangewa (Anggara Tanggal 1).
  * Dagdig Karana: Redite Tanggal/Panglong 2; Coma Tanggal/Panglong 1; Anggara Tanggal/Panglong 10; Budha Tanggal/Panglong 7; Wraspati Tanggal/Panglong 3; Saniscara Tanggal/Panglong 6.

## MODUL 8: Matriks Dewasa Dewa Yadnya & Larangannya

Matriks penjadwalan upacara suci tingkat tempat suci / pura (Dewa Yadnya) (Halaman 27 - 32):

### 8.1 Daftar Dewasa Dewa Yadnya Ayu
* **Amertha Akasa:** Anggara nuju Purnama.
* **Amertha Bhuwana:** Redite, Coma, Anggara nuju Tanggal 15 (Purnama).
* **Amertha Dadi:** Coma Tanggal 15 (Purnama).
* **Amertha Dewa:** Redite Tanggal/Panglong 6; Coma Tanggal/Panglong 7; Anggara Tanggal/Panglong 3; Budha Tanggal/Panglong 2; Wraspati Tanggal/Panglong 5; Sukra Tanggal/Panglong 1; Saniscara Tanggal/Panglong 4.
* **Amertha Dewata:** Sukra Tanggal 12.
* **Amertha Gati:** Anggara Tanggal/Panglong 2, 3, 5; Wraspati Tanggal/Panglong 1; Sukra Tanggal/Panglong 1.
* **Amertha Masa:** Sukra Tanggal 15 (Purnama).
* **Amertha Pageh:** Saniscara Tanggal 15 (Purnama).
* **Amertha Sari:** Budha Tanggal 15 (Purnama).
* **Amertha Sabhawana:** Purnama bertepatan hari Redite, tan nuju Brahma / Arang.
* **Amertha Wija:** Wraspati Tanggal 15 (Purnama).
* **Budha Suka:** Budha Kliwon Panglong 15 (Tilem) (Sangat baik untuk upacara penataran).

### 8.2 Larangan Keras Dewa Yadnya (Dewa Yadnya Terlarang)
* **Pati Paten (Sangat Buruk):** Sungsang nuju Indra, Tambir nuju Shri, Klawu nuju Uma, Wariga nuju Klawu, Pahang nuju Yama, Bala nuju Brahma, Kulantir nuju Rudra, Langkir nuju Uma, Uye nuju Guru, Sinta nuju Rudra.
* **Kala Dangastra:** Redite Kulantir, Menail; Coma Sungsang, Dukut; Anggara Medangsia, Pahang, Merakih; Budha Sinta, Medangkungan; Wraspati Dungulan; Sukra Kulantir, Dungulan, Bala, Watugunung; Saniscara Langkir, Pujut, Krulut.
* **Mati Purwaning Sasih (Hari Tanpa Kepala / Tan Petumpuk):** Sasih yang tidak memiliki Tumpek sama sekali, dilarang melangsungkan Dewa Yadnya.
* **Kala Bregala:** Coma Landep (berenergi siluman/raksasa).

## MODUL 9: Matriks Dewasa Pertanian, Mamacul & Larangan Tanah

Aturan Wariga bagi sektor pertanian, perkebunan, dan peternakan tradisional (Halaman 33 - 51):

### 9.1 Dewasa Mamacul & Pembagian Tanaman Berdasarkan Dawuh
Setiap hari memiliki kecocokan khusus terhadap jenis komoditas pertanian berdasarkan jam edarnya:
* **Redite (Minggu):** Sarwa Mabuku (tanaman berbuku seperti bambu, tebu) - Jam 07.00 - 12.00.
* **Coma (Senin):** Sarwa Bungkah (umbi-umbian seperti singkong, talas) - Jam 11.30 - 15.00.
* **Anggara (Selasa):** Sarwa Daun (sayuran daun, tembakau) - Jam 11.30 - 15.00.
* **Budha (Rabu):** Sarwa Sekar (bunga-bungaan, hiasan) - Jam 13.00 - 15.00.
* **Wraspati (Kamis):** Sarwa Wija (biji-bijian, padi, jagung) - Jam 11.00 - 13.00.
* **Sukra (Jumat):** Sarwa Phala (buah-buahan) - Jam 07.00 - 10.00.
* **Saniscara (Sabtu):** Sarwa Bun / Turus (merambat, tanaman pelindung) - Jam 09.00 - 11.00.

### 9.2 Sistem Piceket Hubungan Gender Tanah (Luh, Muani, Bancih)
Tanah memiliki gender kosmis yang memengaruhi kecocokan hari menanam:
1. **Luh (Betina):** Umanis, Wage, Ariang, Was, Coma, Sukra, Saniscara.
2. **Muani (Jantan):** Kliwon, Urukung, Maulu, Radite, Wraspati.
3. **Bancih (Hermafrodit):** Pahing, Pon, Tungleh, Paniron, Anggara, Budha.
* **Rumus Hasil Panen:**
  * Muani + Luh = Hasil sedikit (*akidik*).
  * Muani + Bancih = Hasil sedang.
  * Luh + Bancih = Hasil melimpah ruah (*becik pisan*).

### 9.3 Larangan Mengolah Tanah (Kala Sor)
Dilarang keras menggali, membajak, atau mencangkul tanah pada wuku dan hari berikut:
* **Redite:** Ukir, Julungwangi, Pujut, Matal, Wayang.
* **Coma:** Sinta, Landep, Wariga, Gumbreg, Dungulan, Medangsia, Pahang, Medangkungan, Matal, Ugu.
* **Anggara:** Sinta, Kulantir, Wariga, Julungwangi, Langkir, Medangsia, Prangbakat, Bala, Dukut.
* **Budha:** Ukir, Gumbreg, Warigadean, Kuningan, Langkir, Merakih, Menail, Prangbakat, Kulawu, Watugunung.
* **Wraspati:** Tolu, Dungulan, Krulut, Menail, Dukut.
* **Sukra:** Ukir, Kulantir, Warigadean, Sungsang, Langkir, Pahang, Merakih, Uye, Menail, Klawu.
* **Saniscara:** Ukir, Julungwangi, Pujut, Matal, Wayang.

## MODUL 10: Matriks Dewasa Ngewangun Ghraha & Sikut Ramuan

Matriks penjadwalan arsitektur dan pembangunan rumah tinggal (Halaman 52 - 64):

### 10.1 Hari Baik Pembangunan (Ngewangun Ghraha Ayu)
* **Guntur Umah:** Budha Landep, Tolu; Wraspati Medangsia, Merakih; Saniscara Medangkungan, Ugu.
* **Kala Empas Munggah:** Wage nuju Urukung (sangat baik mulai meletakkan batu pertama).
* **Kala Ghraha:** Coma Landep & Saniscara Tolu.
* **Kala Empas:** Sukra Wage Uye (peletakan fondasi utama).
* **Kala Isian:** Coma Dungulan, Krulut; Budha Watugunung.

### 10.2 Sikut Akarya Ramuan (Rasio Pengukuran Tapak Cokor & Musthi)
Dalam meramu bahan kayu tiang rumah, digunakan etangan berikut:
1. **Etangan Tapak Cokor (Pengukuran Kaki):**
   * Sisa 1 (Shri): Bagian belakang (*wewangunan ring belakang*).
   * Sisa 2 (Kitri): Pendopo depan (*akarya pendopo*).
   * Sisa 3 (Ghana): Dapur / lumbung (*akarya paon / kandang*).
   * Sisa 4 (Liyu): Bangsal tamu (*akarya bangsal tamiu*).
   * Sisa 5 (Pokal): Pintu gerbang (*akarya pamedal regot*).
2. **Etangan Pawilangan Lima Usuk (Rasio Jarak Kasau):**
   * Sisa 1 (Shri) -> Lumbung padi.
   * Sisa 2 (Wredhi) -> Kandang / Pondok hewan.
   * Sisa 3 (Naga) -> Dapur.
   * Sisa 4 (Mas) -> Bangunan belakang.
   * Sisa 5 (Perak) -> Pendopo utama.

### 10.3 Larangan Keras Konstruksi Rumah (Anangun Ghraha Terlarang)
* **Karna Sula:** Redite Tanggal/Panglong 12; Coma Tanggal/Panglong 11; Wraspati Tanggal/Panglong 9.
* **Tali Wangke:** Coma Kliwon Uye; Anggara Umanis Wayang; Budha Pahing Landep; Wraspati Pon Wariga; Sukra Wage Kuningan; Saniscara Kliwon Krulut.
* **Kala Rumpuh (Meruntuhkan Rumah):** Redite Merakih, Watugunung; Coma Julungwangi, Medangkungan; Budha Sungsang, Tambir, Bala, Ugu, Wayang.
* **Kala Buing Rau & Kala Rau:** Sangat dilarang untuk memasang atap rumah (ngeraabin).

## MODUL 11: Matriks Dewasa Pamedal, Penyengker & Sistem Ingkel

Aturan pembuatan pagar pembatas rumah, gerbang masuk, dan siklus pantangan Ingkel (Halaman 65 - 67):

### 11.1 Dewasa Pamedal & Penyengker (Tembok Pagar)
* **Kala Pager:** Wraspati Wariga (sangat baik membuat pagar rumah).
* **Sukra Pahing Tanggal 3:** Budha Kliwon Sinta (mulai membangun tembok pembatas).
* **Kala Ngadeg:** Redite Pujut, Krulut; Coma Tambir, Klawu; Sukra Kuningan, Watugunung (baik pasang tiang gerbang).
* **Kala Kutila Manik:** Kajeng Kliwon (sangat baik untuk gerbang depan pagar).
* **Kala Dangastra (Gerbang Pengaman):** Redite Kulantir, Menail; Coma Sungsang, Dukut; Anggara Medangsia, Pahang, Merakih; Budha Sinta, Medangkungan; Wraspati Dungulan; Sukra Kulantir, Dungulan, Bala, Watugunung; Saniscara Langkir, Pujut, Krulut.

### 11.2 Penentuan Letak Pintu Gerbang Berdasarkan Arah Mata Angin (Pamedal Mayunan)
Jika membangun pintu keluar masuk (*Pamedal*), hitung posisi pintu berdasarkan pembagian rasio 9 (*Sembilan Sisi/Siya*) dari kiri (*Kiwa*):
1. **Pamedal Mayunan Wetan (Menghadap Timur) - Hitung dari Utara (Kiri):**
   * Posisi 1 (Madia) -> Kasih perih, masentana (Sedang/Netral).
   * Posisi 2 (Ala Kinakbastian) -> Sulit, sering mewah (Buruk).
   * Posisi 3 (Ala Pialang) -> Wredhi guna (Buruk).
   * Posisi 4 (Wikan) -> Ala, dana teka (Buruk/Baik).
   * Posisi 5 (Brahmastana) -> Ala, kepaten (Sangat Buruk).
   * Posisi 6 (Ayu) -> Santosa, dana wredhi (Sangat Baik).
   * Posisi 7 (Sugih) -> Ayu, nohan, degdeg (Sangat Baik).
   * Posisi 8 (Ala) -> Keceda, istri jalir (Buruk).
   * Posisi 9 (Wanayusa) -> Ala, sukha, kageringan (Sedang).
2. **Pamedal Mayunan Kidul (Menghadap Selatan) - Hitung dari Timur (Kiri):**
   * Posisi 3 (Udan Mas) -> Polih bhoga, sukha (Sangat Baik).
   * Posisi 5 (Ayu) -> Sederhana, dana teka, guna kaya (Sangat Baik).
   * Posisi 8 (Rahayu) -> Santosa, teka wredhi (Sangat Baik).
3. **Pamedal Mayunan Kulon (Menghadap Barat) - Hitung dari Selatan (Kiri):**
   * Posisi 6 (Sukha) -> Ayu, bramastana (Baik).
   * Posisi 7 (Rahayu) -> Santosa, kinakbastian (Sangat Baik).
4. **Pamedal Mayunan Uttara (Menghadap Utara) - Hitung dari Barat (Kiri):**
   * Posisi 6 (Sugih) -> Piyutangan, sukha dukha (Baik).
   * Posisi 7 (Sugih) -> Olih istri, sukha (Sangat Baik).

### 11.3 Siklus 6 Ingkel (Sistem Pantangan Mingguan)
Setiap wuku memiliki siklus Ingkel 6 mingguan yang melarang aktivitas tertentu:
1. **Ingkel Wong:** Wuku Sinta, Warigadean, Medangsia, Tambir, Bala, Ugu -> Dilarang melangsungkan upacara Manusa Yadnya (pernikahan, metatah, dll) dan Atiwa-tiwa.
2. **Ingkel Sato:** Wuku Landep, Julungwangi, Pahang, Medangkungan, Ugu, Wayang -> Dilarang membeli, memotong, atau melatih hewan berkaki empat.
3. **Ingkel Mina:** Wuku Ukir, Sungsang, Krulut, Matal, Wayang, Kulawu -> Dilarang menebar benih ikan atau menangkap ikan skala besar.
4. **Ingkel Manuk:** Wuku Kulantir, Dungulan, Merakih, Uye, Kulawu, Dukut -> Dilarang memotong atau membeli unggas.
5. **Ingkel Taru:** Wuku Tolu, Kuningan, Tambir, Menail, Dukut, Watugunung -> Dilarang menebang pohon besar atau menanam kayu bangunan.
6. **Ingkel Buku:** Wuku Gumbreg, Langkir, Medangkungan, Prangbakat, Watugunung, Sinta -> Dilarang memotong tanaman berbuku (bambu, tebu).

## MODUL 12: Matriks Dewasa Mekarya Sarana (Daftar 58 Kala Alat)

Untuk membuat perkakas, senjata, alat penangkap ikan, atau benteng pertahanan, gunakan matriks Kala khusus berikut (Halaman 68 - 74):

### 12.1 Matriks 58 Kala Pembuatan Sarana
| No | Nama Kala | Waktu Aktif | Sifat & Kecocokan Programmatic |
|---|---|---|---|
| 1. Kala Kutila Manik | Kajeng Kliwon | Sangat baik membuat senjata pelindung diri, perangkap, jaring bhuta. |
| 2. Kala Beser | Tungleh Kala | Baik mengasah tombak, taji sabung ayam, alat pertanian tajam. |
| 3. Kala Jangkut | Pepet Kajeng | Sangat baik membuat perangkap burung, jaring burung, pukat. |
| 4. Kala Bancaran | Redite Dungulan, Coma Sinta, Anggara Tolu... | Sangat baik menempa keris, meriam, senjata tajam berpamor. |
| 5. Kala Gacokan | Anggara Tambir | Sangat baik menempa mata tombak. |
| 6. Kala Mretyu | Redite Sinta, Merakih; Coma Menail... | Baik menempa besi keras, membuat senjata tempur luar ruangan. |
| 7. Kala Macan | Wraspati Tambir | Sangat baik membuat hiasan gagang keris/senjata dari tulang. |
| 8. Kala Mina | Sukra Warigadean, Medangsia | Sangat baik membuat harpun, kail pancing, tombak ikan. |
| 9. Kala Muncar | Budha Dungulan, Saniscara Merakih Tgl 3 | Sangat baik membuat saluran pancuran air, bendungan. |
| 10. Kala Ngeruda | Redite Dukut, Coma Sungsang, Menail... | Sangat baik memahat patung garuda, ukiran tameng pertahanan. |
| 11. Kala Pacekan | Anggara Tolu | Baik menempa belati pertahanan diri. |
| 12. Kala Tumpang | Anggara Sinta, Sukra Medangsia... | Baik merakit senjata rahasia, racun perangkap (sadek). |
| 13. Kala Wikalpa | Coma Uye, Bala; Sukra Wayang... | Sangat baik menempa pedang panjang. |
| 14. Kala Capita | Coma Merakih Tanggal 3 | Sangat baik membuat jepretan, perangkap jepit hewan liar. |
| 15. Kala Atat | Redite Uye, Anggara Watugunung... | Sangat baik membuat anyaman tali jaring, jerat burung. |
| 16. Kala Caplokan | Coma Julungwangi, Merakih; Anggara Tambir | Sangat baik membuat topeng barong, ukiran singa pamedal. |
| 17. Kala Ngamut | Coma Merakih | Sangat baik membuat jaring ikan di laut dangkal. |
| 18. Kala Sudang Astra | Redite Prangbakat; Anggara Klawu... | Sangat baik menempa anak panah, membuat busur. |
| 19. Macekan Lanang | Redite Tanggal 5, 12; Coma Tanggal 11... | Sangat baik membuat alat tajam berstruktur runcing. |
| 20. Macekan Wadon | Redite Panglong 5, 12; Coma Panglong 11... | Sangat baik membuat perkakas dapur (pisau, parang besar). |
| 21. Kala Keciran | Budha Gumbreg | Baik membuat kikir tajam, pisau ukir kecil. |
| 22. Asu Ajag Turun | Pahing Urukung | Sangat baik memasang jebakan binatang buas di hutan. |
| 23. Kala Brahma | Redite Menail, Anggara Medangsia... | Sangat baik menyalakan api peleburan besi (pande besi). |
| 24. Kala Cakra | Saniscara Menail | Sangat baik merancang roda kereta, roda mekanis kayu. |
| 25. Kala Gumarang Munggah | Pon Urukung | Sangat baik memotong bambu tiang untuk kandang ternak. |
| 26. Kala Pati Jengkang | Wraspati Urukung | Baik membuat perangkap ranjau tanah. |
| 27. Kala Lutung Magelut | Redite Ukir, Budha Sungsang | Sangat baik meracik obat racun/sadek, memburu kera. |
| 28. Kala Mangap | Redite Umanis | Dilarang keras transaksi beli alat tani (boros/rugi). |
| 29. Dina Jaya | Redite Tanggal 2; Coma Tanggal 5... | Sangat baik membuat panji-panji perang, bendera kebesaran. |
| 30. Bawi Turun | Wage Paniron | Sangat baik membuat jerat babi hutan. |
| 31. Kala Klingkung | Anggara Sinta | Baik membuat tameng pertahanan kayu. |
| 32. Kala Geger | Wraspati, Sukra Wariga | Sangat baik membuat alat musik pukul (kulkul, genta). |
| 33. Bojog Turun | Kliwon Ariang | Sangat baik merajut jaring kera. |
| 34. Karna Sula | Coma Sinta, Kulantir; Anggara Langkir... | Sangat baik menempa anting-anting emas perhiasan. |
| 35. Banyu Milir | Redite Kulantir; Coma Wayang; Budha Sinta | Sangat baik menggali terowongan air irigasi, sumur. |
| 36. Semut Sedulur | Redite Kliwon, Sukra Pon | Dilarang rapat kolektif, baik untuk gotong royong parit. |
| 37. Kala Buingrau | Redite Indra; Coma Uma; Anggara Ludra... | Dilarang memahat, baik untuk membakar sampah. |
| 38. Kala Olih | Budha Prangbakat | Sangat baik membuat terowongan tambang bawah tanah. |
| 39. Banyu Urung | Redite Sinta, Coma Sinta, Landep... | Dilarang membuat sumur (air diramalkan tidak keluar/kering). |
| 40. Kajeng Susunan | Kajeng Guru Dadi | Sangat baik merajut anyaman keranjang bambu. |
| 41. Kajeng Lulunan | Kajeng Rudra Dadi | Sangat baik membuat wadah penampung hasil panen. |
| 42. Corok Godong | Wraspati Kliwon Langkir | Sangat baik merakit jaring ikan di sungai. |
| 43. Kajeng Kipkipan | Budha Gumbreg, Watugunung | Sangat baik membuat anyaman wadah upakara. |
| 44. Kala Kutila | Ariang Brahma | Sangat baik membuat perkakas besi berat. |
| 45. Kala Awus | Budha Klawu | Sangat baik membuat tikar anyaman halus. |
| 46. Kala Guru | Budha Landep | Sangat baik membuat aturan hukum adat/prasasti. |
| 47. Kala Panyeneng | Redite Wariga, Sukra Watugunung | Sangat baik membuat peti besi, brankas penyimpanan emas. |
| 48. Kala Ketemu | Redite Sinta, Julungwangi... | Sangat baik memasang jebakan ikan jaring apung. |
| 49. Kala Luang | Redite Dungulan, Kuningan, Langkir... | Sangat baik menggali parit keliling benteng. |
| 50. Kala Pati | Redite Landep, Sungsang; Anggara Gumbreg... | Sangat baik membuat perangkap beracun binatang buas. |
| 51. Kala Raja | Wraspati Dukut | Sangat baik melantik pengurus adat/pejabat pemerintahan. |
| 52. Kala Susulan | Coma Dungulan | Baik membuat jaring udang sungai. |
| 53. Kala Tumapel | Anggara, Budha Kuningan | Sangat baik memahat topeng kayu keagamaan. |
| 54. Kala Tukaran | Anggara Ukir, Warigadean | Sangat baik melatih burung elang, menjinakkan hewan. |
| 55. Kala Manguneb | Wraspati Medangsia | Sangat baik membuat gembok pintu gerbang utama. |
| 56. Dauh Ayu | Redite Tgl/Pang 4,5,6; Coma Tgl/Pang 2,3,5... | Sangat baik merakit perkakas rumah tangga kayu. |
| 57. Geni Murub | Redite Tgl 12; Coma Tgl 11... | Sangat baik membakar keramik, genteng, batu bata. |
| 58. Kala Keciran | Redite Tanggal 4; Coma Tanggal 1... | Sangat baik membuat pisau cukur rambut anak. |

## MODUL 13: Eka Jala Reshi (30 Wuku x 7 Hari Ramalan)

Eka Jala Reshi adalah tabel ramalan harian dalam satu siklus Pawukon (210 hari) yang digunakan oleh mesin untuk mengeluarkan output teks ramalan harian pengguna berdasarkan kombinasi **Wuku** dan **Sapta Wara** (Halaman 90 - 97):

### 13.1 Struktur Ramalan Eka Jala Reshi
* **Wuku 1 (Sinta):**
  * Redite: *Suka Pinanggih* (Mendapatkan kesenangan).
  * Coma: *Buat Suka* (Membawa kebahagiaan).
  * Anggara: *Manggih Suka* (Menemukan kesenangan).
  * Budha: *Buat Suka* (Membawa kebahagiaan).
  * Wraspati: *Suka Pinanggih* (Mendapatkan kesenangan).
  * Sukra: *Suka Pinanggih* (Mendapatkan kesenangan).
  * Saniscara: *Manggih Suka* (Menemukan kesenangan).
* **Wuku 2 (Landep):**
  * Redite: *Kamaranan* (Bahaya/Kematian hewan).
  * Coma: *Buat Suka* (Membawa kebahagiaan).
  * Anggara: *Kinasihan Jana* (Disayangi banyak orang).
  * Budha: *Wredhi Putra* (Bertambah keturunan).
  * Wraspati: *Suka Rahayu* (Kesenangan dan keselamatan).
  * Sukra: *Suka Pinanggih* (Mendapatkan kesenangan).
  * Saniscara: *Sidha Kasobagian* (Mencapai keberuntungan).
* **Wuku 3 (Ukir):**
  * Redite: *Kinasihan Jana* (Disayangi banyak orang).
  * Coma: *Buat Suka* (Membawa kebahagiaan).
  * Anggara: *Kinasihan Jana* (Disayangi banyak orang).
  * Budha: *Tininggaling Suka* (Ditinggalkan kesenangan).
  * Wraspati: *Rahayu* (Selamat/Damai).
  * Sukra: *Buat Sebet* (Membawa kesedihan).
  * Saniscara: *Buat Astawa* (Sangat baik untuk pemujaan).
* **Wuku 12 (Kuningan):**
  * Redite: *Suka Rahayu* (Kesenangan dan keselamatan).
  * Coma: *Kinasihan Amretha* (Mendapatkan kemakmuran makanan).
  * Anggara: *Kinasihan Amretha* (Mendapatkan kemakmuran makanan).
  * Budha: *Buat Sebet* (Membawa kesedihan).
  * Wraspati: *Buat Suka* (Membawa kebahagiaan).
  * Sukra: *Buat Sebet* (Membawa kesedihan).
  * Saniscara: *Wredhi Putra* (Bertambah keturunan).
* **Wuku 30 (Watugunung):**
  * Redite: *Langgeng Kayohanan* (Kesucian kekal).
  * Coma: *Buat Lara* (Membawa penyakit/penderitaan).
  * Anggara: *Buat Astawa* (Pemujaan utama).
  * Budha: *Tininggaling Suka* (Ditinggalkan kesenangan).
  * Wraspati: *Buat Suka* (Membawa kebahagiaan).
  * Sukra: *Tininggaling Suka* (Ditinggalkan kesenangan).
  * Saniscara: *Manggih Suka* (Menemukan kesenangan).

## MODUL 14: Pratiti Sambut Padha, Palalintangan, Pararasan & Palelindon

Matriks ramalan watak kelahiran, perbintangan tradisional, dan deteksi bencana alam (Halaman 97 - 106):

### 14.1 Pratiti Sambut Padha (Kelahiran Berdasarkan Sasih & Tanggal)
Rasio karakter bawaan bayi yang baru lahir dihitung menggunakan perputaran roda *Kiwa*:
* **Tresna (Sasih Asadha - I nuju Tanggal 14):** Sifat: Keras kepala, tidak mau mengalah, emosional (*Bares, awinan sering kekeringan. Kirang susila*).
* **Upadhana (Sasih Jyestha - XI nuju Tanggal 14):** Sifat: Dermawan, beruntung dalam pekerjaan, jujur (*Kahanan kasobagian, purusa, satya. Seneng mapunia*).
* **Bhawa (Sasih Kadhasa - X nuju Tanggal 14):** Sifat: Emosional, tamak, sering tertimpa masalah keluarga (*Sering manggih pakewuh, saantukan madue kahyun loba*).
* **Jati (Sasih Kasangan - IX nuju Tanggal 14):** Sifat: Bijaksana, jujur, setia pada janji (*Purusa, kasuecanin antuk gustinnyane. Sadhu budhi laksana*).
* **Jara Marana (Sasih Phalguna - VIII nuju Tanggal 14):** Sifat: Rentan sakit, pemarah, tidak setia (*Wikan, purusa, madue kahyun kroda, katresnain antuk kulawargan nyane*).
* **Awidya (Sasih Magha - VII nuju Tanggal 14):** Sifat: Beruntung, sehat, dihormati (*Manggih artha, dirghayusa. Arang manggih pakewuh*).
* **Samkara (Sasih Pausya - VI nuju Tanggal 14):** Sifat: Suka menolong, berkecukupan (*Dirghayusa, sugih, akeh madue sawitra. Sering manggih pakewuh*).
* **Widnyana (Sasih Marghasirsa - V nuju Tanggal 14):** Sifat: Bijaksana, dihormati oleh rohaniwan (*Dirghayusa, kasuecanan antuk sang pandita, madue kahyun iri*).

### 14.2 Pararasan (Jiwa Anak Berdasarkan Sisa Urip)
Bagi anak yang lahir, jumlahkan Urip Sapta Wara dan Panca Wara hari lahirnya, lalu bagi dengan 10. Sisa pembagian menentukan karakter jiwanya:
* **Laku Bumi (Sisa 7):** Sifat pendiam, pemalu, sabar, patuh (*Madue kahyun sedeng miwah tan pati ngamedalang baos, seneng magonjakan ring anak istri*).
* **Laku Api (Sisa 8):** Sifat pemarah, dinamis, pekerja keras (*Sering makarya wig, kroda, seneng madiduwurin anak lian*).
* **Laku Angin (Sisa 9):** Sifat tidak konsisten, gemar berkelana (*Seneng meneng-meneng, pamargine sekadi pandita, seneng ajum, ngagu miwah sering ubah*).
* **Laku Pandita (Sisa 10):** Sifat cerdas, bijaksana, cocok jadi pendidik (*Sakti, pradnyan, nyidayang dados balian sastrawan, midep jumbuh*).
* **Aras Tuding (Sisa 11):** Sifat pemberani, disegani, teguh (*Perwira, seneng ring artha brana anak istri*).
* **Aras Kembang (Sisa 12):** Sifat disayangi banyak orang, banyak anak (*Akeh madue oka, akeh madue sametonan, katresnain antuk anak lian*).
* **Laku Bintang (Sisa 13):** Sifat halus tutur kata, cocok jadi pedagang (*Madue pakahyunan alus, kirang telajan, wikan indik basa*).
* **Laku Bulan (Sisa 14):** Sifat lemah lembut, berotak encer, penyayang (*Wikan makarya, uripnyane ledang katresnain anak, budhi halus*).
* **Laku Surya (Sisa 15):** Sifat berwibawa, tegas, keras (*Matata susila, sada madue rasa kemad, akeh madue panganti*).
* **Laku Toya (Sisa 16):** Sifat tenang, berjiwa pemimpin, sabar (*Wekasan dados pamimpin, kayun pageh malih sebet*).

## MODUL 15: Kriya Patra Upacara Manusa Yadnya (Halaman 107 - 118)

Bagian ini memuat integrasi liturgis penuh dari **Kriya Patra Upacara Manusa Yadnya** yang disusun oleh **Ida Pedanda Gde Putra Tembau** dari **Gria Gde Aan-Banjarangkan** (Paruman Sulinggih Kabupaten Klungkung, 6 Desember 2005). Ini adalah panduan operasional wajib untuk menghitung dan menjadwalkan 15 tahapan upacara kehidupan (*Manusa Yadnya*):

### 15.1 Defenisi Teologis Manusa Yadnya
Upacara Manusa Yadnya bertujuan untuk menyucikan secara sekala (fisik) dan niskala (spiritual) jiwa manusia semenjak dalam kandungan hingga akhir hayatnya agar mencapai kesempurnaan hidup (*Suka Tan Pawali Duka, Manunggal ring Hyang Widhi*).

### 15.2 Aed Dudonan (15 Tahapan Upacara Lifecycle Manusa Yadnya)

#### 1. NGERUJAKIN
* **Waktu Pelaksanaan:** Saat janin berusia kurang lebih 3 bulan di dalam kandungan, ketika sang Ibu mengalami fase mengidam (*Ngidam*).
* **Tujuan:** Penyucian pertama benih manusia yang lahir dari bersatunya *kama bang* (sel telur) dan *kama petak* (sperma) yang membentuk *Bibit Rare*.
* **Upakarana (Sesajen):** Byakala, sesayut, prasyascita pada tegep saha panglukatan, rujak pisang, wohan, cuka, madu, gula, serta makanan yang mengandung enam rasa (*Sad Rasa*: Manis, Pedes, Masem, Pakeh, Pait, Sepet).

#### 2. MAGEDONG-GEDONGAN
* **Waktu Pelaksanaan:** Janin berusia 5 bulan kalender masehi atau 6 bulan kalender Bali (*Garbha*), sebelum bayi lahir.
* **Tujuan:** Memohon keselamatan bagi bayi di dalam kandungan agar lahir sehat, selamat, cerdas, dan bijaksana (*Pradnya widagda wicaksana*).
* **Upakarana:** Byakala, sesayut, prasyascita ring sor tegep, sesayut pamahayu tuwuh, banten pagedongan.
* **Tata Titi Pamargi (Langkah-langkah):**
  * Ibu hamil mandi/bersuci (*Mabyakala* & *Maprayascita*).
  * Duduk menghadap sanggar kemulan dibasuh air kelapa gading.
  * Mengikatkan benang hitam pada perut ibu hamil, melambangkan perlindungan spiritual.
  * Suami istri melakukan persembahyangan bersama memohon keselamatan janin.

#### 3. RARE EMBAS UTAWI LEKAD (Kelahiran Bayi)
* **Waktu Pelaksanaan:** Sesaat setelah bayi lahir ke dunia.
* **Tujuan:** Menyambut kelahiran dengan rasa syukur dan menyucikan plasenta/ari-ari bayi.
* **Upakarana & Tata Cara Mendem Ari-ari:**
  * Ari-ari dibersihkan, dimasukkan ke dalam kelapa gading yang telah dibelah dua.
  * Diisi dengan duri-duri, wewangian, jarum, benang, dan batu bulitan.
  * Dibungkus kain putih, ditanam di sebelah kanan pintu rumah untuk bayi laki-laki, atau sebelah kiri untuk bayi perempuan.
  * Mantra Mendem Ari-ari: *'ONG SANG IBU PERTIWI RUMAGA BAYU, RUMAGA AMERTHA SANJIWANI, ANGAMERTHANIN SARWA TUMUWUH SI ANU (Nama Bayi) MANGDA DIRGAYUSA NUGTUGANG TUWUH.'*

#### 4. UPACARA KEPUS PUNGSED
* **Waktu Pelaksanaan:** Saat tali pusar bayi lepas secara alami (*Kepus Pungsed*).
* **Tujuan:** Menyucikan pusar bayi dan memohon perlindungan kepada Sang Hyang Kumara selaku dewa pelindung anak-anak.
* **Upakarana:** Banten Panelahan/pabersihan, Banten Kumara (putih kuning), Banten Tataban ring Ibu, Banten Ari-ari.

#### 5. UPACARA NGELEPAS AWON
* **Waktu Pelaksanaan:** Bayi berusia 12 hari.
* **Tujuan:** Menyucikan bayi dan ranjang bersalin dari noda kotoran proses kelahiran.
* **Upakarana:** Sama seperti upacara Kepus Pungsed, nanging diupayakan memilih hari yang bebas dari pengaruh buruk *Pretiti*.

#### 6. UPACARA KAMBUHAN (Macolokan / 42 Hari)
* **Waktu Pelaksanaan:** Bayi berusia 42 hari (*Abulan Pitung Dina*).
* **Tujuan:** Menyucikan jasmani bayi dan ibu secara penuh sehingga ibu terbebas dari masa kotoran (*Cuntaka*) melahirkan dan diperbolehkan memasuki tempat suci.
* **Upakarana:** Banten Byakawon, Prayascita, Banten Pasuwugan, Banten Kumara, Banten Jejanganan, Banten Pacolongan jangkep.

#### 7. UPACARA NYAMBUTIN (Nelu Bulanin)
* **Waktu Pelaksanaan:** Bayi berusia 3 bulan Bali (105 hari).
* **Tujuan:** Menyucikan jiwa raga bayi, memohon agar roh leluhur yang menjelma kembali (*Numadi*) bersatu sepenuhnya dengan tubuh fisik, serta upacara pertama kali bayi menyentuh tanah (*Tuwun Tanah*).
* **Upakarana:** Banten Pangelepas, pabersihan, Banten Sambutan tegep, Banten Kumara, perhiasan emas (gelang, kalung, cincin) dengan hiasan permata merah delima (*Ratna Kencana*).

#### 8. UPACARA OTONAN
* **Waktu Pelaksanaan:** Bayi berusia 6 bulan Bali (210 hari), berulang setiap satu siklus pawukon.
* **Tujuan:** Hari kelahiran spiritual yang sangat penting. Memohon keselamatan lahir batin kepada Sang Hyang Widhi dan Bhatara Kumara, serta upacara pencukuran rambut pertama (*Ngundul*).
* **Upakarana:** Prasyascita asoroh, Banten Parurubayan (alat mencukur), Banten Jejanganan, Tataban, Peras, Lis, Banten Pesaksi manut kemampuan keluarga.

#### 9. UPACARA NGEMPUGIN
* **Waktu Pelaksanaan:** Sesaat setelah gigi pertama bayi tumbuh (*Tumbuh Gigi*).
* **Tujuan:** Memohon keselamatan agar pertumbuhan gigi anak berjalan lancar dan gigi tumbuh kuat tanpa menyebabkan sakit.
* **Upakarana:** Tumpeng adaanan, tumpeng agung maulam guling bebek, peras, lis, banten petinjo kukus ring Sanghyang Surya, Bhatara Brahma, dan Dewi Sri.

#### 10. UPACARA MAKUPAK
* **Waktu Pelaksanaan:** Saat gigi susu anak mulai tanggal/lepas pertama kali (*Ketus Gigi*).
* **Tujuan:** Menandai fase pergantian gigi menuju dewasa, memohon kepada Sang Hyang Kumara agar pertumbuhan gigi permanen berjalan rapi.
* **Upakarana:** Banten Byakala, sesayut pangerti swara, sesayut tatebasan, banten panganan tradisional.

#### 11. UPACARA MATUSUK
* **Waktu Pelaksanaan:** Menjelang anak memasuki usia sekolah dasar (Ear Piercing).
* **Tujuan:** Menembus/melubangi daun telinga anak perempuan untuk memasang anting-anting, melambangkan penajaman indra pendengaran rohani agar tekun belajar.
* **Upakarana:** Byakala, tatebasan, canang daksina, banten penyambutan.

#### 12. UPACARA MUNGGAH DEHA / TRUNA
* **Waktu Pelaksanaan:** Saat anak menginjak masa pubertas (Menstruasi pertama untuk anak perempuan, perubahan suara untuk laki-laki).
* **Tujuan:** Menyucikan diri anak dari pengaruh masa kanak-kanak menuju dewasa, memohon berkah dari Sang Hyang Semara dan Ratih agar memiliki budi pekerti luhur.
* **Upakarana:** Banten Byakala asoroh, prayascita, dapetang kejangkepang antuk sesayut Sabuh Rah ring pawon ngeraja singa.

#### 13. UPACARA METATAH / MEPANES (Potong Gigi)
* **Waktu Pelaksanaan:** Saat anak menginjak usia dewasa penuh, wajib dilakukan sebelum menikah.
* **Tujuan:** Mengasah/meratakan 6 gigi rahang atas (4 gigi seri dan 2 taring) sebagai simbolis mengendalikan nafsu **Sad Ripu** (enam musuh dalam diri manusia: Kama, Loba, Krodha, Mada, Moha, Matsarya).
* **Upakarana:** Banten Byakala, prayascita, panglukatan tegep ring bale petatahan, Nyuh gading kasturi, kikir besi, tempat ludah kelapa kasturi putih.

#### 14. UPACARA WINTEN SARI
* **Waktu Pelaksanaan:** Saat remaja/dewasa mulai menempuh ajaran ilmu pengetahuan suci rohani.
* **Tujuan:** Pembersihan lahir batin secara mendalam agar pikiran menjadi cemerlang dan mampu menerima ilmu pengetahuan suci tanpa halangan spiritual.
* **Upakarana:** Banten daksina gede, sesayut saraswati, banten pengambean.

#### 15. UPACARA WIWAHA / PAWIWAHAN (Pernikahan)
* **Waktu Pelaksanaan:** Pertemuan suci antara laki-laki (*Purusa*) dan perempuan (*Pradhana*).
* **Tujuan:** Meresmikan hubungan perkawinan secara sah menurut hukum agama Hindu (*Wiwaha Samaskara*) demi melahirkan keturunan yang suputra.
* **Upakara Dudonan Saking Kriya Patra:**
  1. **Mabyakawon:** Menghilangkan pengaruh buruk Bhuta Kala pada jasmani pengantin.
  2. **Malukat / Mejaya-jaya:** Pembersihan spiritual pengantin menggunakan air suci tirtha panglukatan oleh pendeta.
  3. **Muspa:** Sembahyang bersama di hadapan saksi dewa (*Dewa Saksi*) dan manusia (*Manusa Saksi*).
  4. **Natab / Ngayab:** Menerima anugerah kesucian pernikahan agar hidup rukun sejahtera.
  5. **Nunas Wangsungpada:** Memohon restu suci dari air pembasuh kaki leluhur/Tirtha Sanggah Kemulan.

## MODUL 16: Skema Database & Implementasi Kode Engine

Sebagai referensi teknis langsung bagi developer, berikut adalah rancangan skema JSON database dan logika pemrograman untuk diimplementasikan ke dalam kode backend aplikasi.

### 16.1 Struktur Skema JSON untuk Wuku
```json
{
  "wuku": [
    {
      "id": 1,
      "name": "Sinta",
      "urip": 7,
      "genah": "Pascima",
      "dewata": "Sanghyang Yama Dipati",
      "ingkel": "Wong",
      "eka_jala_reshi": {
        "redite": "Suka Pinanggih",
        "coma": "Buat Suka",
        "anggara": "Manggih Suka",
        "budha": "Buat Suka",
        "wraspati": "Suka Pinanggih",
        "sukra": "Suka Pinanggih",
        "saniscara": "Manggih Suka"
      }
    },
    {
      "id": 2,
      "name": "Landep",
      "urip": 1,
      "genah": "Wayabya",
      "dewata": "Sanghyang Maha Dewa",
      "ingkel": "Sato",
      "eka_jala_reshi": {
        "redite": "Kamaranan",
        "coma": "Buat Suka",
        "anggara": "Kinasihan Jana",
        "budha": "Wredhi Putra",
        "wraspati": "Suka Rahayu",
        "sukra": "Suka Pinanggih",
        "saniscara": "Sidha Kasobagian"
      }
    }
  ]
}
```

### 16.2 Logika Validasi Hari Baik Atiwa-tiwa (Kremasi) dalam Python
```python
def validate_atiwa_tiwa(wuku_name, sapta_wara_name, tanggal, sasih, is_ingkel_wong):
    # 1. Validasi Ingkel Wong
    if is_ingkel_wong:
        return False, "Dilarang keras: Bertepatan dengan Ingkel Wong."
        
    # 2. Validasi Sasih Terlarang
    sasih_terlarang = [4, 5, 6, 8, 9, 10, 11, 12]
    if sasih in sasih_terlarang:
        return False, f"Dilarang: Sasih {sasih} tidak diperbolehkan untuk Atiwa-tiwa."
        
    # 3. Validasi Tanggal Terlarang
    tanggal_terlarang = [1, 6, 8, 9, 14]
    if tanggal in tanggal_terlarang:
        return False, f"Dilarang: Tanggal/Panglong {tanggal} bernilai buruk."
        
    # 4. Jika lolos semua validasi rintangan
    return True, "Hari aman untuk melangsungkan upacara Atiwa-tiwa."
```
