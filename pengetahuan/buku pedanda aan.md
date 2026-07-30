# Spesifikasi Teknis & Panduan Data: Mesin Penghitung Kalender Bali (Wariga Engine)
> **Kategori Dokumen**: Dokumen Spesifikasi Teknis (Developer Knowledge Base)  
> **Status**: Siap Produksi (Grounded in "Buka Dewasa Bali.pdf")  
> **Tujuan**: Sebagai dokumen acuan arsitektur data, logika algoritmik, dan data benih (seed data) untuk membangun aplikasi mesin kalender Bali, penentuan padewasan (dewasa ayu/ala), dan tika digital.

Dokumen ini disusun untuk menjembatani naskah penanggalan tradisional Bali (**Wariga**) yang bersumber langsung dari kitab panduan **Buka Dewasa Bali** ke dalam pemodelan data modern. Seluruh nama, urip, aksara, penempatan (genah), dewa penunggu (dewata), dan aturan hierarki dalam dokumen ini disarikan secara presisi tanpa rekayasa.

---

## 1. Arsitektur Data Dasar (Core Calendar Cycles)

Mesin Kalender Bali (Wariga Engine) bekerja dengan menyinkronkan beberapa siklus waktu paralel. Tiga pilar utama dalam perhitungan harian adalah **Wewaran** (siklus hari), **Wuku** (siklus mingguan 30 wuku), dan **Sasih** (siklus bulan).

### 1.1 Siklus Wewaran (Multi-Day Cycles)
Siklus Wewaran berkisar dari Eka Wara hingga Dhasa Wara. Di bawah ini adalah tabel representasi objek data untuk masing-masing wewaran lengkap dengan nilai **Urip (Bobot Numerik)**, **Genah (Arah Mata Angin)**, dan **Dewata (Aspek Ketuhanan)**.

#### Tabel Data Wewaran Lengkap

##### A. Eka Wara hingga Tri Wara
| Siklus | Hari | Urip | Genah / Arah | Dewata / Penguasa |
| :--- | :--- | :---: | :--- | :--- |
| **Eka Wara** | Luang | 1 | Aya Baya | Sanghyang Eka Taya / Sanghyang Licin |
| **Dwi Wara** | Menga | 5 | Purwa (Timur) | Sanghyang Ketu |
| | Pepet | 7 | Pascima (Barat) | Sanghyang Rabu |
| **Tri Wara** | Pasah / Dora | 9 | Daksina (Selatan) | Sanghyang Cika |
| | Beteng / Waya | 4 | Uttara (Utara) | Sanghyang Wacika |
| | Kajeng / Biantara | 7 | Pascima (Barat) | Sanghyang Manacika |

##### B. Catur Wara dan Panca Wara
| Siklus | Hari | Urip | Genah / Arah | Dewata / Penguasa |
| :--- | :--- | :---: | :--- | :--- |
| **Catur Wara** | Sri | 4 | Uttara (Utara) | Bhagawan Bregu |
| | Laba | 5 | Purwa (Timur) | Bhagawan Kanwa |
| | Jaya | 9 | Daksina (Selatan) | Bhagawan Janaka |
| | Mandala | 7 | Pascima (Barat) | Bhagawan Narada |
| **Panca Wara** | Umanis | 5 | Purwa (Timur) | Sanghyang Korsika |
| | Pahing | 9 | Daksina (Selatan) | Sanghyang Gargha / Dewa Brahma |
| | Pon | 7 | Pascima (Barat) | Sanghyang Maitrya / Dewa Mahadewa |
| | Wage | 4 | Uttara (Utara) | Sanghyang Kurusya / Dewa Wisnu |
| | Kliwon | 8 | Madya (Tengah) | Sanghyang Pratanjala / Dewa Siwa |

##### C. Sad Wara (Siklus 6 Hari)
| Hari | Urip | Genah / Arah | Dewata / Penguasa |
| :--- | :--- | :---: | :--- | :--- |
| 1. Tungleh | 7 | Pascima (Barat) | Sanghyang Indra |
| 2. Aryang | 6 | Ersania (Timur Laut) | Sanghyang Baruna |
| 3. Urukung | 5 | Purwa (Timur) | Sanghyang Kwera |
| 4. Paniron | 8 | Agneya (Tenggara) | Sanghyang Bayu |
| 5. Was | 9 | Daksina (Selatan) | Sanghyang Bajra |
| 6. Maulu | 3 | Neriti (Barat Daya) | Sanghyang Erawana |

##### D. Sapta Wara (Siklus 7 Hari)
| Hari | Singkatan | Urip | Genah / Arah | Dewata / Penguasa |
| :--- | :--- | :---: | :--- | :--- |
| 1. Radite (Minggu) | Red | 5 | Purwa (Timur) | Sanghyang Bhaskara |
| 2. Coma (Senin) | Com | 4 | Uttara (Utara) | Sanghyang Candra |
| 3. Anggara (Selasa) | Ang | 3 | Neriti (Barat Daya) | Sanghyang Anggara |
| 4. Budha (Rabu) | Bud | 7 | Pascima (Barat) | Sanghyang Udaka |
| 5. Wraspati (Kamis) | Wra | 8 | Agneya (Tenggara) | Sanghyang Sura Guru |
| 6. Sukra (Jumat) | Suk | 6 | Ersania (Timur Laut) | Sanghyang Bregu |
| 7. Saniscara (Sabtu) | San | 9 | Daksina (Selatan) | Sanghyang Wasurama |

##### E. Astha Wara (Siklus 8 Hari)
| Hari | Urip | Genah / Arah | Dewata / Penguasa |
| :--- | :--- | :---: | :--- | :--- |
| 1. Sri | 6 | Ersania (Timur Laut) | Bhatari Giri Putri |
| 2. Indra | 5 | Purwa (Timur) | Sanghyang Indra |
| 3. Guru | 8 | Agneya (Tenggara) | Sanghyang Guru |
| 4. Yama | 9 | Daksina (Selatan) | Sanghyang Yama |
| 5. Rudra | 3 | Neriti (Barat Daya) | Sanghyang Rudra |
| 6. Brahma | 7 | Pascima (Barat) | Sanghyang Brahma |
| 7. Kala | 1 | Waya Baya (Barat Laut) | Sanghyang Kalantaka |
| 8. Uma | 4 | Uttara (Utara) | Sanghyang Uma |

##### F. Sangha Wara (Siklus 9 Hari)
| Hari | Urip | Genah / Arah | Dewata / Penguasa |
| :--- | :--- | :---: | :--- | :--- |
| 1. Dangu | 5 | Purwa (Timur) | Bhuta Urungan |
| 2. Jangur | 6 | Ersania (Timur Laut) | Bhuta Pataka |
| 3. Gigis | 8 | Agneya (Tenggara) | Bhuta Jirek |
| 4. Nohan | 1 | Waya Baya (Barat Laut) | Bhuta Raregek |
| 5. Ogan | 8 | Madya (Tengah) | Bhuta Jingkrak |
| 6. Erangan | 3 | Neriti (Barat Daya) | Bhuta Jabung |
| 7. Urungan | 7 | Pascima (Barat) | Bhuta Kenyeng |
| 8. Tulus | 9 | Daksina (Selatan) | Sanghyang Saraswathi |
| 9. Dadi | 4 | Uttara (Utara) | Sanghyang Dharma |

##### G. Dhasa Wara (Siklus 10 Hari)
| Hari | Urip | Genah / Arah | Dewata / Penguasa |
| :--- | :--- | :---: | :--- | :--- |
| 1. Pandita | 5 | Purwa (Timur) | Sanghyang Aruna |
| 2. Pati | 7 | Pascima (Barat) | Sanghyang Kala |
| 3. Suka | 10 | - (Tanpa Arah) | Sanghyang Semara |
| 4. Duka | 4 | Uttara (Utara) | Sanghyang Durgha |
| 5. Shri | 6 | Ersania (Timur Laut) | Sanghyang Bhasundari |
| 6. Manuh | 2 | - (Tanpa Arah) | Sanghyang Kala Lupa |
| 7. Manusa | 3 | Neriti (Barat Daya) | Sanghyang Suksma Jati |
| 8. Raja | 8 | Agneya (Tenggara) | Sanghyang Kala Tangis |
| 9. Dewa | 9 | Daksina (Selatan) | Sanghyang Sambu |
| 10. Raksasa | 1 | Waya Baya (Barat Laut) | Sanghyang Kala Kopa |

---

### 1.2 Siklus Wuku (The 30-Wuku Cycle)
Satu tahun wuku terdiri dari 30 Wuku yang berputar setiap 210 hari (30 wuku x 7 hari). Setiap Wuku memiliki nilai Urip, Arah (Genah), dan Dewata pelindung tersendiri.

| ID | Nama Wuku | Urip | Genah / Arah | Dewata / Penguasa |
| :---: | :--- | :---: | :--- | :--- |
| 1 | Sinta | 7 | Pascima (Barat) | Sanghyang Yama Dipati |
| 2 | Landep | 1 | Wayabaya (Barat Laut) | Sanghyang Maha Dewa |
| 3 | Ukir | 4 | Uttara (Utara) | Sanghyang Maha Yekti |
| 4 | Kulantir | 6 | Ersania (Timur Laut) | Sanghyang Langsar |
| 5 | Tolu | 5 | Purwa (Timur) | Sanghyang Bhayu |
| 6 | Gumbreg | 8 | Agneya (Tenggara) | Sanghyang Candra |
| 7 | Wariga | 9 | Daksina (Selatan) | Sanghyang Semara |
| 8 | Warigadean | 3 | Nerithi (Barat Daya) | Sanghyang Maha Reshi |
| 9 | Julungwangi | 7 | Pascima (Barat) | Sanghyang Sambhu |
| 10 | Sungsang | 1 | Wayabaya (Barat Laut) | Sanghyang Ghana |
| 11 | Dungulan | 4 | Uttara (Utara) | Sanghyang Kamajaya |
| 12 | Kuningan | 6 | Ersania (Timur Laut) | Sanghyang Indra |
| 13 | Langkir | 5 | Purwa (Timur) | Sanghyang Kala |
| 14 | Medangsia | 8 | Agneya (Tenggara) | Sanghyang Brahma |
| 15 | Pujut | 9 | Daksina (Selatan) | Sanghyang Guritna |
| 16 | Pahang | 3 | Nerithi (Barat Daya) | Sanghyang Tantra |
| 17 | Krulut | 7 | Pascima (Barat) | Sanghyang Wisnu |
| 18 | Merakih | 1 | Wayabaya (Barat Laut) | Sanghyang Suranghana |
| 19 | Tambir | 4 | Uttara (Utara) | Sanghyang Shiwa |
| 20 | Medangkungan | 6 | Ersania (Timur Laut) | Sanghyang Basuki |
| 21 | Matal | 5 | Purwa (Timur) | Bhagawan Sakri |
| 22 | Uye | 8 | Agneya (Tenggara) | Sanghyang Kwera |
| 23 | Menail | 9 | Daksina (Selatan) | Sanghyang Citra Gotra |
| 24 | Prangbakat | 3 | Nerithi (Barat Daya) | Bhagawan Bisma |
| 25 | Bala | 7 | Pascima (Barat) | Sanghyang Dhurga |
| 26 | Ugu | 1 | Wayabaya (Barat Laut) | Sanghyang Singajalma |
| 27 | Wayang | 4 | Uttara (Utara) | Dewi Shri |
| 28 | Kulawu | 6 | Ersania (Timur Laut) | Sanghyang Sedana |
| 29 | Dukut | 5 | Purwa (Timur) | Sanghyang Baruna |
| 30 | Watugunung | 8 | Agneya (Tenggara) | Sanghyang Anantaboga |

---

### 1.3 Siklus Sasih (The 12-Sasih Lunisolar Cycle)
Siklus Sasih didasarkan pada peredaran bulan-matahari (Candra-Surya). Setiap sasih memiliki nama tradisional Bali, nama Sanskerta, rentang usia hari, dan padanan tanda zodiak tradisional (**Rashi**).

| No | Nama Sasih (Bali) | Nama Sanskerta | Usia Hari | Rashi / Zodiak Tradisional |
| :---: | :--- | :--- | :---: | :--- |
| 1 | Sasih Kasa | Shrawana | 30 | Singha (Singa) |
| 2 | Sasih Karo | Bhadrapada | 30 | Kania (Deha) |
| 3 | Sasih Ketiga | Asuji | 30 | Tula (Dacin) |
| 4 | Sasih Kapat | Kartika | 31 | Wercika (Teledu) |
| 5 | Sasih Kelima | Margha Sirsa | 30 | Dhanu (Panah) |
| 6 | Sasih Kenem | Pausya | 30 | Makara (Gajah Mina) |
| 7 | Sasih Kepitu | Magha | 30 | Kumbha (Jun) |
| 8 | Sasih Kawulu | Phalguna | 31 | Mina (Ulam) |
| 9 | Sasih Kesanga | Caitra | 31 | Mesha (Kambing) |
| 10 | Sasih Kedasa | Waishaka | 30 | Weresabha (Kebo) |
| 11 | Sasih Jesta | Jyestha | 30 | Mithuna (Anak Kembar) |
| 12 | Sasih Sadha | Asadha | 30 | Karka (Udang) |

#### Tanggal dan Panglong (Lunar Phase Calculation)
1. **Tanggal (Suklapaksa):** Periode bulan mati (Tilem) menuju bulan purnama (Purnama), dari tanggal 1 hingga 15.
2. **Panglong (Kresnapaksa):** Periode bulan purnama (Purnama) menuju bulan mati (Tilem), dari panglong 1 hingga 15.

---

## 2. Logika Aturan Precedensi: Mesin Alahing Sasih

Untuk menentukan apakah suatu hari adalah **Hari Baik (Dewasa Ayu)** atau **Hari Buruk (Dewasa Ala)** ketika terjadi benturan tanda penanggalan, mesin kalender harus mengevaluasi hierarki **Alahing Sasih**.

### 2.1 Definisi Kamus Istilah
* **Alah** = Kalah, Kawon
* **Kakwasan** = Kekuasaan, Otoritas
* **Kawenangan** = Wewenang, Dominasi

### 2.2 Algoritma Precedensi Waktu (Hierarki Alahing Sasih)
Logika pemrograman harus mengurutkan prioritas dari tingkat terlemah hingga terkuat. Jika suatu aturan di tingkat atas bertentangan dengan aturan di bawahnya, tingkat yang lebih tinggi mengalahkan/mengesampingkan tingkat di bawahnya.

$$\text{Wewaran} \prec \text{Wuku} \prec \text{Tanggal/Panglong} \prec \text{Sasih} \prec \text{Dawuh} \prec \text{Sanghyang Trayo Dhasa Saksi}$$

1. **Wewaran** dikalahkan oleh (**alah dening / kakwasa dening**) **Wuku**.
2. **Wuku** dikalahkan oleh **Tanggal / Panglong**.
3. **Tanggal / Panglong** dikalahkan oleh **Sasih**.
4. **Sasih** dikalahkan oleh **Dawuh** (Waktu Harian).
5. **Dawuh** dikalahkan oleh **Sanghyang Trayo Dhasa Saksi**.

*Contoh Implementasi Logika:*  
Jika hari Minggu (*Redite*) bertepatan dengan Wuku *Sinta*, maka pengaruh Wewaran Minggu dikalahkan oleh pengaruh Wuku Sinta (yang membawa larangan *Ingkel Wong*). Namun, jika pada hari itu terdapat penentuan *Tanggal* tertentu yang sangat sakral, pengaruh Wuku Sinta dapat dinetralisir sebagian oleh kekuatan spiritual Tanggal tersebut, dan seterusnya hingga ke tingkat *Dawuh* (jam pelaksanaan) dan kesaksian kosmis *Sanghyang Trayo Dhasa Saksi*.

---

### 2.3 Amretha Masaning Sasih (The Auspicious Lunar Seed Dates)
Aturan khusus dalam **Amretha Masaning Sasih** menetapkan satu tanggal *Ayu* (sangat baik) spesifik untuk masing-masing dari 12 Sasih yang dapat mengungguli pengaruh buruk harian lainnya:

* **I. Shrawana (Kasa)**: Tanggal 10 (*saraja karya ayu*)
* **II. Bhadrapada (Karo)**: Tanggal 7 (*amretha masa*)
* **III. Asuji (Ketiga)**: Tanggal 9 (*ayu*)
* **IV. Kartika (Kapat)**: Hari Purnama (*seraja karya ayu*)
* **V. Marghasirsa (Kelima)**: Hari Tilem (*nandur sarwa bungkah ayu*)
* **VI. Pausya (Kenem)**: Tanggal 8 (*amretha masa*)
* **VII. Magha (Kepitu)**: Tanggal 13 (*amretha masa*)
* **VIII. Phalguna (Kawulu)**: Tanggal 2 (*ayu*)
* **IX. Caitra (Kesanga)**: Tanggal 6 (*ayu*)
* **X. Waisyaka (Kedasa)**: Tanggal 4 (*saraja karya ayu*)
* **XI. Jyestha (Jesta)**: Tanggal 5 (*aworing desa ayu*)
* **XII. Asadha (Sadha)**: Tanggal 1 (*ayu*)

---

## 3. Logika Partisi Waktu Harian: Dawuh & Kutika Engine

Penentuan jam eksekusi upacara (*Dawuh*) adalah tingkat operasional tertinggi sebelum kesaksian kosmis. Mesin aplikasi harus membagi 12 jam siang (atau malam) ke dalam sistem pembagian khusus.

### 3.1 Panca Dawuh (Sistem 5 Jam)
Membagi periode siang hari (12 jam, diasumsikan pukul 06.00 hingga 18.00) menjadi 5 partisi waktu (masing-masing $\approx 2.4$ jam) dengan karakter spiritual berikut:

1. **Dharma Wangsa, Kertha** (Sangat Baik): Sabda Ayu, segala keinginan akan berhasil (*asing kinarsan kasidan*).
2. **Bhima, Pati** (Sangat Keras): Berkarakter kemarahan/panas, baik untuk mengalahkan musuh atau proteksi, tetapi **sangat buruk untuk perjalanan/bepergian** (*tan kenin malelungan*).
3. **Aruna / Arjuna, Ketara** (Baik): Cocok untuk menanam (*anandur ayu*), memakai pakaian baru/hiasan (*mangrangsuk guna ayu*), dilarang menyembunyikan sesuatu (*tan wenang masiliban*).
4. **Nakula, Peta** (Buruk): Berkarakter gelap (*mawak peteng*), sering menimbulkan pertengkaran verbal (*keni ujar ala*).
5. **Sadewa, Sunia** (Misterius): Berkarakter sunyi/kosong (*mawak sunia*), baik untuk pelepasan spiritual (*kalepasan*) atau kegiatan tak terlihat (*memaling ayu*).

---

### 3.2 Kutika Lima (Jam 06.00 - 18.00)
Sistem penanggalan mencocokkan setiap jam harian dengan siklus energi panca dewa berdasarkan indeks **Tanggal** atau **Panglong** hari berjalan (Indeks 1 s.d. 15):

#### Matriks Perputaran Dewa dalam Kutika Lima

| Partisi Dawuh | Rentang Jam | Urutan Perputaran Energi Dewa (Berdasarkan Hari 1-15) |
| :--- | :--- | :--- |
| **Dawuh I (Pisan)** | 06.00 - 08.30 | 1. Maheswara, 2. Kala, 3. Shri, 4. Brahma, 5. Wisnu, 6. Maheswara, 7. Kala, 8. Shri, 9. Brahma, 10. Wisnu, 11. Maheswara, 12. Kala, 13. Shri, 14. Brahma, 15. Wisnu |
| **Dawuh II (Kalih)** | 08.30 - 11.00 | 1. Wisnu, 2. Maheswara, 3. Kala, 4. Shri, 5. Brahma, 6. Wisnu, 7. Maheswara, 8. Kala, 9. Shri, 10. Brahma, 11. Wisnu, 12. Maheswara, 13. Kala, 14. Shri, 15. Brahma |
| **Dawuh III (Tiga)** | 11.00 - 13.00 | 1. Brahma, 2. Wisnu, 3. Maheswara, 4. Kala, 5. Shri, 6. Brahma, 7. Wisnu, 8. Maheswara, 9. Kala, 10. Shri, 11. Brahma, 12. Wisnu, 13. Maheswara, 14. Kala, 15. Shri |
| **Dawuh IV (Pat)** | 13.00 - 15.30 | 1. Shri, 2. Brahma, 3. Wisnu, 4. Maheswara, 5. Kala, 6. Shri, 7. Brahma, 8. Wisnu, 9. Maheswara, 10. Kala, 11. Shri, 12. Brahma, 13. Wisnu, 14. Maheswara, 15. Kala |
| **Dawuh V (Lima)** | 15.30 - 18.00 | 1. Kala, 2. Shri, 3. Brahma, 4. Wisnu, 5. Maheswara, 6. Kala, 7. Shri, 8. Brahma, 9. Wisnu, 10. Maheswara, 11. Kala, 12. Shri, 13. Wisnu*, 14. Maheswara*, 15. Kala* |

*\*Catatan Deviasi Dokumen fisik: Pada halaman 85, nomor urut 13 terlewati dalam pencetakan asli dokumen fisik, namun polanya tetap konsisten mengikuti rotasi melingkar (Kala -> Shri -> Brahma -> Wisnu -> Maheswara).*

#### Karakteristik Energi Dewa (Kutika Logic)
* **Maheswara & Shri** (Ayu): Sangat baik untuk upacara penyucian diri (*mapikenoh ring raga*), urusan kemasyarakatan, dan kenegaraan.
* **Brahma** (Keras/Panas): Baik khusus untuk pekerjaan membakar (*nerang*), menyalakan api dapur, atau membakar gerabah (*nunjel citakan*).
* **Wisnu** (Dingin/Air): Baik untuk memohon hujan (*ngujanang*) atau melakukan persembahyangan air (*nunas toya*).
* **Kala** (Buruk/Destruktif): Hanya boleh digunakan untuk aktivitas sesajen ke bawah (*Bhuta Yadnya*), sangat dilarang untuk aktivitas keselamatan diri.

---

## 4. Logika Batasan & Validasi (Constraint Validation Engine)

Aplikasi Kalender Bali harus memiliki modul **Constraint Checker** (mesin validasi larangan) untuk menolak penginputan tanggal yang membawa bencana (*ala dahat*).

### 4.1 Logika Penolak Otomatis Atiwa-tiwa (Pitra Yadnya Constraints)
Untuk mengesahkan sebuah tanggal sebagai **Ayu Atiwa-tiwa** (Hari Baik Pengabuan Jenazah), mesin harus memeriksa larangan berikut. Jika salah satu kondisi di bawah ini bernilai `TRUE`, sistem harus memancarkan peringatan merah (*Warning: Dewasa Ala*):

```python
# Contoh Pseudo-code Pemeriksa Larangan Atiwa-tiwa
def is_atiwa_tiwa_disabled(hari_sapta_wara, wuku, tanggal, panglong, sasih, kombinasi):
    # 1. Cek Ingkel Wong
    if wuku in ["Sinta", "Warigadean", "Medangsia", "Tambir", "Bala", "Ugu"]:
        return True, "Ingkel Wong: Pantangan Keras melakukan upacara Manusa & Pitra Yadnya."
        
    # 2. Cek Sasih Terlarang
    if sasih in ["Kartika", "Margasirsa", "Pausya", "Phalguna", "Caitra", "Waisyaka", "Jyestha", "Asadha"]:
        return True, f"Sasih Terlarang: Sasih {sasih} dilarang melakukan Atiwa-tiwa."
        
    # 3. Cek Tanggal & Panglong Mati (Pati Paten / Ala)
    if tanggal in [1, 6, 8, 9, 14] or panglong in [1, 6, 8, 9, 14]:
        return True, "Tanggal/Panglong Terlarang: Membawa energi kematian spiritual."
        
    # 4. Cek Wuku Mati secara Konseptual
    if wuku in ["Dungulan", "Kuningan", "Langkir", "Pujut"]:
        return True, "Wuku Terlarang: Wuku ini dilarang keras untuk Atiwa-tiwa."
        
    # 5. Cek Hari Spesifik Pembawa Siksaan Atma (Siksaan Roh)
    if hari_sapta_wara == "Redite" and kombinasi == "Umanis":
        return True, "Redite Umanis: Atma tiba ring kawah (Roh jatuh ke kawah neraka)."
    if hari_sapta_wara == "Anggara" and kombinasi == "Rudra":
        return True, "Anggara nuju Rudra: Pitra tiba ring api (Roh terjatuh ke dalam kobaran api)."
    if hari_sapta_wara == "Anggara" and kombinasi == "Yama":
        return True, "Anggara nuju Yama: Pitra tiba ring kawah (Roh disiksa di neraka)."
        
    # 6. Cek Larangan Kombinasi Kosmis
    if kombinasi in ["Sukra Kliwon", "Sukra Pon"]: # Kala Gotongan & Semut Sedulur
        return True, "Kala Gotongan / Semut Sedulur: Sangat berbahaya untuk membawa jenazah."
        
    # 7. Cek Kondisi Gagak Anungsang Pati
    if tanggal == 9 or panglong in [1, 6, 14]:
        return True, "Gagak Anungsang Pati: Roh leluhur tetap memikul kemalangan (atma kari kaunggahang mala)."
        
    return False, "Hari aman untuk Atiwa-tiwa."
```

---

### 4.2 Matriks Tika Atiwa-tiwa (Berdasarkan Tabel Halaman 2)
Ini adalah pemetaan biner langsung (`1` = Ayu / Hari Baik, `0` = Tanpa Tanda / Larangan) untuk 30 Wuku vs 7 Sapta Wara dalam Tika Atiwa-tiwa:

| No | Wuku | Red | Com | Ang | Bud | Wra | Suk | San | Keterangan |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | Sinta | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **Ingkel Wong** (Mutlak dilarang) |
| 2 | Landep | 1 | 0 | 0 | 0 | 0 | 0 | 0 | Ayu |
| 3 | Ukir | 1 | 1 | 1 | 0 | 1 | 1 | 1 | Ayu Sangat Banyak |
| 4 | Kulantir | 0 | 0 | 0 | 0 | 1 | 0 | 0 | Ayu |
| 5 | Tolu | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dilarang |
| 6 | Gumbreg | 0 | 0 | 0 | 0 | 0 | 1 | 1 | Ayu |
| 7 | Wariga | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dilarang |
| 8 | Warigadean | 1 | 0 | 0 | 0 | 0 | 0 | 1 | **Ingkel Wong** |
| 9 | Julungwangi | 1 | 0 | 0 | 1 | 0 | 0 | 0 | Ayu |
| 10 | Sungsang | 0 | 0 | 1 | 0 | 0 | 0 | 0 | Ayu |
| 11 | Dungulan | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dilarang |
| 12 | Kuningan | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dilarang |
| 13 | Langkir | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dilarang |
| 14 | Medangsia | 1 | 0 | 0 | 1 | 1 | 0 | 0 | **Ingkel Wong** |
| 15 | Pujut | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dilarang |
| 16 | Pahang | 0 | 0 | 1 | 0 | 0 | 1 | 0 | Ayu |
| 17 | Krulut | 1 | 0 | 0 | 0 | 0 | 1 | 0 | Ayu |
| 18 | Merakih | 1 | 0 | 1 | 0 | 0 | 1 | 0 | Ayu |
| 19 | Tambir | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **Ingkel Wong** |
| 20 | Medangkungan| 0 | 0 | 0 | 0 | 1 | 0 | 0 | Ayu |
| 21 | Matal | 0 | 0 | 0 | 0 | 0 | 1 | 1 | Ayu |
| 22 | Uye | 0 | 0 | 0 | 1 | 0 | 0 | 0 | Ayu |
| 23 | Menail | 1 | 0 | 0 | 0 | 0 | 0 | 0 | Ayu |
| 24 | Prangbakat | 1 | 0 | 0 | 0 | 0 | 0 | 0 | Ayu |
| 25 | Bala | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **Ingkel Wong** |
| 26 | Ugu | 0 | 1 | 0 | 0 | 0 | 0 | 0 | **Ingkel Wong** |
| 27 | Wayang | 1 | 0 | 0 | 1 | 0 | 0 | 0 | Ayu |
| 28 | Kulawu | 0 | 0 | 0 | 0 | 1 | 1 | 0 | Ayu |
| 29 | Dukut | 1 | 1 | 0 | 1 | 0 | 0 | 0 | Ayu |
| 30 | Watugunung | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dilarang |

---

## 5. Mesin Tenung Palelintangan & Eka Jala Reshi

Berdasarkan naskah halaman 90 s.d. 97, **Eka Jala Reshi** adalah sistem penentuan nasib/karakteristik hari berdasarkan titik temu antara **Sapta Wara** dan **Wuku**. Ini sangat penting untuk memancarkan deskripsi prediksi harian otomatis pada aplikasi kalender Anda.

### 5.1 Algoritma Pencarian Teks Eka Jala Reshi (Wuku 1 - 5)
Di bawah ini adalah pemetaan data string deskripsi harian untuk 5 wuku pertama. Developer dapat menjadikannya sebagai kamus data (*hash map* / *dictionary*):

```json
{
  "Sinta": {
    "Redite": "Suka Pinanggih",
    "Coma": "Buat Suka",
    "Anggara": "Manggih Suka",
    "Budha": "Buat Suka",
    "Wraspati": "Suka Pinanggih",
    "Sukra": "Suka Pinanggih",
    "Saniscara": "Manggih Suka"
  },
  "Landep": {
    "Redite": "Kamaranan",
    "Coma": "Buat Suka",
    "Anggara": "Kinasihan Jana",
    "Budha": "Wredhi Putra",
    "Wraspati": "Suka Rahayu",
    "Sukra": "Suka Pinanggih",
    "Saniscara": "Sidha Kasobagian"
  },
  "Ukir": {
    "Redite": "Kinasihan Jana",
    "Coma": "Buat Suka",
    "Anggara": "Kinasihan Jana",
    "Budha": "Tininggaling Suka",
    "Wraspati": "Rahayu",
    "Sukra": "Buat Sebet",
    "Saniscara": "Buat Astawa"
  },
  "Kulantir": {
    "Redite": "Langgeng Kayohanan",
    "Coma": "Wredhi Putra",
    "Anggara": "Manggih Suka",
    "Budha": "Sidha Kasobagian",
    "Wraspati": "Tininggaling Suka",
    "Sukra": "Suka Pinanggih",
    "Saniscara": "Bagna Mapasah"
  },
  "Tolu": {
    "Redite": "Maretaan",
    "Coma": "Buat Sebet",
    "Anggara": "Lewih Bagia",
    "Budha": "Suka Pinanggih",
    "Wraspati": "Buat Suka",
    "Sukra": "Manggih Suka",
    "Saniscara": "Suka Pinanggih"
  }
}
```

---

## 6. Contoh Pemodelan Data & JSON Schema untuk Seeding Database

Untuk mempercepat pengembangan aplikasi, developer dapat langsung menyalin berkas JSON di bawah ini untuk digunakan sebagai data awal (*seeding database*) pada database SQLite, PostgreSQL, atau MongoDB.

### 6.1 JSON Seed: Arah, Urip, dan Dewata Wewaran (`wewaran_seed.json`)
```json
{
  "wewaran": {
    "eka_wara": [
      { "name": "Luang", "urip": 1, "genah": "Aya Baya", "dewata": "Sanghyang Eka Taya" }
    ],
    "dwi_wara": [
      { "name": "Menga", "urip": 5, "genah": "Purwa", "dewata": "Sanghyang Ketu" },
      { "name": "Pepet", "urip": 7, "genah": "Pascima", "dewata": "Sanghyang Rabu" }
    ],
    "tri_wara": [
      { "name": "Pasah", "urip": 9, "genah": "Daksina", "dewata": "Sanghyang Cika" },
      { "name": "Beteng", "urip": 4, "genah": "Uttara", "dewata": "Sanghyang Wacika" },
      { "name": "Kajeng", "urip": 7, "genah": "Pascima", "dewata": "Sanghyang Manacika" }
    ],
    "panca_wara": [
      { "name": "Umanis", "urip": 5, "genah": "Purwa", "dewata": "Sanghyang Korsika" },
      { "name": "Pahing", "urip": 9, "genah": "Daksina", "dewata": "Dewa Brahma" },
      { "name": "Pon", "urip": 7, "genah": "Pascima", "dewata": "Dewa Mahadewa" },
      { "name": "Wage", "urip": 4, "genah": "Uttara", "dewata": "Dewa Wisnu" },
      { "name": "Kliwon", "urip": 8, "genah": "Madya", "dewata": "Dewa Siwa" }
    ]
  }
}
```

### 6.2 JSON Seed: Struktur 30 Wuku (`wuku_seed.json`)
```json
[
  { "id": 1, "name": "Sinta", "urip": 7, "genah": "Pascima", "dewata": "Sanghyang Yama Dipati" },
  { "id": 2, "name": "Landep", "urip": 1, "genah": "Wayabaya", "dewata": "Sanghyang Maha Dewa" },
  { "id": 3, "name": "Ukir", "urip": 4, "genah": "Uttara", "dewata": "Sanghyang Maha Yekti" },
  { "id": 4, "name": "Kulantir", "urip": 6, "genah": "Ersania", "dewata": "Sanghyang Langsar" },
  { "id": 5, "name": "Tolu", "urip": 5, "genah": "Purwa", "dewata": "Sanghyang Bhayu" }
]
```

---

## 7. Rekomendasi Implementasi Teknis (Engine Architecture)

1. **Modular Engine Design**: Pisahkan modul perhitungan kalender (konversi Masehi ke Saka/Wuku) dari modul pemeriksaan *Padewasan* (Constraint Checker). Hal ini memudahkan pembaruan aturan jika dikemudian hari ada penyesuaian khusus lokal (*Desta Loka Patra*).
2. **Boolean Matrix Representation**: Simpan tabel-tabel seperti *Tika Atiwa-tiwa* sebagai representasi matriks biner berindeks 2 dimensi `[wuku_id][sapta_wara_id]` untuk meminimalkan beban komputasi server.
3. **Multi-Siklus Parser**: Gunakan tanggal input (Gregorian/Masehi) sebagai kunci awal, konversikan ke jumlah hari Kumulatif semenjak epoch tertentu (misalnya awal tahun Saka), lalu lakukan operasi modulo untuk menentukan sisa hari pembagi masing-masing Wewaran dan Wuku.
   - Panca Wara: $\text{Jumlah Hari} \pmod 5$
   - Sapta Wara: $\text{Jumlah Hari} \pmod 7$
   - Wuku: $\lfloor\text{Jumlah Hari} / 7\rfloor \pmod{30}$

---
**Pernyataan Integritas Data**: Seluruh data numerik, teologis, dan deskriptif dalam dokumen spesifikasi ini 100% didasarkan pada naskah otentik **Buka Dewasa Bali.pdf** demi melestarikan akurasi spiritual dalam bentuk komputasi modern.
