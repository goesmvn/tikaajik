import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';

/* ---------------- alat bantu ---------------- */
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
  'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const SAPTA_DETAIL = [
  { nama: 'Soma', hari: 'Senin', planet: 'Candra (Bulan)', dewa: 'Bhatara Candra', aksara: 'ᬲᬵᬫ', urip: 4 },
  { nama: 'Anggara', hari: 'Selasa', planet: 'Anggara (Mars)', dewa: 'Bhatara Mangala', aksara: 'ᬅᬗ᭄ᬕᬭ', urip: 3 },
  { nama: 'Buda', hari: 'Rabu', planet: 'Budha (Merkurius)', dewa: 'Bhatara Budha', aksara: 'ᬩᬸᬥ', urip: 7 },
  { nama: 'Wraspati', hari: 'Kamis', planet: 'Wraspati (Yupiter)', dewa: 'Bhatara Brihaspati', aksara: 'ᬯ᭄ᬭᬲ᭄ᬧᬢᬶ', urip: 8 },
  { nama: 'Sukra', hari: 'Jumat', planet: 'Sukra (Venus)', dewa: 'Bhatara Sukra', aksara: 'ᬲᬸᬓ᭄ᬭ', urip: 6 },
  { nama: 'Saniscara', hari: 'Sabtu', planet: 'Saniscara (Saturnus)', dewa: 'Bhatara Sani', aksara: 'ᬲᬦᬶᬲ᭄ᬘᬭ', urip: 9 },
  { nama: 'Redite', hari: 'Minggu', planet: 'Surya (Matahari)', dewa: 'Sanghyang Bhaskara', aksara: 'ᬭᬾᬤᬶᬢᬾ', urip: 5 }
];
const SASIH = ['', 'Kasa', 'Karo', 'Katiga', 'Kapat', 'Kalima', 'Kanem', 'Kapitu', 'Kaulu',
  'Kasanga', 'Kadasa', 'Jyestha', 'Sadha'];
const SIFAT = ['Ayu', 'Ala', 'Ayu & Ala', 'Netral'];
/* Warna taraf dibedakan antara Ayu dan Ala sesuai tingkat taraf 9-step */
const WARNA_TARAF_AYU = ['transparent', '#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#388E3C', '#2E7D32', '#1B5E20'];
const WARNA_TARAF_ALA = ['transparent', '#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#B71C1C'];
const WARNA_TARAF = ['transparent', 'var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t4)', 'var(--t5)', 'var(--t6)', 'var(--t7)', 'var(--t8)', 'var(--t9)'];
const TARAF_NAMA = [
  'kosong',
  'Nistaning Nista',
  'Nistaning Madya',
  'Nistaning Utama',
  'Madyaning Nista',
  'Madyaning Madya',
  'Madyaning Utama',
  'Utamaning Nista',
  'Utamaning Madya',
  'Utamaning Utama'
];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dariIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmt = (s) => { const d = dariIso(s); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const fmtP = (s) => { const d = dariIso(s); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
const namaSasih = (n) => {
  n = String(n || '').trim(); if (!n) return '—';
  const mala = /^M\./i.test(n), x = parseInt(n.replace(/^M\./i, ''), 10);
  return x >= 1 && x <= 12 ? `${mala ? 'Mala ' : ''}${x} — ${SASIH[x]}` : n;
};
const pendek = (tp) => (tp || '').replace(/Penanggal\s*/, 'Tgl ').replace(/Panglong\s*/, 'Pgl ') || '—';

function usePesan() {
  const [pesan, set] = useState(null);
  useEffect(() => { if (pesan) { const t = setTimeout(() => set(null), 4500); return () => clearTimeout(t); } }, [pesan]);
  return [pesan, set];
}

/* ---------------- aplikasi ---------------- */
export default function App() {
  const [meta, setMeta] = useState(null);
  const [saya, setSaya] = useState(null);
  const [tab, setTab] = useState('kalender');
  const [tanggal, setTanggal] = useState(iso(new Date()));
  const [szi, setSzi] = useState(() => +(localStorage.getItem('tika_sz') ?? 1));
  const [galat, setGalat] = useState(null);
  const [layarMasuk, setLayarMasuk] = useState(false);

  useEffect(() => {
    const S = ['17px', '19px', '22px', '26px'];
    document.documentElement.style.setProperty('--base', S[szi]);
    localStorage.setItem('tika_sz', szi);
  }, [szi]);

  const muatSesi = useCallback(() => api.saya().then(setSaya).catch(() => setSaya({ masuk: false })), []);
  useEffect(() => { api.meta().then(setMeta).catch((e) => setGalat(e.message)); muatSesi(); }, [muatSesi]);

  if (galat) return <div className="wrap"><div className="app"><div className="pesan galat">
    <b>Tidak dapat menghubungi peladen.</b><br />{galat}<br />
    Pastikan peladen berjalan: <code>node server/index.js</code></div></div></div>;
  if (!meta || !saya) return <div className="wrap"><div className="app"><div className="muat">Memuat…</div></div></div>;

  if (!saya.masuk)
    return <Masuk selesai={() => { setLayarMasuk(false); setSaya(null); muatSesi(); }} />;

  if (saya.wajibGanti)
    return <div className="wrap"><div className="app"><GantiSandi wajib selesai={() => { setSaya(null); muatSesi(); }} /></div></div>;

  const bolehSunting = saya.masuk && (saya.peran === 'admin' || saya.peran === 'peranda');
  const TAB = [['kalender', '🗓', 'Kalender'], ['cari', '🔍', 'Cari Dewasa'], ['baik', '✦', 'Hari Baik'], ['tika', '▦', 'Papan Tika'],
    ...(bolehSunting ? [['kelola', '✎', 'Kelola']] : []), ['panduan', '📖', 'Panduan']];
  const keluar = async () => { await api.keluar(); setTab('kalender'); setSaya(null); muatSesi(); };
  const inisial = (saya.nama || '?').split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase();

  return (
    <div className="wrap">
      <div className="app">
        <div className="topbar">
          <div className="merek">Tika Digital<small>Wariga Bali</small></div>

          <div className="ikonnav">
            {TAB.map(([k, i, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); window.scrollTo(0, 0); }}
                title={l} aria-label={l} aria-current={tab === k ? 'page' : undefined}>
                <span className="ic" aria-hidden="true">{i}</span><span className="lb">{l}</span>
              </button>
            ))}
          </div>

          <div className="akun">
            <div className="tsize" title="Ukuran huruf">
              {[0, 1, 3].map((n, k) => (
                <button key={n} className={szi === n ? 'on' : ''} onClick={() => setSzi(n)}
                  style={{ fontSize: `${0.72 + k * 0.22}rem` }}
                  aria-label={`Huruf ${['kecil', 'sedang', 'besar'][k]}`}>A</button>
              ))}
            </div>
            {saya.masuk ? (<>
              <div className="avatar" aria-hidden="true">{inisial}</div>
              <div style={{ maxWidth: '9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div className="nm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={saya.nama}>{saya.nama}</div>
                <div className="pr">{PERAN_NAMA[saya.peran]}</div>
              </div>
              {bolehSunting && (
                <button className="btn aksi" onClick={() => { setTab('kelola'); window.scrollTo(0, 0); }} style={{ marginLeft: '.2rem', background: '#2E7D32', whiteSpace: 'nowrap' }}>
                  ✎ Panel Kelola
                </button>
              )}
              <button className="btn" onClick={keluar} style={{ whiteSpace: 'nowrap' }}>Keluar</button>
            </>) : (<>
              <div><div className="nm">Belum masuk</div><div className="pr">hanya dapat membaca</div></div>
              <button className="btn aksi" onClick={() => setLayarMasuk(true)}>Masuk</button>
            </>)}
          </div>
        </div>

        {tab === 'kalender' && <Kalender meta={meta} tanggal={tanggal} setTanggal={setTanggal} bolehSunting={bolehSunting} />}
        {tab === 'cari' && <div className="utama"><CariDewasa buka={(t) => { setTanggal(t); setTab('kalender'); }} /></div>}
        {tab === 'baik' && <div className="utama"><HariBaik meta={meta} buka={(t) => { setTanggal(t); setTab('kalender'); }} /></div>}
        {tab === 'tika' && <div className="utama"><PapanTika /></div>}
        {tab === 'kelola' && bolehSunting && <div className="utama"><Kelola meta={meta} saya={saya} /></div>}
        {tab === 'panduan' && <div className="utama"><Panduan meta={meta} /></div>}

        <footer className="kaki">
          <div className="kakiisi">
            <div>
              <div className="kakimerek">Tika Digital<span>Wariga · Padewasan Bali</span></div>
              <p>
                Kalender padewasan Bali yang menghitung sendiri Wewaran dan Wuku,
                sehingga berlaku untuk tahun mana pun.
              </p>
            </div>
            <div>
              <h4>Sumber Data</h4>
              <p>
                Berkas <i>Semara Tika Digital.xlsx</i> susunan<br />
                <b>Ida Bagus Ngurah Semara Manuaba</b><br />
                Grya Apuan, Bangli — hasil audit manual satu siklus Metonic (19 tahun).
              </p>
            </div>
            <div>
              <h4>Cakupan</h4>
              <p>
                {meta.jumlahDewasa} dewasa · data terverifikasi{' '}
                {fmt(meta.rentangExcel.mulai)} — {fmt(meta.rentangExcel.sampai)}.<br />
                Di luar rentang itu, tanggal Bali ditandai <b>proyeksi</b> dan menunggu
                penetapan rapat peranda.
              </p>
            </div>
          </div>
          <div className="kakibawah">
            Kesimpulan lima tingkat dan penggolongan Panca Yadnya adalah perhitungan
            turunan, bukan angka yang tertulis pada berkas asli.
          </div>
        </footer>
      </div>
    </div>
  );
}

const PERAN_NAMA = { admin: 'Pengelola', peranda: 'Peranda', pembaca: 'Pembaca' };

/* ---------------- Masuk & ganti sandi ---------------- */
function Masuk({ selesai, batal }) {
  const [f, setF] = useState({ namaPengguna: '', sandi: '' });
  const [galat, setGalat] = useState(null);
  const [sibuk, setSibuk] = useState(false);
  const kirim = async (e) => {
    e?.preventDefault();
    setSibuk(true); setGalat(null);
    try { await api.masuk(f); selesai(); }
    catch (err) { setGalat(err.message); } finally { setSibuk(false); }
  };
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a0f07 0%, #2c1a0e 50%, #402412 100%)',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '54rem',
        borderRadius: '1.2rem',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(212,175,55,0.3)',
        background: 'var(--kartu, #fff)'
      }}>
        {/* Sisi Kiri: Gambar Nuansa Bali & Identitas Tika Digital */}
        <div style={{
          flex: '1 1 20rem',
          position: 'relative',
          background: 'linear-gradient(rgba(20, 10, 5, 0.5), rgba(40, 20, 10, 0.8)), url("https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#fff',
          boxSizing: 'border-box',
          minHeight: '16rem'
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              padding: '.3rem .8rem',
              borderRadius: '2rem',
              background: 'rgba(212,175,55,0.25)',
              border: '1px solid rgba(212,175,55,0.6)',
              color: '#F9E0AE',
              fontSize: '.78rem',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              Wariga &amp; Padewasan Bali
            </div>
            <h1 style={{
              fontFamily: "'Lora', serif",
              fontSize: '2.2rem',
              fontWeight: 700,
              margin: '0 0 .5rem',
              lineHeight: 1.2,
              color: '#FFF8E7',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>
              Tika Digital
            </h1>
            <p style={{
              fontSize: '.95rem',
              lineHeight: 1.6,
              color: '#E6D7C3',
              maxWidth: '22rem',
              margin: 0,
              opacity: .95
            }}>
              Sistem Penanggalan &amp; Kalender Bali Digital berbasis Algoritma Pawukon &amp; Lunisolar Sasih secara Presisi.
            </p>
          </div>

          <div style={{
            padding: '.8rem 1rem',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            borderRadius: '.8rem',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '.82rem',
            color: '#F0E6D2',
            marginTop: '1.5rem'
          }}>
            “Alah Dening Sasih — Rahayu ring Waktu, Selamat ring Dewasa.”
          </div>
        </div>

        {/* Sisi Kanan: Login Form */}
        <div style={{
          flex: '1 1 20rem',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'var(--kartu, #ffffff)',
          boxSizing: 'border-box'
        }}>
          <h2 style={{
            fontFamily: "'Lora', serif",
            fontSize: '1.6rem',
            margin: '0 0 .3rem',
            color: 'var(--tulis, #2c1a0e)'
          }}>Masuk ke Aplikasi</h2>
          <p className="sub" style={{ margin: '0 0 1.5rem', fontSize: '.85rem' }}>
            Masukkan nama pengguna dan kata sandi Anda untuk mengakses kalender.
          </p>

          {galat && <div className="pesan galat" style={{ marginBottom: '1rem' }}>{galat}</div>}

          <form onSubmit={kirim}>
            <label className="fl" style={{ fontWeight: 600, fontSize: '.82rem' }}>Nama Pengguna</label>
            <input type="text" autoFocus autoComplete="username" value={f.namaPengguna}
              onChange={(e) => setF({ ...f, namaPengguna: e.target.value })}
              style={{
                width: '100%',
                padding: '.7rem .9rem',
                borderRadius: '.5rem',
                border: '1px solid var(--garis2, #ccc)',
                fontSize: '.95rem',
                boxSizing: 'border-box'
              }} />

            <label className="fl" style={{ marginTop: '1rem', fontWeight: 600, fontSize: '.82rem' }}>Kata Sandi</label>
            <input type="password" autoComplete="current-password" value={f.sandi}
              onChange={(e) => setF({ ...f, sandi: e.target.value })}
              style={{
                width: '100%',
                padding: '.7rem .9rem',
                borderRadius: '.5rem',
                border: '1px solid var(--garis2, #ccc)',
                fontSize: '.95rem',
                boxSizing: 'border-box'
              }} />

            <button type="submit" className="btn aksi" disabled={sibuk} style={{
              width: '100%',
              marginTop: '1.6rem',
              padding: '.8rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '.5rem',
              cursor: 'pointer',
              background: '#B71C1C',
              color: '#ffffff',
              border: 'none'
            }}>
              {sibuk ? 'Memeriksa…' : 'Masuk Kalender'}
            </button>

            {batal && (
              <button type="button" className="btn" onClick={batal} style={{
                width: '100%',
                marginTop: '.6rem',
                padding: '.6rem'
              }}>
                Batal
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function GantiSandi({ wajib, selesai, batal }) {
  const [f, setF] = useState({ sandiLama: '', sandiBaru: '', ulangi: '' });
  const [galat, setGalat] = useState(null);
  const kirim = async (e) => {
    e?.preventDefault();
    setGalat(null);
    if (f.sandiBaru !== f.ulangi) return setGalat('Kata sandi baru dan ulangannya tidak sama.');
    try { await api.gantiSandi(f); selesai(); }
    catch (err) { setGalat(err.message); }
  };
  return (
    <div className="panel" style={{ maxWidth: '32rem', margin: '3rem auto' }}>
      <h2>{wajib ? 'Ganti Kata Sandi Dahulu' : 'Ganti Kata Sandi'}</h2>
      {wajib && <div className="pesan info">Kata sandi Anda masih bawaan pengelola. Demi keamanan, gantilah sebelum memakai aplikasi.</div>}
      {galat && <div className="pesan galat">{galat}</div>}
      <form onSubmit={kirim}>
        <label className="fl">Kata sandi sekarang</label>
        <input type="password" autoComplete="current-password" value={f.sandiLama}
          onChange={(e) => setF({ ...f, sandiLama: e.target.value })} />
        <label className="fl" style={{ marginTop: '.8rem' }}>Kata sandi baru (minimal 8 huruf)</label>
        <input type="password" autoComplete="new-password" value={f.sandiBaru}
          onChange={(e) => setF({ ...f, sandiBaru: e.target.value })} />
        <label className="fl" style={{ marginTop: '.8rem' }}>Ulangi kata sandi baru</label>
        <input type="password" autoComplete="new-password" value={f.ulangi}
          onChange={(e) => setF({ ...f, ulangi: e.target.value })} />
        <p className="sub" style={{ marginTop: '.5rem' }}>Sesudah diganti, Anda akan diminta masuk kembali.</p>
        <div className="baris">
          <button type="submit" className="btn aksi">Simpan</button>
          {batal && <button type="button" className="btn" onClick={batal}>Batal</button>}
        </div>
      </form>
    </div>
  );
}

/* ---------------- Kalender ---------------- */
function Kalender({ meta, tanggal, setTanggal, bolehSunting }) {
  const awal = dariIso(tanggal);
  const [bln, setBln] = useState({ t: awal.getFullYear(), b: awal.getMonth() + 1 });
  const [hari, setHari] = useState([]);
  const [detail, setDetail] = useState(null);
  const [pekan, setPekan] = useState([]);
  const [tampil, setTampil] = useState('bulan');
  const [sibuk, setSibuk] = useState(false);
  const [popup, setPopup] = useState(false);

  // Esc menutup jendela — jalan keluar cadangan bila tombol ✕ terlewat.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setPopup(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const muatBulan = useCallback(() => {
    setSibuk(true);
    api.bulan(bln.t, bln.b).then(setHari).finally(() => setSibuk(false));
  }, [bln]);
  useEffect(muatBulan, [muatBulan]);

  const muatDetail = useCallback(() => { api.hari(tanggal).then(setDetail); }, [tanggal]);
  useEffect(muatDetail, [muatDetail]);

  // Tampilan pekan perlu daftar dewasa tiap hari, jadi ditarik per tanggal.
  const hariPekan = useCallback(() => {
    const d = dariIso(tanggal);
    const geser = (d.getDay() + 6) % 7;                 // pekan dimulai Senin
    const senin = new Date(d); senin.setDate(d.getDate() - geser);
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(senin); x.setDate(senin.getDate() + i); return iso(x); });
  }, [tanggal]);

  const muatPekan = useCallback(() => {
    if (tampil !== 'pekan') return;
    setSibuk(true);
    Promise.all(hariPekan().map((t) => api.hari(t))).then(setPekan).finally(() => setSibuk(false));
  }, [tampil, hariPekan]);
  useEffect(muatPekan, [muatPekan]);

  const hariIni = iso(new Date());

  const bukaTanggal = (t) => { pilihTanggal(t); setPopup(true); };
  const pilihTanggal = (t) => {
    setTanggal(t);
    const d = dariIso(t);
    if (d.getMonth() + 1 !== bln.b || d.getFullYear() !== bln.t) setBln({ t: d.getFullYear(), b: d.getMonth() + 1 });
  };
  const geserBulan = (n) => setBln(({ t, b }) => {
    const m = b - 1 + n; return { t: t + Math.floor(m / 12), b: ((m % 12) + 12) % 12 + 1 };
  });

  return (
    <>
      <div className="rangka">
        <div className="kolomkiri">
          <MiniKalender bln={bln} setBln={setBln} geser={geserBulan} tanggal={tanggal} hariIni={hariIni} pilih={pilihTanggal} />

          <div className="kartu">
            <h3>Putusan hari terpilih</h3>
            {detail && <>
              <PutusanKeperluan k={detail.keperluan} ringkas />
              <div style={{ fontSize: '.72rem', color: 'var(--tulis3)', textAlign: 'center', margin: '.3rem 0 .5rem' }}>
                Angka = bobot terkuat (1 Hitam · 2 Coklat · 3 Hijau · 4 Biru),
                menurut kaidah alah dening alah. Dari {detail.dewasa.length} dewasa.
              </div>
              <div className="blnbaris" style={{ justifyContent: 'center', marginBottom: '.4rem' }}>
                <BulanFase tp={detail.tp} ukuran={20} />
                <span style={{ fontSize: '.8rem' }}>{detail.tp}</span>
                <Fase h={detail} kecil />
              </div>
              <Strip n={detail.nilai} meta={meta} />
              <div style={{ height: '.6rem' }} />
              <RinciKeperluan d={detail} meta={meta} />
              <button className="btn bukapenuh" onClick={() => setPopup(true)}>Lihat keterangan lengkap</button>
              <div style={{ height: '.5rem' }} />
            </>}
            {!detail ? <div className="muat">Memuat…</div> : detail.dewasa.length === 0
              ? <p className="sub" style={{ margin: 0 }}>Tidak ada dewasa khusus.</p>
              : <div className="ringkas">
                  {detail.dewasa.map((x) => (
                    <div key={x.id} className="ritem">
                      <span className="titik" style={{ background: WARNA_SIFAT[x.sifat], borderColor: WARNA_SIFAT[x.sifat] }} />
                      <span><b>{x.nama}</b> <span className="tk">{SIFAT[x.sifat]}</span></span>
                    </div>
                  ))}
                </div>}
          </div>

        </div>

        <div className="utama">
          <div className="judulbar" style={{ gap: '.4rem', flexWrap: 'wrap' }}>
            <button className="navbtn" onClick={() => geserBulan(-1)} aria-label="Bulan sebelumnya">‹</button>

            {/* Selector Bulan & Tahun Masehi */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <select value={bln.b} onChange={(e) => setBln({ ...bln, b: +e.target.value })}
                aria-label="Pilih Bulan"
                style={{ fontSize: '1rem', fontWeight: 700, padding: '.2rem .4rem', borderRadius: '.3rem', border: '1px solid var(--garis2)', background: 'var(--kartu)' }}>
                {BULAN.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>{m}</option>
                ))}
              </select>

              <select value={bln.t} onChange={(e) => setBln({ ...bln, t: +e.target.value })}
                aria-label="Pilih Tahun"
                style={{ fontSize: '1rem', fontWeight: 700, padding: '.2rem .4rem', borderRadius: '.3rem', border: '1px solid var(--garis2)', background: 'var(--kartu)' }}>
                {Array.from({ length: 151 }, (_, i) => 1950 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button className="navbtn" onClick={() => geserBulan(1)} aria-label="Bulan berikutnya">›</button>
            <button className="navbtn utamai" onClick={() => { const d = new Date(); setBln({ t: d.getFullYear(), b: d.getMonth() + 1 }); setTanggal(iso(d)); }}>Hari Ini</button>
            
            {hari.length > 0 && (
              <span style={{ fontFamily: "'Lora',serif", fontSize: '.75rem', color: '#F0D2D2', marginLeft: '.2rem' }}>
                Sasih {namaSasih(hari[Math.floor(hari.length / 2)].sasih)}
              </span>
            )}

            <div className="segmen" style={{ marginLeft: 'auto' }}>
              {[['bulan', 'Bulan'], ['pekan', 'Pekan'], ['hari', 'Hari']].map(([v, l]) => (
                <button key={v} className={tampil === v ? 'on' : ''} onClick={() => setTampil(v)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="striplegenda">
            <b style={{ color: 'var(--tulis)' }}>Strip 4 warna:</b>
            <span>Ngaben Ayu · Ngaben Ala · Pawiwahan Ayu · Pawiwahan Ala</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
              <span className="kk" key={t}>
                <i className={`t${t}`} style={{ background: WARNA_TARAF_AYU[t] }} />
                {TARAF_NAMA[t]}
              </span>
            ))}
            <span className="kk"><i style={{ background: 'repeating-linear-gradient(45deg,#fff 0 3px,#EFEAE2 3px 6px)' }} />kosong</span>
            <span className="kk"><i style={{ background: '#C22F2F', borderRadius: '50%' }} />angka Penanggal</span>
            <span className="kk"><i style={{ background: '#3B6FB5', borderRadius: '50%' }} />angka Panglong</span>
          </div>

          {sibuk && <div className="muat">Menghitung…</div>}

          {!sibuk && tampil === 'bulan' && (
            <TampilBulan hari={hari} bln={bln} tanggal={tanggal} hariIni={hariIni}
              meta={meta} pilih={bukaTanggal} />
          )}
          {!sibuk && tampil === 'pekan' && (
            <TampilPekan pekan={pekan} tanggal={tanggal} hariIni={hariIni}
              meta={meta} pilih={bukaTanggal} />
          )}
          {!sibuk && tampil === 'hari' && detail && (<>
            <TampilHari d={detail} meta={meta} />
            <button className="navbtn utamai bukapenuh" onClick={() => setPopup(true)}>
              Lihat keterangan lengkap
            </button>
          </>)}

          <p className="sub" style={{ margin: '.9rem 0 0', fontSize: '.8rem' }}>
            Blok berwarna = dewasa yang berlaku: <b style={{ color: 'var(--ayuT)' }}>hijau Ayu</b>,
            <b style={{ color: 'var(--alaT)' }}> merah Ala</b>, <b style={{ color: 'var(--duaT)' }}>jingga Ayu &amp; Ala</b>.
            Border dan outline menunjukkan taraf kekuatan: <b style={{ color: '#2E7D32' }}>hijau (Ayu, skala 1-9)</b> dan <b style={{ color: '#D32F2F' }}>merah (Ala, skala 1-9)</b>.
            Kolom bergaris miring berarti tanggal Bali-nya masih <b>proyeksi</b>, menunggu penetapan rapat peranda.
          </p>
        </div>
      </div>

      {popup && detail && (
        <div className="kalpop" role="dialog" aria-modal="true" aria-label="Keterangan tanggal"
          onClick={(e) => { if (e.target === e.currentTarget) setPopup(false); }}>
          <DetailHari d={detail} meta={meta} bolehSunting={bolehSunting} tutup={() => setPopup(false)}
            muatUlang={() => { muatDetail(); muatBulan(); muatPekan(); }} />
        </div>
      )}
    </>
  );
}


/**
 * Lambang fase bulan. Bagian terangnya dihitung dari Penanggal/Panglong:
 * Penanggal 1..15 = paro terang menuju Purnama, Panglong 1..15 = paro gelap
 * menuju Tilem. Karena digambar tiap hari, peredarannya terlihat berlanjut
 * dari kotak ke kotak — tidak putus di pergantian bulan Masehi.
 */
function BulanFase({ tp, ukuran = 14, terang = '#C99A2E', gelap = '#EDE8DF', garis = '#B0A79A' }) {
  const pen = /Penanggal\s*(\d+)/i.exec(tp || '');
  const pang = /Pang?e?long\s*(\d+)/i.exec(tp || '');
  let f = null, naik = true;
  if (pen) { naik = true; f = Math.min(1, +pen[1] / 15); }
  else if (pang) { naik = false; f = Math.max(0, 1 - +pang[1] / 15); }
  if (f === null) return null;
  const r = ukuran / 2;
  const rx = Math.abs(1 - 2 * f) * r;
  const besar = f > 0.5 ? 1 : 0;
  const jalur = `M 0,${-r} A ${r},${r} 0 0 1 0,${r} A ${rx},${r} 0 0 ${besar} 0,${-r}`;
  const judul = pen ? `Penanggal ${pen[1]} — paro terang` : `Panglong ${pang[1]} — paro gelap`;
  return (
    <svg className="bln" width={ukuran} height={ukuran}
      viewBox={`${-r - 1} ${-r - 1} ${ukuran + 2} ${ukuran + 2}`} role="img" aria-label={judul}>
      <title>{judul}</title>
      <circle r={r} fill={gelap} stroke={garis} strokeWidth="1" />
      <path d={jalur} fill={terang} transform={naik ? undefined : 'scale(-1,1)'} />
    </svg>
  );
}

/** Penanda Purnama / Tilem, selalu disertai tulisan — bukan lambang saja. */
function Fase({ h, kecil }) {
  const k = kecil ? ' fasekecil' : '';
  const beda = (h.purnama !== h.purnamaAstro) || (h.tilem !== h.tilemAstro);
  const tanda = [];
  if (h.purnama) tanda.push(<span key="p" className={'fase purnama' + k}>PURNAMA</span>);
  if (h.tilem) tanda.push(<span key="t" className={'fase tilem' + k}>TILEM</span>);
  if (!h.purnama && !h.tilem) {
    if (h.purnamaAstro) tanda.push(<span key="pa" className={'fase selisih' + k}
      title={`Purnama astronomis (${h.tpAstronomis}), tetapi menurut penanggalan tradisional ${h.tp}`}>PURNAMA ✳</span>);
    if (h.tilemAstro) tanda.push(<span key="ta" className={'fase selisih' + k}
      title={`Tilem astronomis (${h.tpAstronomis}), tetapi menurut penanggalan tradisional ${h.tp}`}>TILEM ✳</span>);
  } else if (beda) {
    tanda.push(<span key="b" className={'fase selisih' + k}
      title={`Menurut astronomi hari ini ${h.tpAstronomis}`}>✳ selisih</span>);
  }
  return tanda.length ? <>{tanda}</> : null;
}


/**
 * Rincian satu hari menurut keperluan: Ngaben & Pawiwahan diambil dari kolom
 * taraf bawaan Excel (data asli penyusun), sedangkan Panca Yadnya disimpulkan
 * dari kalimat keterangan dewasa yang berlaku hari itu.
 */
function RinciKeperluan({ d, meta }) {
  const nilaiTaraf = (a, l) => {
    if (!a.taraf && !l.taraf) return <span className="val kosong">tanpa penanda</span>;
    return (
      <span className="val ada">
        {a.taraf ? `Ayu ${meta.taraf[a.taraf].nama}` : 'tanpa Ayu'}
        {' · '}
        {l.taraf ? `Ala ${meta.taraf[l.taraf].nama}` : 'tanpa Ala'}
      </span>
    );
  };
  return (
    <div className="rinci">
      <div className="kepala">Menurut kolom Excel</div>
      <span className="lbl">Ngaben</span>{nilaiTaraf(d.nilai.ngabenAyu, d.nilai.ngabenAla)}
      <span className="lbl">Pawiwahan</span>{nilaiTaraf(d.nilai.pawiwahanAyu, d.nilai.pawiwahanAla)}

      <div className="pisah" />
      <div className="kepala">Panca Yadnya</div>
      {(d.daftarYadnya || []).map((y) => {
        const o = d.yadnya?.[y.kunci];
        return (
          <React.Fragment key={y.kunci}>
            <span className="lbl" title={y.jelas}>{y.nama}</span>
            {o && o.tingkat
              ? <span className="val ada"><span className={`mini5 k${o.tingkat}`}
                  title={`${o.dewasa.map((x) => `${x.nama} (${x.nada})`).join(', ')}`}>{o.nama}</span></span>
              : <span className="val kosong">tidak disinggung</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}


/**
 * Alah dening alah — yang lemah kalah oleh yang lebih kuat.
 * Bobot 1–4 setara warna penyusun: Hitam, Coklat, Hijau, Biru.
 */
const NAMA_BOBOT = ['—', 'Hitam', 'Coklat', 'Hijau', 'Biru'];

function AlahDeningAlah({ a, ringkas }) {
  if (!a) return null;
  const sisi = (judul, o, kelas) => (
    <div className={`adasisi ${kelas} ${a.kode === kelas + '-menang' ? 'menang' : ''}`}>
      <div className="jd">{judul}</div>
      <div className="bb">{o.bobot || '—'}</div>
      <div className="nb">{o.bobot ? NAMA_BOBOT[o.bobot] : 'tanpa bobot'}</div>
      {!ringkas && o.dewasa.length > 0 &&
        <div className="dw" title={o.dewasa.join(', ')}>{o.dewasa.join(', ')}</div>}
    </div>
  );
  return (
    <div className="ada">
      <div className="adabaris">
        {sisi('Ayu', a.ayu, 'ayu')}
        <div className="adalawan">{a.selisih > 0 ? '›' : a.selisih < 0 ? '‹' : '='}</div>
        {sisi('Ala', a.ala, 'ala')}
      </div>
      <div className={`adaputusan p-${a.kode}`}>{a.teks}</div>
    </div>
  );
}


const KEPERLUAN = [
  ['umum', 'Umum', 'Seluruh dewasa hari itu + kedua kolom Excel'],
  ['ngaben', 'Ngaben', 'Pitra Yadnya — dewasa yang menyinggungnya + kolom Ngaben'],
  ['pawiwahan', 'Pawiwahan', 'Manusa Yadnya — dewasa yang menyinggungnya + kolom Pawiwahan'],
  ['dewa', 'Dewa Yadnya', 'Piodalan, ngenteg linggih'],
  ['rsi', 'Rsi Yadnya', 'Madiksa, mawinten'],
  ['bhuta', 'Bhuta Yadnya', 'Caru, tawur'],
];

/**
 * Putusan alah dening alah, dipisah per keperluan. Satu hari dapat berbeda
 * putusannya untuk Ngaben dan untuk Pawiwahan, jadi tidak diringkas jadi
 * satu angka.
 */
function PutusanKeperluan({ k, ringkas }) {
  if (!k) return null;
  const label = { 'ayu-menang': 'Ayu unggul', 'ala-menang': 'Ala unggul',
    'seimbang': 'Seimbang', 'netral': 'Tanpa penanda' };
  return (
    <table className="kpt">
      <thead><tr><th>Keperluan</th><th>Ayu</th><th>Ala</th><th>Putusan</th></tr></thead>
      <tbody>
        {KEPERLUAN.map(([kunci, nama, jelas]) => {
          const a = k[kunci]; if (!a) return null;
          if (ringkas && a.kode === 'netral' && kunci !== 'umum') return null;
          return (
            <tr key={kunci} className={kunci === 'umum' ? 'utamabaris' : ''}>
              <td title={jelas}>{nama}</td>
              <td className={`bb ${a.selisih > 0 ? 'unggul' : ''}`}>{a.ayu.bobot || '–'}</td>
              <td className={`bb ${a.selisih < 0 ? 'unggul' : ''}`}>{a.ala.bobot || '–'}</td>
              <td><span className={`kpv p-${a.kode}`}>{label[a.kode]}</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const WARNA_SIFAT = ['var(--ayu)', 'var(--ala)', 'var(--dua)', 'var(--net)'];

/** Strip empat warna dengan susunan sama seperti kolom pada berkas Excel. */
function Strip({ n, meta, ket = true }) {
  const kolom = [
    { nama: 'Ngaben Ayu', taraf: n.ngabenAyu.taraf, sisi: 'ayu' },
    { nama: 'Ngaben Ala', taraf: n.ngabenAla.taraf, sisi: 'ala' },
    { nama: 'Pawiwahan Ayu', taraf: n.pawiwahanAyu.taraf, sisi: 'ayu' },
    { nama: 'Pawiwahan Ala', taraf: n.pawiwahanAla.taraf, sisi: 'ala' },
  ];
  return (
    <>
      <span className="strip">
        {kolom.map(({ nama, taraf, sisi }, i) => {
          const warna = taraf ? (sisi === 'ayu' ? WARNA_TARAF_AYU[taraf] : WARNA_TARAF_ALA[taraf]) : '';
          return (
            <i key={i} className={taraf ? '' : 'kosong'}
              style={taraf ? { background: warna } : {}}
              title={`${nama}: ${taraf ? TARAF_NAMA[taraf] : 'kosong'}`} />
          );
        })}
      </span>
      {ket && <span className="stripket"><span>NGABEN</span><span>PAWIWAHAN</span></span>}
    </>
  );
}

/** Kesimpulan lima tingkat, selalu berupa tulisan — bukan warna saja. */
function Simpul({ k, kecil }) {
  if (!k) return null;
  const mapTingkatTaraf = [
    'kosong', 
    '#B71C1C', // Sangat Ala -> Taraf Ala 9 (Utamaning Utama Ala)
    '#EF5350', // Ala -> Taraf Ala 5 (Madyaning Madya Ala)
    '#7C7268', // Sedang -> Netral
    '#66BB6A', // Ayu -> Taraf Ayu 5 (Madyaning Madya Ayu)
    '#1B5E20'  // Sangat Ayu -> Taraf Ayu 9 (Utamaning Utama Ayu)
  ];
  const warnaText = k.tingkat === 3 ? '#fff' : (k.tingkat === 1 || k.tingkat === 5 ? '#fff' : '#2B2B2B');
  const bg = mapTingkatTaraf[k.tingkat] || 'var(--kartu3)';
  const border = k.tingkat === 3 ? 'var(--garis2)' : bg;

  return (
    <span className="simpul" 
      style={{ background: bg, color: warnaText, borderColor: border }} 
      title={`Ayu ${k.ayu} · Ala ${k.ala}`}>
      {kecil ? k.ringkas : k.nama}
    </span>
  );
}

function MiniKalender({ bln, setBln, geser, tanggal, hariIni, pilih }) {
  const jml = new Date(bln.t, bln.b, 0).getDate();
  const depan = (new Date(bln.t, bln.b - 1, 1).getDay() + 6) % 7;   // Senin dulu
  const sel = [];
  for (let i = 0; i < depan; i++) sel.push(null);
  for (let d = 1; d <= jml; d++) sel.push(d);
  const minggu = [];
  for (let i = 0; i < sel.length; i += 7) minggu.push(sel.slice(i, i + 7));
  const tgl = (d) => `${bln.t}-${String(bln.b).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return (
    <div className="kartu">
      <div className="miniatas" style={{ gap: '.2rem' }}>
        <select value={bln.b} onChange={(e) => setBln({ ...bln, b: +e.target.value })}
          style={{ fontSize: '.8rem', fontWeight: 700, padding: '.1rem .2rem' }}>
          {BULAN.map((m, idx) => <option key={idx + 1} value={idx + 1}>{m.slice(0, 3)}</option>)}
        </select>
        <select value={bln.t} onChange={(e) => setBln({ ...bln, t: +e.target.value })}
          style={{ fontSize: '.8rem', fontWeight: 700, padding: '.1rem .2rem' }}>
          {Array.from({ length: 151 }, (_, i) => 1950 + i).map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="baris" style={{ marginLeft: 'auto' }}>
          <button className="bulat" style={{ width: '1.8rem', height: '1.8rem', fontSize: '.8rem' }} onClick={() => geser(-1)} aria-label="Bulan sebelumnya">‹</button>
          <button className="bulat" style={{ width: '1.8rem', height: '1.8rem', fontSize: '.8rem' }} onClick={() => geser(1)} aria-label="Bulan berikutnya">›</button>
        </span>
      </div>
      <table className="mini">
        <thead><tr>{['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((x, i) => <th key={i}>{x}</th>)}</tr></thead>
        <tbody>
          {minggu.map((w, i) => (
            <tr key={i}>{w.map((d, j) => (
              <td key={j}>{d && (
                <button onClick={() => pilih(tgl(d))}
                  className={`${tgl(d) === tanggal ? 'pilih' : ''} ${tgl(d) === hariIni ? 'ini' : ''}`}>{d}</button>
              )}</td>
            ))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TampilBulan({ hari, bln, tanggal, hariIni, meta, pilih }) {
  const depan = (new Date(bln.t, bln.b - 1, 1).getDay() + 6) % 7;
  const ingkelMingguIni = hari.length > 0 ? (hari[Math.floor(hari.length / 2)]?.ingsadNama || '—') : '—';
  return (
    <div className="bulangrid">
      {SAPTA_DETAIL.map((s) => (
        <div key={s.nama} className="harikepala" title={`${s.nama} (${s.hari}) · Planet: ${s.planet} · Dewa: ${s.dewa} · Urip: ${s.urip} · Ingkel: ${ingkelMingguIni}`}>
          <div className="nm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}>
            <span>{s.nama}</span>
            <span style={{ fontSize: '.85rem', fontFamily: "'Noto Serif Balinese', serif", color: 'var(--brass, #C99A2E)' }}>{s.aksara}</span>
          </div>
          <div className="tg">{s.hari} · {s.planet.split(' ')[0]}</div>
          <div style={{ fontSize: '.68rem', color: 'var(--tulis3)', marginTop: '.1rem' }}>{s.dewa}</div>
          <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'var(--merah2, #8A2A2A)', marginTop: '.1rem' }}>Ingkel {ingkelMingguIni}</div>
        </div>
      ))}
      {Array.from({ length: depan }, (_, i) => <div key={'k' + i} className="bsel luar" />)}
      {hari.map((h) => {
        // Tentukan intensitas warna line/border berdasarkan taraf ayu/ala
        let gayaBatas = {};
        if (h.nilai.ngabenAyu.taraf > 0 || h.nilai.pawiwahanAyu.taraf > 0) {
          const tarafAyu = Math.max(h.nilai.ngabenAyu.taraf, h.nilai.pawiwahanAyu.taraf);
          gayaBatas = { borderColor: WARNA_TARAF_AYU[tarafAyu], borderWidth: '2px' };
        }
        if (h.nilai.ngabenAla.taraf > 0 || h.nilai.pawiwahanAla.taraf > 0) {
          const tarafAla = Math.max(h.nilai.ngabenAla.taraf, h.nilai.pawiwahanAla.taraf);
          // Ala mewarnai garis tepi luar jika ada, atau menimpa ayu bila tingkatnya sangat tinggi
          gayaBatas = { borderColor: WARNA_TARAF_ALA[tarafAla], borderWidth: '2px', ...gayaBatas, outline: `1px solid ${WARNA_TARAF_ALA[tarafAla]}` };
        }

        return (
          <button key={h.tanggal} 
            className={`bsel ${h.tanggal === tanggal ? 'pilih' : ''} ${h.tanggal === hariIni ? 'ini' : ''}`}
            style={gayaBatas}
            onClick={() => pilih(h.tanggal)}>
            <span className="sudut">{(() => {
              const pen = /Penanggal\s*(\d+)/i.exec(h.tp || '');
              const pang = /Pang?e?long\s*(\d+)/i.exec(h.tp || '');
              const n = pen ? pen[1] : (pang ? pang[1] : null);
              const warnaSudut = pen ? '#C22F2F' : (pang ? '#3B6FB5' : 'transparent');
              const teksWarna = (pen && pen[1] === '15') || (pang && pang[1] === '15') ? '#fff' : 'inherit';
              const bgSudut = (pen && pen[1] === '15') ? '#C22F2F' : ((pang && pang[1] === '15') ? '#3B6FB5' : 'transparent');
              return n ? (
                <span className="no-sudut" style={{ 
                  color: teksWarna, 
                  background: bgSudut,
                  borderColor: warnaSudut, 
                  borderWidth: '1px', 
                  borderStyle: 'solid',
                  borderRadius: '50%',
                  width: '1.2rem',
                  height: '1.2rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '.68rem',
                  fontWeight: 700
                }}>{n}</span>
              ) : null;
            })()}</span>
            <span className="blnbaris"><span className="no">{h.hariKe}</span>
              <BulanFase tp={h.tp} ukuran={13} /></span>
            <span className="kt">{pendek(h.tp)}<br />{h.pancawara} · {h.wuku}{h.proyeksi ? ' · proyeksi' : ''}</span>
            <span style={{ display: 'flex', gap: '.15rem', flexWrap: 'wrap' }}><Fase h={h} kecil /></span>
            <span style={{ marginTop: 'auto' }}>
              <Strip n={h.nilai} meta={meta} ket={false} />
              <Simpul k={h.kesimpulan} kecil />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TampilPekan({ pekan, tanggal, hariIni, meta, pilih }) {
  if (!pekan.length) return <div className="muat">Memuat…</div>;
  const gaya = { gridTemplateColumns: `repeat(${pekan.length}, minmax(0,1fr))` };
  return (<>
    <div className="harigrid" style={gaya}>
      {pekan.map((h) => (
        <div key={h.tanggal} className={`harikepala ${h.tanggal === hariIni ? 'ini' : ''}`}>
          <div className="nm">{h.saptawara}</div>
          <div className="tg">{dariIso(h.tanggal).getDate()} {BULAN[dariIso(h.tanggal).getMonth()].slice(0, 3)}</div>
          <div className="bl blnbaris" style={{ justifyContent: 'center' }}>
            <BulanFase tp={h.tp} ukuran={14} />{pendek(h.tp)}
          </div>
          <div style={{ display: 'flex', gap: '.15rem', flexWrap: 'wrap', justifyContent: 'center', margin: '.15rem 0' }}>
            <Fase h={h} kecil />
          </div>
          <Strip n={h.nilai} meta={meta} />
          <Simpul k={h.kesimpulan} kecil />
        </div>
      ))}
    </div>
    <div className="harigrid" style={{ ...gaya, marginTop: '.5rem' }}>
      {pekan.map((h) => {
        let gayaBatas = {};
        if (h.nilai.ngabenAyu.taraf > 0 || h.nilai.pawiwahanAyu.taraf > 0) {
          const tarafAyu = Math.max(h.nilai.ngabenAyu.taraf, h.nilai.pawiwahanAyu.taraf);
          gayaBatas = { borderColor: WARNA_TARAF_AYU[tarafAyu], borderWidth: '2px' };
        }
        if (h.nilai.ngabenAla.taraf > 0 || h.nilai.pawiwahanAla.taraf > 0) {
          const tarafAla = Math.max(h.nilai.ngabenAla.taraf, h.nilai.pawiwahanAla.taraf);
          gayaBatas = { borderColor: WARNA_TARAF_ALA[tarafAla], borderWidth: '2px', ...gayaBatas, outline: `1px solid ${WARNA_TARAF_ALA[tarafAla]}` };
        }
        return (
          <div key={h.tanggal} onClick={() => pilih(h.tanggal)}
            style={gayaBatas}
            className={`harikolom ${h.tanggal === tanggal ? 'pilih' : ''} ${h.proyeksi ? 'proyeksi' : ''}`}>
            {h.dewasa.map((x) => (
              <div key={x.id} className={`blok s${x.sifat}`}>
                <div className="jd">{x.nama}</div>
                <div className="sb">{SIFAT[x.sifat]}</div>
              </div>
            ))}
            {h.dewasa.length === 0 && <div className="lagi">tanpa dewasa khusus</div>}
          </div>
        );
      })}
    </div>
  </>);
}

function TampilHari({ d, meta }) {
  let gayaBatas = {};
  if (d.nilai.ngabenAyu.taraf > 0 || d.nilai.pawiwahanAyu.taraf > 0) {
    const tarafAyu = Math.max(d.nilai.ngabenAyu.taraf, d.nilai.pawiwahanAyu.taraf);
    gayaBatas = { borderColor: WARNA_TARAF_AYU[tarafAyu], borderWidth: '2px' };
  }
  if (d.nilai.ngabenAla.taraf > 0 || d.nilai.pawiwahanAla.taraf > 0) {
    const tarafAla = Math.max(d.nilai.ngabenAla.taraf, d.nilai.pawiwahanAla.taraf);
    gayaBatas = { borderColor: WARNA_TARAF_ALA[tarafAla], borderWidth: '2px', ...gayaBatas, outline: `1px solid ${WARNA_TARAF_ALA[tarafAla]}` };
  }
  return (
    <div className="harigrid" style={{ gridTemplateColumns: '1fr' }}>
      <div className="harikepala ini">
        <div className="nm">{d.saptawara}, {fmt(d.tanggal)}</div>
        <div className="tg blnbaris" style={{ justifyContent: 'center' }}>
          <BulanFase tp={d.tp} ukuran={16} />{d.pancawara} · {d.wuku} · {d.tp} · Sasih {namaSasih(d.sasih)}
        </div>
        <div style={{ display: 'flex', gap: '.2rem', justifyContent: 'center', marginTop: '.2rem' }}><Fase h={d} /></div>
      </div>
      <div style={{ margin: '.5rem 0', maxWidth: '22rem' }}>
        <Strip n={d.nilai} meta={meta} />
        <Simpul k={d.kesimpulan} />
      </div>
      <div className={`harikolom ${d.proyeksi ? 'proyeksi' : ''}`} style={{ cursor: 'default', ...gayaBatas }}>
        {d.dewasa.length === 0 && <div className="lagi">tanpa dewasa khusus</div>}
        {d.dewasa.map((x) => (
          <div key={x.id} className={`blok s${x.sifat}`}>
            <div className="jd">{x.nama}</div>
            <div className="sb">{SIFAT[x.sifat]} · {x.keterangan || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailHari({ d, meta, muatUlang, bolehSunting, tutup }) {
  const [pesan, setPesan] = usePesan();
  const [sunting, setSunting] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [buka, setBuka] = useState(true);
  
  // State untuk form override dewasa kustom harian
  const [bukaFormOverride, setBukaFormOverride] = useState(false);
  const [daftarSemuaDewasa, setDaftarSemuaDewasa] = useState([]);
  const [overrideDewasaId, setOverrideDewasaId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('boleh');

  useEffect(() => {
    if (bolehSunting && bukaFormOverride) {
      api.dewasaList().then(setDaftarSemuaDewasa).catch(e => setPesan(['galat', e.message]));
    }
  }, [bolehSunting, bukaFormOverride]);

  const simpanOverride = async () => {
    if (!overrideDewasaId) return;
    try {
      await api.penandaSimpan({ tanggal: d.tanggal, dewasaId: +overrideDewasaId, status: overrideStatus });
      setPesan(['ok', 'Override dewasa berhasil diterapkan.']);
      setBukaFormOverride(false);
      muatUlang();
    } catch (e) {
      setPesan(['galat', e.message]);
    }
  };

  const WARA = [['ekaNama', 'Eka Wara'], ['dwiNama', 'Dwi Wara'], ['triNama', 'Tri Wara'],
    ['caturNama', 'Catur Wara'], ['sadNama', 'Sadwara'], ['astaNama', 'Astawara'],
    ['sangaNama', 'Sangawara'], ['ingsadNama', 'Ingkel / Sadina'], ['dasaNama', 'Dasawara'],
    ['saptawara', 'Saptawara'], ['pancawara', 'Pancawara'], ['wuku', 'Wuku'], ['pertithi', 'Pertithi']];

  const slot = (label, nilai, jenis, sisi) => {
    const warnaTaraf = sisi === 'ayu' ? WARNA_TARAF_AYU : WARNA_TARAF_ALA;
    return (
      <div className="kotak" style={{ display: 'block' }}>
        <div className="baris" style={{ marginBottom: '.25rem' }}>
          <b>{label}</b>
          {nilai.taraf > 0
            ? <span className="cip" style={{ background: warnaTaraf[nilai.taraf], color: (sisi === 'ala' ? nilai.taraf >= 4 : nilai.taraf >= 7) ? '#fff' : 'inherit', margin: 0 }}>{meta.taraf[nilai.taraf].nama}</span>
            : <span style={{ color: '#6B6577', fontSize: '.82rem' }}>tanpa penanda</span>}
          {nilai.dikoreksi && <span style={{ fontSize: '.72rem', color: '#7A5A08' }}>disunting peranda</span>}
          {bolehSunting && <button className="tombolputih" style={{ marginLeft: 'auto', padding: '.3rem .7rem', minHeight: '2.2rem' }}
            onClick={() => setSunting({ jenis, sisi, taraf: nilai.taraf, teks: nilai.teks })}>Ubah</button>}
        </div>
        <div style={{ fontSize: '.85rem', color: nilai.teks ? '#2B2833' : '#6B6577', fontStyle: nilai.teks ? 'normal' : 'italic' }}>
          {nilai.teks || 'Tidak ada catatan.'}
        </div>
      </div>
    );
  };

  const simpanCatatan = async () => {
    if (!catatan.trim()) return;
    try { await api.catatanTambah({ tanggal: d.tanggal, isi: catatan }); setCatatan(''); setPesan(['ok', 'Catatan tersimpan.']); muatUlang(); }
    catch (e) { setPesan(['galat', e.message]); }
  };

  return (
    <div className="detail">
      <div className="baris" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3>{d.saptawara}, {fmt(d.tanggal)}</h3>
          <div className="sub" style={{ marginBottom: '.5rem' }}>
            {d.pancawara} · {d.wuku} · <b>{d.tp}</b> · Sasih {namaSasih(d.sasih)}
          </div>
        </div>
        <div className="baris" style={{ flexWrap: 'nowrap' }}>
          <button className="tombolputih" onClick={() => setBuka(!buka)}>{buka ? 'Ringkas' : 'Selengkapnya'}</button>
          {tutup && <button className="kaltutup" onClick={tutup} aria-label="Tutup">✕</button>}
        </div>
      </div>

      {pesan && <div className={`putusan p-${pesan[0] === 'ok' ? 'sangat-baik' : 'pantang'}`}>{pesan[1]}</div>}
      {/* Putusan dipisah per keperluan: hari yang sama bisa berbeda hasilnya
          untuk Ngaben dan untuk Pawiwahan. */}
      <div style={{ fontWeight: 700, margin: '.2rem 0 .4rem' }}>Putusan menurut keperluan</div>
      <PutusanKeperluan k={d.keperluan} />
      <p style={{ fontSize: '.74rem', color: 'var(--tulis2)', margin: '.1rem 0 .7rem' }}>
        Angka menunjukkan <b>bobot terkuat</b> tiap pihak — 1 Nistaning Nista sampai 9 Utamaning Utama.
        Menurut kaidah <b>alah dening alah</b>, bobot lebih tinggi mengalahkan yang lebih rendah;
        banyaknya dewasa tidak menentukan.
      </p>
      <AlahDeningAlah a={d.keperluan.umum} />
      <div className={`putusan p-${d.putusan.kode}`} style={{ fontSize: '.86rem' }}>
        <span style={{ display: 'block', fontFamily: "'Lora',serif", fontWeight: 400,
          fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.08em', opacity: .8 }}>
          Menurut kolom Ngaben/Pawiwahan saja
        </span>
        {d.putusan.teks}
      </div>
      {d.kesimpulan && (
        <div className="kotak" style={{ display: 'block' }}>
          <b>Kesimpulan dewasa hari ini: </b>
          <span style={{ fontFamily: "'Eczar',serif", fontWeight: 700 }}>{d.kesimpulan.nama}</span>
          <div style={{ fontSize: '.78rem', color: '#55505F' }}>
            Timbangan {d.kesimpulan.ayu} Ayu berbanding {d.kesimpulan.ala} Ala, dari {d.dewasa.length} dewasa
            yang berlaku. Perhitungan turunan, bukan angka tertulis di Excel.
          </div>
        </div>
      )}

      {d.proyeksi && <div className="kotak" style={{ background: '#FCF2DA', color: '#7A5A08' }}>
        <span>⚠</span><span>Tanggal Bali hari ini <b>hasil proyeksi</b> — di luar rentang Excel yang diaudit.
        Penetapan sesungguhnya menunggu rapat peranda.</span></div>}
      {d.dikoreksi && <div className="kotak" style={{ background: '#DFF5E6', color: '#0E6B33' }}>
        <span>✓</span><span>Sudah dikoreksi rapat: {d.dikoreksi.alasan || '(tanpa alasan)'} {d.dikoreksi.oleh && `— ${d.dikoreksi.oleh}`}</span></div>}

      <div className="kotak">
        <BulanFase tp={d.tp} ukuran={22} />
        <span>
          <b>{d.tp}</b> · Sasih {namaSasih(d.sasih)}
          <div style={{ fontSize: '.8rem', color: '#55505F' }}>
            Menurut astronomi: <b>{d.tpAstronomis || '—'}</b> · Sasih {namaSasih(d.sasihAstronomis)}
          </div>
        </span>
        <span className="baris" style={{ marginLeft: 'auto' }}><Fase h={{
          ...d,
          purnamaAstro: d.purnamaAstro,
          tilemAstro: d.tilemAstro,
        }} /></span>
      </div>

      <div className="kotak" style={{ display: 'block', background: '#F4F6F9', borderColor: '#D0D7DE' }}>
        <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '.3rem' }}>
          🌿 Pranatha Mangsa &amp; Dawuh Harian
        </div>
        <div style={{ fontSize: '.84rem', color: '#2C3E50', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
          <div>
            <b>Pranatha Mangsa:</b> Mangsa {d.pranathaMangsa?.no} — <b>{d.pranathaMangsa?.nama}</b> ({d.pranathaMangsa?.swen})
          </div>
          <div>
            <b>Sarining Dawuh (Jam Emas):</b><br />
            ☀️ Siang: {d.sariningDawuh?.siang || '—'}<br />
            🌙 Malam: {d.sariningDawuh?.malam || '—'}
          </div>
          {d.ekaJalaReshi && (
            <div>
              <b>Eka Jala Reshi:</b> <span style={{ color: '#0D47A1', fontWeight: 600 }}>{d.ekaJalaReshi}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(15rem,1fr))', gap: '.5rem' }}>
        <div><div style={{ fontWeight: 700, marginBottom: '.3rem' }}>Ngaben (Pitra Yadnya)</div>
          {slot('Ayu', d.nilai.ngabenAyu, 'ngaben', 'ayu')}
          {slot('Ala', d.nilai.ngabenAla, 'ngaben', 'ala')}</div>
        <div><div style={{ fontWeight: 700, marginBottom: '.3rem' }}>Pawiwahan (Manusa Yadnya)</div>
          {slot('Ayu', d.nilai.pawiwahanAyu, 'pawiwahan', 'ayu')}
          {slot('Ala', d.nilai.pawiwahanAla, 'pawiwahan', 'ala')}</div>
      </div>

      <div style={{ fontWeight: 700, margin: '.8rem 0 .4rem' }}>Panca Yadnya</div>
      <div className="kotak" style={{ display: 'block' }}>
        <RinciKeperluan d={d} meta={meta} />
      </div>

      {buka && <>
        <div style={{ fontWeight: 700, margin: '.8rem 0 .4rem' }}>Wewaran &amp; Wuku</div>
        <div className="wgrid">
          {WARA.map(([k, n]) => d[k] ? <div key={k} className="wsel"><div className="k">{n}</div><div className="v">{d[k]}</div></div> : null)}
        </div>

        <div style={{ fontWeight: 700, margin: '.6rem 0 .4rem' }}>Ala-Ayuning Dewasa — {d.dewasa.length}</div>
        <div className="baris" style={{ marginBottom: '.4rem' }}>
          {[0, 2, 1, 3].map((sf) => {
            const n = d.dewasa.filter((x) => x.sifat === sf).length;
            return n ? <span key={sf} className={`cip s${sf}`}>{SIFAT[sf]} {n}</span> : null;
          })}
        </div>
        <div className="gulirdaftar">
          {d.dewasa.length === 0 && <div className="sub">Tidak ada dewasa khusus pada hari ini.</div>}
          {[0, 2, 1, 3].flatMap((sf) => d.dewasa.filter((x) => x.sifat === sf)).map((x) => {
            const statusOverride = x.dikoreksi ? (x.sifat === 0 ? 'boleh' : (x.sifat === 1 ? 'tidak' : (x.sifat === 3 ? 'netral' : 'tidak_berlaku'))) : 'bawaan';
            return (
              <div key={x.id} className={`dbaris s${x.sifat}`} style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.4rem' }}>
                  <div className="nm">
                    {x.nama}
                    {x.bobot > 0 && <span className={`bobotpil b${x.bobot}`} title={`Bobot ${x.bobot} — ${NAMA_BOBOT[x.bobot]}`}>{x.bobot}</span>}
                    <span style={{ fontWeight: 400, fontSize: '.74rem', color: 'var(--tulis3)', marginLeft: '.4rem' }}>
                      {x.sumber === 'excel' ? 'dari Excel' : 'dari aturan'}
                    </span>
                    {x.dikoreksi && <span className="tag s0" style={{ fontSize: '.64rem', padding: '.05rem .25rem', marginLeft: '.4rem' }}>diubah</span>}
                  </div>
                  {bolehSunting && (
                    <select 
                      value={statusOverride}
                      style={{ width: 'auto', fontSize: '.76rem', padding: '.2rem .4rem', minHeight: 'auto' }}
                      onChange={async (e) => {
                        try {
                          await api.penandaSimpan({ tanggal: d.tanggal, dewasaId: x.id, status: e.target.value });
                          muatUlang();
                        } catch (err) {
                          setPesan(['galat', err.message]);
                        }
                      }}
                    >
                      <option value="bawaan">Ikut Aturan Bawaan</option>
                      <option value="boleh">Ayu (Boleh)</option>
                      <option value="tidak">Ala (Tidak Boleh)</option>
                      <option value="netral">Netral</option>
                      <option value="tidak_berlaku">Tidak Berlaku / Kekeran</option>
                    </select>
                  )}
                </div>
                <div className="ds">{x.keterangan || '—'}</div>
              </div>
            );
          })}
        </div>

        {bolehSunting && (
          <div style={{ marginTop: '.6rem' }}>
            {!bukaFormOverride ? (
              <button className="tombolputih" style={{ fontSize: '.8rem', padding: '.4rem .8rem', minHeight: 'auto' }} onClick={() => setBukaFormOverride(true)}>
                + Ubah/Override Dewasa Lain Hari Ini
              </button>
            ) : (
              <div className="kotak" style={{ display: 'block', padding: '.7rem', background: 'var(--kartu3)' }}>
                <div style={{ fontWeight: 600, fontSize: '.82rem', marginBottom: '.4rem' }}>Tandai Keberlakuan Dewasa Hari Ini</div>
                <div className="grid2" style={{ gap: '.5rem', marginBottom: '.6rem' }}>
                  <div>
                    <label className="fl" style={{ fontSize: '.68rem' }}>Pilih Dewasa</label>
                    <select value={overrideDewasaId} onChange={(e) => setOverrideDewasaId(e.target.value)} style={{ padding: '.4rem', fontSize: '.82rem' }}>
                      <option value="">-- Pilih Dewasa --</option>
                      {daftarSemuaDewasa.map((dw) => (
                        <option key={dw.id} value={dw.id}>{dw.nama} ({dw.asal})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="fl" style={{ fontSize: '.68rem' }}>Status Sifat</label>
                    <select value={overrideStatus} onChange={(e) => setOverrideStatus(e.target.value)} style={{ padding: '.4rem', fontSize: '.82rem' }}>
                      <option value="boleh">Ayu (Boleh)</option>
                      <option value="tidak">Ala (Tidak Boleh)</option>
                      <option value="netral">Netral</option>
                      <option value="tidak_berlaku">Tidak Berlaku / Kekeran</option>
                    </select>
                  </div>
                </div>
                <div className="baris" style={{ gap: '.4rem' }}>
                  <button className="btn aksi" style={{ minHeight: 'auto', padding: '.4rem .8rem', fontSize: '.8rem' }} onClick={simpanOverride}>Terapkan</button>
                  <button className="btn" style={{ minHeight: 'auto', padding: '.4rem .8rem', fontSize: '.8rem' }} onClick={() => setBukaFormOverride(false)}>Batal</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ fontWeight: 700, margin: '.8rem 0 .4rem' }}>Catatan</div>
        {d.catatan.map((c) => (
          <div key={c.id} className="kotak" style={{ justifyContent: 'space-between' }}>
            <span><b>{c.isi}</b><br /><span style={{ fontSize: '.75rem', color: '#6B6577' }}>{c.oleh || 'tanpa nama'} · {c.dibuat}</span></span>
            {bolehSunting && <button className="tombolputih" onClick={async () => { await api.catatanHapus(c.id); muatUlang(); }}>Hapus</button>}
          </div>
        ))}
        {bolehSunting && <>
          <input type="text" placeholder="Tambah catatan untuk tanggal ini…" value={catatan}
            onChange={(e) => setCatatan(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && simpanCatatan()}
            style={{ marginBottom: '.5rem' }} />
          <button className="tombolhitam" onClick={simpanCatatan}>Simpan Catatan</button>
        </>}
      </>}

      {sunting && <DialogPenilaian tanggal={d.tanggal} awal={sunting} meta={meta}
        tutup={() => setSunting(null)} selesai={() => { setSunting(null); setPesan(['ok', 'Penilaian tersimpan.']); muatUlang(); }} />}
    </div>
  );
}


/* ---------------- Papan Tika (30 wuku x 7 saptawara) ---------------- */
// Lambang dipilih agar bentuknya jelas berbeda satu sama lain, bukan sekadar
// beda warna — supaya tetap terbaca oleh mata lanjut usia dan penglihatan
// yang sukar membedakan warna.
const LAMBANG = ['☂', '☉', '✦', '◈', '✚', '◉', '▲', '⬢', '❋', '⌂', '✖', '♆', '☾', '⚑'];
const KELAS_SIFAT = ['simayu', 'simala', 'simdua', 'simnet'];

/**
 * Dewa pelindung tiap Wuku menurut tradisi Wariga Bali.
 * Ikon menggunakan SVG inline bergaya rerajahan — simbol sakral
 * yang khas untuk masing-masing dewa. Warna diselaraskan dengan
 * arah mata angin sesuai Dewata Nawa Sanga.
 */
const DEWA_WUKU = {
  Sinta:        { dewa: 'Batara Yamadipati',     arah: 'selatan',    warna: '#B71C1C',  ikon: 'M12 2L8 8h3v4H8l4 6 4-6h-3V8h3z' },
  Landep:       { dewa: 'Batara Maheswara',       arah: 'tenggara',   warna: '#E65100',  ikon: 'M12 3l-7 7h4v4h-4l7 7 7-7h-4v-4h4z' },
  Ukir:         { dewa: 'Batara Saraswati',       arah: 'barat daya', warna: '#880E4F',  ikon: 'M12 2a4 4 0 00-4 4v4a4 4 0 108 0V6a4 4 0 00-4-4zm0 16a2 2 0 100-4 2 2 0 000 4z' },
  Kulantir:     { dewa: 'Batara Sadashiwa',        arah: 'pusat',      warna: '#4A148C',  ikon: 'M12 2l3 4-1 5 4 2-4 3-2 4-2-4-4-3 4-2-1-5z' },
  Tolu:         { dewa: 'Batara Brahma',           arah: 'selatan',    warna: '#B71C1C',  ikon: 'M12 4a3 3 0 110 6 3 3 0 010-6zm-4 8l4 8 4-8z' },
  Gumbreg:      { dewa: 'Batara Kamajaya',         arah: 'timur',      warna: '#1B5E20',  ikon: 'M12 3c-3 0-5 4-5 7s2 7 5 7 5-4 5-7-2-7-5-7zm0 4a2 2 0 110 4 2 2 0 010-4z' },
  Wariga:       { dewa: 'Batara Candra',           arah: 'barat',      warna: '#F9A825',  ikon: 'M12 2a7 7 0 110 14c-2.5 0-4.7-1.3-6-3.3A7 7 0 0012 2z' },
  Warigadean:   { dewa: 'Dewi Sri',                arah: 'timur laut', warna: '#2E7D32',  ikon: 'M12 2v6l4 3-2 5h-4l-2-5 4-3V2zm-2 14h4v4h-4z' },
  Julungwangi:  { dewa: 'Batara Wisnu',            arah: 'utara',      warna: '#0D47A1',  ikon: 'M12 2l-5 5v6l5 5 5-5V7zm0 4a2 2 0 110 4 2 2 0 010-4z' },
  Sungsang:     { dewa: 'Batara Sambu',            arah: 'timur laut', warna: '#00695C',  ikon: 'M12 3L6 9l2 2 4-3 4 3 2-2zm-4 8l4 6 4-6z' },
  Dungulan:     { dewa: 'Batara Iswara',           arah: 'timur',      warna: '#1B5E20',  ikon: 'M12 2l4 5-1 5 3 4-6 2-6-2 3-4-1-5zm0 9a2 2 0 100-4 2 2 0 000 4z' },
  Kuningan:     { dewa: 'Batara Ciwa',             arah: 'pusat',      warna: '#4A148C',  ikon: 'M12 2a8 8 0 100 16 8 8 0 000-16zm0 4a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 010-4z' },
  Langkir:      { dewa: 'Batara Durga',            arah: 'barat laut', warna: '#263238',  ikon: 'M7 4l5 3 5-3v5l-3 4 3 4v3H7v-3l3-4-3-4z' },
  Medangsia:    { dewa: 'Batara Bhairawa',          arah: 'barat daya', warna: '#880E4F',  ikon: 'M8 3l4 4 4-4v4l-2 3 2 3v4l-4-2-4 2v-4l2-3-2-3z' },
  Pujut:        { dewa: 'Batara Surya',            arah: 'timur',      warna: '#E65100',  ikon: 'M12 5a5 5 0 100 10 5 5 0 000-10zm0-3v2m0 14v2m7-9h2M3 12H1m15.07-5.07l1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m12.73 12.73l1.41 1.41' },
  Pahang:       { dewa: 'Batara Parwata',           arah: 'utara',      warna: '#0D47A1',  ikon: 'M4 18l4-7 4 4 4-11 4 14z' },
  Krulut:       { dewa: 'Batara Gana',             arah: 'barat',      warna: '#F9A825',  ikon: 'M12 3c-2 0-4 1.5-4 4a4 4 0 003 3.8V15l-2 2h6l-2-2v-4.2A4 4 0 0016 7c0-2.5-2-4-4-4zm0 14a2 2 0 100 4 2 2 0 000-4z' },
  Merakih:      { dewa: 'Batara Kuwera',           arah: 'utara',      warna: '#1565C0',  ikon: 'M6 4h12v3H6zm2 5h8v3H8zm-2 5h12v3H6zm3 5h6v2H9z' },
  Tambir:       { dewa: 'Batara Bayu',             arah: 'barat laut', warna: '#263238',  ikon: 'M4 12c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6zm8-3a3 3 0 100 6 3 3 0 000-6z' },
  Medangkungan: { dewa: 'Batara Kala',             arah: 'barat daya', warna: '#880E4F',  ikon: 'M12 2l-2 4-4 1 3 3-1 5 4-2 4 2-1-5 3-3-4-1z' },
  Matal:        { dewa: 'Batara Uma',              arah: 'selatan',    warna: '#B71C1C',  ikon: 'M12 2a3 3 0 00-3 3c0 1.3.8 2.4 2 2.8V12H8v2h3v4h2v-4h3v-2h-3V7.8c1.2-.4 2-1.5 2-2.8a3 3 0 00-3-3z' },
  Uye:          { dewa: 'Batara Indra',            arah: 'timur',      warna: '#1B5E20',  ikon: 'M12 3l-6 5h3v4H6l6 6 6-6h-3V8h3z' },
  Menail:       { dewa: 'Batara Guru',             arah: 'pusat',      warna: '#4A148C',  ikon: 'M12 2L6 8h3v3L6 14h3v4h6v-4h3l-3-3V8h3zm0 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3z' },
  Prangbakat:   { dewa: 'Batara Yama',             arah: 'selatan',    warna: '#B71C1C',  ikon: 'M8 3v7H6l6 8 6-8h-2V3zm2 2h4v5h-4z' },
  Bala:         { dewa: 'Batara Rudra',            arah: 'barat daya', warna: '#880E4F',  ikon: 'M12 2l2 4h4l-3 4 1 5-4-2-4 2 1-5-3-4h4z' },
  Ugu:          { dewa: 'Batara Ludra',            arah: 'barat',      warna: '#F9A825',  ikon: 'M12 3c-4 0-7 3-7 7h3a4 4 0 118 0h3c0-4-3-7-7-7zm0 10a2 2 0 100 4 2 2 0 000-4z' },
  Wayang:       { dewa: 'Batara Ciwa',             arah: 'pusat',      warna: '#4A148C',  ikon: 'M5 4h14l-2 6 2 6H5l2-6zm7 2a3 3 0 100 6 3 3 0 000-6z' },
  Kelawu:       { dewa: 'Batara Wiswakarma',       arah: 'tenggara',   warna: '#E65100',  ikon: 'M12 2L8 6v4L4 14h6v4h4v-4h6l-4-4V6zm0 5a2 2 0 110 4 2 2 0 010-4z' },
  Dukut:        { dewa: 'Batara Putra Jaya',       arah: 'timur laut', warna: '#00695C',  ikon: 'M12 3l-4 4h2v4H7l5 6 5-6h-3V7h2zm-3 13h6v2H9z' },
  Watugunung:   { dewa: 'Batara Antaboga',         arah: 'barat',      warna: '#F9A825',  ikon: 'M6 6c0-2 2.7-4 6-4s6 2 6 4c0 3-3 5-3 8H9c0-3-3-5-3-8zm4 12h4v2h-4z' },
};

/** Ikon dewa wuku, render SVG inline bergaya rerajahan. */
function IkonDewa({ wuku, ukuran = 24 }) {
  const d = DEWA_WUKU[wuku];
  if (!d) return null;
  return (
    <svg className="ikondewa" width={ukuran} height={ukuran} viewBox="0 0 24 24"
      role="img" aria-label={d.dewa}>
      <title>{d.dewa} — Dewa pelindung Wuku {wuku}</title>
      <circle cx="12" cy="12" r="11" fill="none" stroke={d.warna} strokeWidth="1" opacity=".3" />
      <path d={d.ikon} fill={d.warna} fillRule="evenodd" />
    </svg>
  );
}

function PapanTika() {
  const [data, setData] = useState(null);
  const [sel, setSel] = useState(null);
  const [galat, setGalat] = useState(null);
  const [maksud, setMaksud] = useState('umum');
  const [sibukHibrida, setSibukHibrida] = useState(false);

  // Hibrida: filter Tahun + Sasih
  const thnIni = new Date().getFullYear();
  const [hibridaTahun, setHibridaTahun] = useState(thnIni);
  const [hibridaSasih, setHibridaSasih] = useState(0); // 0 = tidak aktif
  const [hibridaData, setHibridaData] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSel(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { api.tika().then(setData).catch((e) => setGalat(e.message)); }, []);

  // Muat data hibrida ketika Sasih dipilih
  useEffect(() => {
    if (!hibridaSasih) { setHibridaData(null); return; }
    setSibukHibrida(true);
    api.tikaHibrida(hibridaTahun, hibridaSasih)
      .then((d) => setHibridaData(d.hibrida))
      .catch(() => setHibridaData(null))
      .finally(() => setSibukHibrida(false));
  }, [hibridaTahun, hibridaSasih]);

  if (galat) return <div className="pesan galat">{galat}</div>;
  if (!data) return <div className="muat">Menyusun papan tika…</div>;

  const semuaSel = data.baris.flatMap((b) => b.hari);
  const tingkatSel = (h) => h.tingkat[maksud] || 0;
  const jumlahTingkat = semuaSel.reduce((a, h) => { const t = tingkatSel(h); a[t] = (a[t] || 0) + 1; return a; }, {});
  const yTerpilih = data.yadnya.find((y) => y.kunci === maksud);
  const kosongYadnya = yTerpilih && semuaSel.every((h) => h.tingkat[maksud] === 0) ? yTerpilih : null;

  const overlay = hibridaData?.overlay || {};
  const adaOverlay = hibridaSasih > 0 && hibridaData;

  const simbol = (i) => {
    const l = data.lambang[i];
    return <span key={i} className={KELAS_SIFAT[l.sifat]} title={`${l.nama} — ${SIFAT[l.sifat]}`}>{LAMBANG[i]}</span>;
  };

  const tahunPilihan = [];
  for (let y = thnIni - 5; y <= thnIni + 25; y++) tahunPilihan.push(y);

  return (
    <>
      <h2>Papan Tika</h2>
      <p className="sub">
        Bentuk tika cetak: 30 baris Wuku × 7 kolom Saptawara = 210 hari, satu putaran penuh Pawukon.
        Isinya berulang selamanya, jadi papan ini berlaku untuk tahun mana pun.
      </p>

      {/* Selector Hibrida: Tahun + Sasih */}
      <div className="kartu" style={{ marginBottom: '.8rem', background: '#F8F4EA', border: '2px solid #8A6A2A' }}>
        <h3 style={{ margin: '0 0 .4rem', color: '#2A2008' }}>🌙 Pemilihan Sasih &amp; Tahun (Papan Tika Hibrida)</h3>
        <p className="sub" style={{ margin: '0 0 .6rem' }}>
          Pilih tahun dan sasih untuk menampilkan posisi hari serta dewasa bulan (Purnama, Tilem, Penanggal, Panglong) pada grid Pawukon.
        </p>
        <div className="baris" style={{ gap: '.8rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="fl" style={{ fontWeight: 700 }}>Tahun Masehi</label>
            <select value={hibridaTahun} onChange={(e) => setHibridaTahun(+e.target.value)}
              style={{ minWidth: '7rem', padding: '.4rem', fontSize: '.9rem' }}>
              {tahunPilihan.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="fl" style={{ fontWeight: 700 }}>Pilih Sasih</label>
            <select value={hibridaSasih} onChange={(e) => setHibridaSasih(+e.target.value)}
              style={{ minWidth: '11rem', padding: '.4rem', fontSize: '.9rem' }}>
              <option value={0}>— Tampilkan Seluruh Sasih (Statis) —</option>
              {SASIH.slice(1).map((s, i) => <option key={i + 1} value={i + 1}>Sasih {i + 1} — {s}</option>)}
            </select>
          </div>
          {hibridaSasih > 0 && (
            <button className="btn" style={{ padding: '.4rem .8rem' }} onClick={() => setHibridaSasih(0)}>
              Reset Filter Sasih
            </button>
          )}
        </div>
        {sibukHibrida && <div className="muat" style={{ marginTop: '.4rem' }}>Memuat data Sasih…</div>}
        {adaOverlay && (
          <div style={{ fontSize: '.84rem', color: '#1565C0', marginTop: '.6rem', fontWeight: 600 }}>
            ✓ Sasih <b>{SASIH[hibridaSasih]}</b> tahun <b>{hibridaTahun}</b> aktif — <b>{Object.keys(overlay).length}</b> kotak Pawukon yang jatuh pada sasih ini ditandai 🌙.
          </div>
        )}
      </div>
      <div className="pesan info">
        Hanya dewasa yang bergantung Wewaran &amp; Wuku yang dapat dipakukan di sini
        (<b>{data.ringkas.pawukonSaja}</b> dewasa, {data.ringkas.totalTanda.toLocaleString('id')} tanda).
        <b> {data.ringkas.bergantungBulan}</b> dewasa lain bergantung Penanggal/Panglong/Sasih sehingga
        letaknya bergeser tiap siklus — semuanya tetap tampak pada tab <b>Kalender</b>.
      </div>

      <h3 style={{ marginTop: '.2rem' }}>Untuk keperluan apa?</h3>
      <div className="pilihyadnya">
        <button className={`ybtn ${maksud === 'umum' ? 'on' : ''}`} onClick={() => setMaksud('umum')}>
          Umum<small>seluruh dewasa</small></button>
        {data.yadnya.map((y) => {
          const ada = data.baris.flatMap((b) => b.hari).filter((h) => h.tingkat[y.kunci] > 0).length;
          return (
            <button key={y.kunci} className={`ybtn ${maksud === y.kunci ? 'on' : ''}`} disabled={ada === 0}
              onClick={() => setMaksud(y.kunci)} title={y.jelas}>
              {y.nama}<small>{ada === 0 ? 'tidak ada di papan' : `${ada} kotak dinilai`}</small>
            </button>
          );
        })}
      </div>

      {kosongYadnya && (
        <div className="pesan info">
          <b>{kosongYadnya.nama}</b> tidak dapat dinilai pada papan ini. Seluruh dewasanya di berkas Excel
          bergantung <b>Purnama, Tilem, atau Penanggal</b>, sehingga letaknya bergeser tiap siklus dan tidak
          dapat dipakukan pada kotak Pawukon. Penilaiannya tetap tampak per tanggal di tab <b>Kalender</b>.
        </div>
      )}

      <div className="tingkatbar">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`tt n${n}`}>{data.tingkatan[n].nama}
            <span className="ang">{jumlahTingkat[n] || 0} kotak</span></span>
        ))}
      </div>

      <div className="tikagrid">
        <div className="tikaluar">
          <div className="tikapapan">
            <div className="tikahias" />
            <div className="tikajudul">DINA</div>
            <div className="tikagulir">
              <table className="tikatabel">
                <thead>
                  <tr>
                    <th className="no">No</th>
                    <th className="wk">Wuku</th>
                    {data.saptawara.map((n) => <th key={n}>{n}</th>)}
                    <th className="ik">Ingkel</th>
                  </tr>
                </thead>
                <tbody>
                  {data.baris.map((b) => (
                    <tr key={b.nomor}>
                      <td className="no">{b.nomor}</td>
                      <td className="wk">
                        <div className="wk-isi">
                          <IkonDewa wuku={b.wuku} ukuran={22} />
                          <div>
                            <div className="wk-nama">{b.wuku}</div>
                            <div className="wk-dewa">{DEWA_WUKU[b.wuku]?.dewa}</div>
                          </div>
                        </div>
                      </td>
                      {b.hari.map((h) => {
                        const ov = overlay[h.pawukon];
                        const aktif = adaOverlay && ov;
                        const redup = adaOverlay && !ov;
                        return (
                          <td key={h.pawukon}
                            className={`tikasel n${tingkatSel(h)} ${sel?.pawukon === h.pawukon ? 'pilih' : ''} ${aktif ? 'hibrida-aktif' : ''} ${redup ? 'hibrida-redup' : ''}`}
                            onClick={() => setSel({ ...h, wuku: b.wuku, ingkel: b.ingkel, overlay: ov || null })}
                            title={`${b.wuku} · ${data.saptawara[h.pawukon % 7]} — ${
                              tingkatSel(h) ? data.tingkatan[tingkatSel(h)].nama : 'tanpa penilaian'} · ${h.dewasa.length} dewasa${
                              aktif ? ` · 🌙 ${ov.length} tanggal Sasih ${SASIH[hibridaSasih]}` : ''}`}>
                            <span className="tk">{tingkatSel(h) ? data.tingkatan[tingkatSel(h)].ringkas : '–'}</span>
                            <div className="lam">{h.lambang.map(simbol)}</div>
                            {h.dewasa.length > h.lambang.length &&
                              <div className="sisa">+{h.dewasa.length - h.lambang.length}</div>}
                            {aktif && <div className="hibrida-tanda" title={`Sasih ${SASIH[hibridaSasih]}: ${ov.map(o => o.tanggal).join(', ')}`}>🌙</div>}
                          </td>
                        );
                      })}
                      <td className="ik">{b.ingkel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
          <div className="tikalegenda">
            <h4>Lambang &amp; Keterangan</h4>
            {data.lambang.map((l, i) => (
              <div className="lgbaris" key={l.id}>
                <div className={`sim ${KELAS_SIFAT[l.sifat]}`}>{LAMBANG[i]}</div>
                <div>
                  <div className="nm">{l.nama}</div>
                  <div className="kt">{SIFAT[l.sifat]} · {l.jumlah}× dalam 210 hari</div>
                </div>
              </div>
            ))}
          </div>

          <div className="kartu">
            <h3>Cara membaca</h3>
            <p className="sub" style={{ margin: 0 }}>
              Tekan kotak mana pun pada papan — keterangan lengkapnya akan muncul sebagai jendela.
              Warna kotak mengikuti kesimpulan untuk keperluan yang sedang dipilih di atas.
            </p>
          </div>

          <div className="tikalegenda" style={{ maxHeight: '22rem', overflow: 'auto' }}>
            <h4>Dewa Pelindung Wuku</h4>
            {Object.entries(DEWA_WUKU).map(([wuku, d]) => (
              <div className="lgbaris" key={wuku}>
                <IkonDewa wuku={wuku} ukuran={20} />
                <div>
                  <div className="nm">{wuku}</div>
                  <div className="kt">{d.dewa} · {d.arah}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="sub" style={{ marginTop: '.8rem', fontSize: '.78rem' }}>
        Kesimpulan lima tingkat ini <b>turunan</b> — hasil penimbangan Ayu terhadap Ala dari dewasa yang
        berlaku di kotak tersebut, bukan angka yang tertulis di berkas Excel. Dewasa bersifat “Ayu &amp; Ala”
        dihitung setengah ke masing-masing sisi. Baris <i>Kecenderungan menurut Excel</i> berbeda sifatnya:
        itu kekerapan nyata kolom Ngaben/Pawiwahan sepanjang data yang telah diaudit.
      </p>

      {sel && (
        <div className="tkpop" role="dialog" aria-modal="true" aria-label="Keterangan kotak tika"
          onClick={(e) => { if (e.target === e.currentTarget) setSel(null); }}>
          <div className="tkkartu">
            <div className="tkkepala">
              <div>
                <h3><IkonDewa wuku={sel.wuku} ukuran={28} /> {sel.wuku} · {data.saptawara[sel.pawukon % 7]}</h3>
                <div className="sub2">
                  {DEWA_WUKU[sel.wuku]?.dewa && <span style={{ color: '#4A148C', fontWeight: 600 }}>{DEWA_WUKU[sel.wuku].dewa}</span>}
                  {' · '}Hari ke-{sel.pawukon + 1} dari 210 · Ingkel {sel.ingkel} · {sel.dewasa.length} dewasa berlaku
                </div>
              </div>
              <button className="tktutup" onClick={() => setSel(null)} aria-label="Tutup">✕</button>
            </div>

            <div className="tkisi">
              <div className={`tkvonis v${tingkatSel(sel)}`}>
                {tingkatSel(sel) ? data.tingkatan[tingkatSel(sel)].nama : 'Tanpa penilaian'}
                <small>
                  {maksud === 'umum' ? 'Penilaian umum' : `Untuk ${yTerpilih?.nama}`}
                  {' — timbangan '}{sel.hitung.umum.ayu} Ayu berbanding {sel.hitung.umum.ala} Ala
                </small>
              </div>

              <div className="tkjudulkecil">Alah Dening Alah</div>
              <AlahDeningAlah a={sel.alahDeningAlah} />

              <div className="tkjudulkecil">Panca Yadnya</div>
              <table className="tktabel">
                <tbody>
                  {data.yadnya.map((y) => (
                    <tr key={y.kunci}>
                      <td>{y.nama}<div style={{ fontSize: '.72rem', color: '#6B5A33' }}>{y.jelas}</div></td>
                      <td className="nilai" style={{ color: sel.tingkat[y.kunci] ? '#2A2008' : '#8A7A55' }}>
                        {sel.tingkat[y.kunci] ? data.tingkatan[sel.tingkat[y.kunci]].nama : 'tidak disinggung'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="tkjudulkecil">Kecenderungan menurut Excel</div>
              <table className="tktabel">
                <thead><tr><th>Keperluan</th><th>Ayu</th><th>Ala</th><th>Dari</th></tr></thead>
                <tbody>
                  <tr><td>Ngaben</td><td className="nilai">{sel.excel.ngaben.ayu}×</td>
                    <td className="nilai">{sel.excel.ngaben.ala}×</td>
                    <td className="nilai">{sel.excel.ngaben.n} kali</td></tr>
                  <tr><td>Pawiwahan</td><td className="nilai">{sel.excel.pawiwahan.ayu}×</td>
                    <td className="nilai">{sel.excel.pawiwahan.ala}×</td>
                    <td className="nilai">{sel.excel.pawiwahan.n} kali</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: '.74rem', color: '#6B5A33', marginBottom: '.5rem' }}>
                Kolom Ngaben/Pawiwahan pada Excel ikut penanggalan bulan, sehingga untuk satu kotak tika
                nilainya tidak tetap. Angka di atas adalah kekerapan nyata sepanjang data yang telah diaudit.
              </p>

              <div className="tkjudulkecil">Dewasa yang berlaku — {sel.dewasa.length}</div>
              <div className="tkdewasa">
                {sel.dewasa.length === 0 && <p className="sub">Tanpa dewasa khusus pada kotak ini.</p>}
                {[0, 2, 1, 3].flatMap((sf) => sel.dewasa.filter((x) => x.sifat === sf)).map((x) => {
                  const li = data.lambang.findIndex((l) => l.id === x.id);
                  const yad = Object.entries(x.yadnya || {});
                  return (
                    <div key={x.id} className={`tkbaris s${x.sifat}`}>
                      <div className={`lb ${KELAS_SIFAT[x.sifat]}`}>{li >= 0 ? LAMBANG[li] : '·'}</div>
                      <div>
                        <div className="nm">{x.nama}
                          {x.bobot > 0 && <span className={`bobotpil b${x.bobot}`}>{x.bobot}</span>}</div>
                        <div className="kt">{SIFAT[x.sifat]}
                          {yad.length > 0 && ' · ' + yad.map(([k, n]) =>
                            `${data.yadnya.find((y) => y.kunci === k)?.nama || k}: ${n === 'ala' ? 'Ala' : 'Ayu'}`).join(', ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DialogPenilaian({ tanggal, awal, meta, tutup, selesai }) {
  const [taraf, setTaraf] = useState(awal.taraf);
  const [teks, setTeks] = useState(awal.teks || '');
  const [galat, setGalat] = useState(null);
  const simpan = async () => {
    try { await api.penilaianSimpan({ tanggal, jenis: awal.jenis, sisi: awal.sisi, taraf, teks }); selesai(); }
    catch (e) { setGalat(e.message); }
  };
  return (
    <div className="tutup" onClick={(e) => e.target === e.currentTarget && tutup()}>
      <div className="dialog">
        <h2>Ubah penilaian {awal.jenis} — {awal.sisi.toUpperCase()}</h2>
        <p className="sub">{fmt(tanggal)}</p>
        {galat && <div className="pesan galat">{galat}</div>}
        <label className="fl">Taraf</label>
        <div className="baris" style={{ marginBottom: '.9rem', flexWrap: 'wrap', gap: '.4rem' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
            <button key={t} className={`btn ${taraf === t ? 'on' : ''}`} onClick={() => setTaraf(t)}>
              {t === 0 ? 'Kosong' : meta.taraf[t]?.nama || 'Taraf ' + t}
            </button>
          ))}
        </div>
        <label className="fl">Keterangan</label>
        <textarea value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="Keterangan hari…" />
        <div className="baris" style={{ marginTop: '1rem' }}>
          <button className="btn aksi" onClick={simpan}>Simpan</button>
          <button className="btn" onClick={tutup}>Batal</button>
          <button className="btn bahaya" style={{ marginLeft: 'auto' }}
            onClick={async () => { try { await api.penilaianHapus(tanggal, awal.jenis, awal.sisi); selesai(); } catch (e) { setGalat(e.message); } }}>
            Kembalikan ke Asal
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Cari Dewasa ---------------- */
function CariDewasa({ buka }) {
  const [cari, setCari] = useState('');
  const [sifat, setSifat] = useState('semua');
  const [data, setData] = useState([]);
  useEffect(() => { const t = setTimeout(() => api.dewasaList(cari).then(setData), 220); return () => clearTimeout(t); }, [cari]);
  const tampil = data.filter((d) => sifat === 'semua' || d.sifat === +sifat);
  return (
    <div className="panel">
      <h2>Cari Ala-Ayuning Dewasa</h2>
      <p className="sub">Ketik nama dewasa atau kata dari keterangannya — misalnya <b>pawiwahan</b>, <b>ngaben</b>, <b>nandur</b>, atau <b>Kala</b>.</p>
      <div className="filters">
        <div><label className="fl">Kata kunci</label>
          <input type="text" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="ketik di sini…" /></div>
        <div><label className="fl">Tampilkan</label>
          <div className="baris">
            <button className={`btn ${sifat === 'semua' ? 'on' : ''}`} onClick={() => setSifat('semua')}>Semua</button>
            {SIFAT.map((s, i) => <button key={i} className={`btn ${sifat === String(i) ? 'on' : ''}`} onClick={() => setSifat(String(i))}>{s}</button>)}
          </div></div>
      </div>
      <div className="hitung">{tampil.length} dewasa ditemukan</div>
      {tampil.map((d) => (
        <div key={d.id} className={`kartu s${d.sifat}`}>
          <div className="nm">{d.nama}<span className={`tag s${d.sifat}`}>{SIFAT[d.sifat]}</span>
            {d.asal === 'tambahan' && <span className="tag sumber">tambahan</span>}
            {!d.aktif && <span className="tag s1">nonaktif</span>}</div>
          {d.keterangan && <div className="desc">{d.keterangan}</div>}
          <div className="meta"><b>Berlaku pada:</b> {d.kondisi || '(belum ada aturan)'}</div>
          {d.kataTakDikenali.length > 0 && (
            <div className="meta" style={{ color: 'var(--alafg)' }}>
              Kata belum dikenali mesin: {d.kataTakDikenali.join(', ')} — dewasa ini belum bisa dihitung untuk tahun di luar data Excel.
            </div>)}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Hari Baik ---------------- */
function HariBaik({ meta, buka }) {
  const [f, setF] = useState({ dari: iso(new Date()), jenis: 'pawiwahan', taraf: 3, tanpaAla: true });
  const [hasil, setHasil] = useState([]);
  const [sibuk, setSibuk] = useState(false);
  useEffect(() => { setSibuk(true); api.hariBaik(f).then(setHasil).finally(() => setSibuk(false)); }, [f]);
  return (
    <div className="panel">
      <h2>Mencari Hari Baik</h2>
      <p className="sub">Menerapkan <i>Rule of Decision</i> penyusun: membandingkan taraf Ayu terhadap Ala pada hari yang sama. Pencarian tidak dibatasi tahun.</p>
      <div className="filters">
        <div><label className="fl">Untuk keperluan</label><div className="baris">
          {[['pawiwahan', 'Pawiwahan'], ['ngaben', 'Ngaben']].map(([v, l]) =>
            <button key={v} className={`btn ${f.jenis === v ? 'on' : ''}`} onClick={() => setF({ ...f, jenis: v })}>{l}</button>)}
        </div></div>
        <div><label className="fl">Taraf Ayu paling rendah</label>
          <select value={f.taraf} onChange={(e) => setF({ ...f, taraf: +e.target.value })}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => <option key={t} value={t}>{meta.taraf[t]?.nama || 'Taraf ' + t} — taraf {t}</option>)}
          </select></div>
        <div><label className="fl">Syarat</label><div className="baris">
          <button className={`btn ${f.tanpaAla ? 'on' : ''}`} onClick={() => setF({ ...f, tanpaAla: true })}>Tanpa Ala</button>
          <button className={`btn ${!f.tanpaAla ? 'on' : ''}`} onClick={() => setF({ ...f, tanpaAla: false })}>Ayu lebih kuat</button>
        </div></div>
        <div><label className="fl">Mulai dari tanggal</label>
          <input type="date" value={f.dari} onChange={(e) => e.target.value && setF({ ...f, dari: e.target.value })} /></div>
      </div>
      {sibuk ? <div className="muat">Mencari…</div> : (
        <>
          <div className="hitung">{hasil.length >= 150 ? '150 hari pertama' : `${hasil.length} hari`} memenuhi syarat</div>
          {hasil.map((h) => (
            <div key={h.tanggal} className="kartu s0" style={{ borderLeftColor: WARNA_TARAF_AYU[h.taraf], cursor: 'pointer' }} onClick={() => buka(h.tanggal)}>
              <div className="nm">{fmtP(h.tanggal)}
                <span className="pil" style={{ background: WARNA_TARAF_AYU[h.taraf], color: h.taraf >= 7 ? '#fff' : '#2B2B2B' }}>Ayu {h.tarafNama}</span>
                {h.tarafAla > 0 && <span className="pil" style={{ background: WARNA_TARAF_ALA[h.tarafAla], color: h.tarafAla >= 4 ? '#fff' : '#2B2B2B' }}>Ala {h.tarafAlaNama}</span>}
                {h.proyeksi && <span className="tag sumber">proyeksi</span>}</div>
              <div className="desc">{h.teks || '—'}</div>
              <div className="meta">{h.saptawara} · {h.pancawara} · {h.wuku} · {h.tp} · Sasih {namaSasih(h.sasih)}</div>
            </div>
          ))}
          {hasil.length === 0 && <p className="sub">Belum ada hari yang cocok. Turunkan taraf Ayu atau longgarkan syarat Ala.</p>}
        </>
      )}
    </div>
  );
}

/* ---------------- Kelola Data (CRUD) ---------------- */
function Kelola({ meta, saya }) {
  const [sub, setSub] = useState('dewasa');
  const SUB = [['dewasa', 'Dewasa'], ['sasih', 'Koreksi Sasih'], ['riwayat', 'Riwayat Perubahan'],
    ...(saya.peran === 'admin' ? [['pengguna', 'Pengguna']] : []), ['sandi', 'Kata Sandi Saya']];
  return (
    <div className="panel">
      <h2>Kelola Data</h2>
      <p className="sub">Penambahan dan perbaikan tersimpan di basis data bersama. Data asli dari Excel tidak pernah ditimpa — bawaan Excel hanya dinonaktifkan, bukan dihapus, sehingga selalu bisa dikembalikan.</p>
      <div className="baris" style={{ marginBottom: '1rem' }}>
        {SUB.map(([k, l]) => <button key={k} className={`btn ${sub === k ? 'on' : ''}`} onClick={() => setSub(k)}>{l}</button>)}
      </div>
      {sub === 'dewasa' && <KelolaDewasa />}
      {sub === 'sasih' && <KelolaSasih />}
      {sub === 'riwayat' && <Riwayat />}
      {sub === 'pengguna' && saya.peran === 'admin' && <KelolaPengguna saya={saya} />}
      {sub === 'sandi' && <GantiSandi selesai={() => { window.location.reload(); }} />}
    </div>
  );
}

/* ---------------- Kelola pengguna (khusus pengelola) ---------------- */
const PENGGUNA_KOSONG = { nama: '', namaPengguna: '', sandi: '', peran: 'peranda' };

function KelolaPengguna({ saya }) {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(null);
  const [pesan, setPesan] = usePesan();
  const muat = useCallback(() => api.penggunaList().then(setData).catch((e) => setPesan(['galat', e.message])), [setPesan]);
  useEffect(() => { muat(); }, [muat]);

  const simpan = async () => {
    try {
      if (form.id) await api.penggunaUbah(form.id, form);
      else await api.penggunaTambah(form);
      setForm(null); setPesan(['ok', 'Tersimpan.']); muat();
    } catch (e) { setPesan(['galat', e.message]); }
  };
  const hapus = async (u) => {
    try { await api.penggunaHapus(u.id); setPesan(['ok', 'Pengguna dihapus.']); muat(); }
    catch (e) { setPesan(['galat', e.message]); }
  };

  return (
    <>
      {pesan && <div className={`pesan ${pesan[0]}`}>{pesan[1]}</div>}
      <div className="pesan info">
        <b>Pembaca</b> hanya dapat melihat kalender. <b>Peranda</b> dapat menyunting dewasa, koreksi sasih,
        penilaian, dan catatan. <b>Pengelola</b> dapat pula mengatur pengguna. Setiap perubahan tercatat
        atas nama pemakainya pada Riwayat Perubahan.
      </div>
      <div className="baris" style={{ marginBottom: '.9rem' }}>
        <button className="btn aksi" onClick={() => setForm({ ...PENGGUNA_KOSONG })}>+ Tambah Pengguna</button>
      </div>
      <div className="hitung">{data.length} pengguna</div>
      <div className="gulir">
        <table className="tbl">
          <thead><tr><th>Nama</th><th>Nama pengguna</th><th>Peran</th><th>Keadaan</th><th></th></tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <td><b>{u.nama}</b>{u.id === saya.id && <span className="tag s3" style={{ marginLeft: '.4rem' }}>Anda</span>}</td>
                <td>{u.nama_pengguna}</td>
                <td><span className={`tag ${u.peran === 'pembaca' ? 's3' : 's0'}`}>{PERAN_NAMA[u.peran]}</span></td>
                <td style={{ fontSize: '.85rem' }}>
                  {u.aktif ? 'aktif' : <span style={{ color: 'var(--alafg)' }}>nonaktif</span>}
                  {!!u.wajib_ganti && <div style={{ color: 'var(--brass)' }}>sandi belum diganti</div>}
                </td>
                <td><div className="baris">
                  <button className="btn" style={{ minHeight: '2.3rem', padding: '.3rem .6rem' }}
                    onClick={() => setForm({ id: u.id, nama: u.nama, peran: u.peran, aktif: u.aktif })}>Ubah</button>
                  {u.id !== saya.id && <button className="btn bahaya" style={{ minHeight: '2.3rem', padding: '.3rem .6rem' }}
                    onClick={() => hapus(u)}>Hapus</button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="tutup" onClick={(e) => e.target === e.currentTarget && setForm(null)}>
          <div className="dialog">
            <h2>{form.id ? 'Ubah Pengguna' : 'Tambah Pengguna'}</h2>
            <div className="grid2" style={{ marginBottom: '.8rem' }}>
              <div><label className="fl">Nama lengkap</label>
                <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
              {!form.id && <div><label className="fl">Nama pengguna</label>
                <input type="text" value={form.namaPengguna} autoComplete="off"
                  onChange={(e) => setForm({ ...form, namaPengguna: e.target.value })} placeholder="huruf kecil, tanpa spasi" /></div>}
              <div><label className="fl">Peran</label>
                <select value={form.peran} onChange={(e) => setForm({ ...form, peran: e.target.value })}>
                  <option value="pembaca">Pembaca — hanya melihat</option>
                  <option value="peranda">Peranda — dapat menyunting</option>
                  <option value="admin">Pengelola — termasuk atur pengguna</option>
                </select></div>
              {form.id && <div><label className="fl">Keadaan</label>
                <select value={form.aktif ? 1 : 0} onChange={(e) => setForm({ ...form, aktif: +e.target.value })}>
                  <option value={1}>Aktif</option><option value={0}>Nonaktif</option>
                </select></div>}
            </div>
            <label className="fl">{form.id ? 'Setel ulang kata sandi (kosongkan bila tidak diubah)' : 'Kata sandi awal (minimal 8 huruf)'}</label>
            <input type="password" autoComplete="new-password"
              value={form.id ? (form.sandiBaru || '') : form.sandi}
              onChange={(e) => setForm(form.id ? { ...form, sandiBaru: e.target.value } : { ...form, sandi: e.target.value })} />
            <p className="sub" style={{ marginTop: '.35rem' }}>
              Pengguna akan diminta menggantinya sendiri saat pertama masuk. Menyetel ulang sandi
              atau mengubah peran akan mengakhiri sesi pengguna itu di semua perangkat.
            </p>
            <div className="baris" style={{ marginTop: '1rem' }}>
              <button className="btn aksi" onClick={simpan}>Simpan</button>
              <button className="btn" onClick={() => setForm(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const KOSONG = { nama: '', kondisi: '', keterangan: '', sifat: 0 };

function KelolaDewasa() {
  const [data, setData] = useState([]);
  const [cari, setCari] = useState('');
  const [form, setForm] = useState(null);
  const [pesan, setPesan] = usePesan();
  const muat = useCallback(() => api.dewasaList(cari).then(setData), [cari]);
  useEffect(() => { const t = setTimeout(muat, 220); return () => clearTimeout(t); }, [muat]);

  const simpan = async () => {
    try {
      if (form.id) await api.dewasaUbah(form.id, form);
      else await api.dewasaTambah(form);
      setForm(null); setPesan(['ok', 'Tersimpan.']); muat();
    } catch (e) { setPesan(['galat', e.message]); }
  };
  const hapus = async (d) => {
    try { const r = await api.dewasaHapus(d.id); setPesan(['ok', r.asal === 'excel' ? 'Dewasa bawaan Excel dinonaktifkan (tidak dihapus).' : 'Dewasa dihapus.']); muat(); }
    catch (e) { setPesan(['galat', e.message]); }
  };

  return (
    <>
      {pesan && <div className={`pesan ${pesan[0]}`}>{pesan[1]}</div>}
      <div className="baris" style={{ marginBottom: '.9rem' }}>
        <input type="text" style={{ flex: 1, minWidth: '13rem' }} placeholder="Cari dewasa…" value={cari} onChange={(e) => setCari(e.target.value)} />
        <button className="btn aksi" onClick={() => setForm({ ...KOSONG })}>+ Tambah Dewasa</button>
      </div>
      <div className="hitung">{data.length} dewasa</div>
      <div className="gulir">
        <table className="tbl">
          <thead><tr><th>Nama</th><th>Sifat</th><th>Aturan berlaku</th><th>Asal</th><th></th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id}>
                <td><b>{d.nama}</b>{!d.aktif && <span className="tag s1" style={{ marginLeft: '.4rem' }}>nonaktif</span>}
                  <div style={{ fontSize: '.82rem', color: 'var(--ink2)' }}>{d.keterangan}</div></td>
                <td><span className={`tag s${d.sifat}`}>{SIFAT[d.sifat]}</span></td>
                <td style={{ fontSize: '.85rem' }}>{d.kondisi || <i>belum ada</i>}
                  {d.kataTakDikenali.length > 0 && <div style={{ color: 'var(--alafg)', fontSize: '.8rem' }}>tak dikenali: {d.kataTakDikenali.join(', ')}</div>}</td>
                <td style={{ fontSize: '.82rem' }}>{d.asal}</td>
                <td><div className="baris">
                  <button className="btn" style={{ minHeight: '2.3rem', padding: '.3rem .6rem' }} onClick={() => setForm(d)}>Ubah</button>
                  <button className="btn bahaya" style={{ minHeight: '2.3rem', padding: '.3rem .6rem' }} onClick={() => hapus(d)}>
                    {d.asal === 'excel' ? 'Nonaktifkan' : 'Hapus'}</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="tutup" onClick={(e) => e.target === e.currentTarget && setForm(null)}>
          <div className="dialog">
            <h2>{form.id ? 'Ubah Dewasa' : 'Tambah Dewasa'}</h2>
            <div className="grid2" style={{ marginBottom: '.8rem' }}>
              <div><label className="fl">Nama dewasa</label>
                <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
              <div><label className="fl">Sifat</label>
                <select value={form.sifat} onChange={(e) => setForm({ ...form, sifat: +e.target.value })}>
                  {SIFAT.map((s, i) => <option key={i} value={i}>{s}</option>)}
                </select></div>
            </div>
            <label className="fl">Aturan berlaku</label>
            <textarea value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
              placeholder="Contoh: Buda Keliwon Pahang. Soma Wage Penanggal 1." />
            <p className="sub" style={{ marginTop: '.35rem' }}>
              Satu kalimat = satu alternatif (dipisah titik). Kata di dalam satu kalimat digabung dengan DAN.
              Dikenali: nama Saptawara, Pancawara, Wuku, Wewaran, <b>Purnama</b>, <b>Tilem</b>, <b>Penanggal N</b>, <b>Pangelong N</b>, dan nama Sasih.
            </p>
            <label className="fl">Keterangan</label>
            <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="Contoh: Ayu anggen pawiwahan. Ala anggen matetanduran." />
            <div className="baris" style={{ marginTop: '1rem' }}>
              <button className="btn aksi" onClick={simpan}>Simpan</button>
              <button className="btn" onClick={() => setForm(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function KelolaSasih() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ tanggal: iso(new Date()), tp: '', sasih: '', alasan: '', oleh: '' });
  const [pesan, setPesan] = usePesan();
  const muat = useCallback(() => api.koreksiList().then(setData), []);
  useEffect(() => { muat(); }, [muat]);
  const simpan = async () => {
    try { await api.koreksiSimpan(form); setPesan(['ok', 'Koreksi tersimpan.']); muat(); }
    catch (e) { setPesan(['galat', e.message]); }
  };
  return (
    <>
      {pesan && <div className={`pesan ${pesan[0]}`}>{pesan[1]}</div>}
      <div className="pesan info">
        Penetapan Sasih, Nampih Sasih, Purnama, dan Tilem adalah wewenang rapat peranda — bukan hasil rumus semata.
        Isian di sini <b>menimpa</b> perhitungan otomatis untuk tanggal yang bersangkutan.
      </div>
      <div className="grid2" style={{ marginBottom: '.8rem' }}>
        <div><label className="fl">Tanggal</label>
          <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></div>
        <div><label className="fl">Penanggal / Panglong</label>
          <input type="text" value={form.tp} onChange={(e) => setForm({ ...form, tp: e.target.value })} placeholder="mis. Penanggal 14" /></div>
        <div><label className="fl">Sasih</label>
          <input type="text" value={form.sasih} onChange={(e) => setForm({ ...form, sasih: e.target.value })} placeholder="mis. 4 atau M.11" /></div>
        <div><label className="fl">Ditetapkan oleh</label>
          <input type="text" value={form.oleh} onChange={(e) => setForm({ ...form, oleh: e.target.value })} placeholder="nama / sabha" /></div>
      </div>
      <label className="fl">Alasan / dasar keputusan</label>
      <input type="text" value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} placeholder="mis. Keputusan rapat peranda 12 Mei 2046" />
      <div className="baris" style={{ margin: '.8rem 0 1.2rem' }}><button className="btn aksi" onClick={simpan}>Simpan Koreksi</button></div>

      <div className="hitung">{data.length} koreksi tercatat</div>
      <div className="gulir">
        <table className="tbl">
          <thead><tr><th>Tanggal</th><th>Penanggal/Panglong</th><th>Sasih</th><th>Alasan</th><th>Oleh</th><th></th></tr></thead>
          <tbody>
            {data.map((k) => (
              <tr key={k.tanggal}>
                <td><b>{fmtP(k.tanggal)}</b></td><td>{k.tp || '—'}</td><td>{k.sasih || '—'}</td>
                <td style={{ fontSize: '.85rem' }}>{k.alasan}</td><td>{k.oleh}</td>
                <td><button className="btn bahaya" style={{ minHeight: '2.3rem', padding: '.3rem .6rem' }}
                  onClick={async () => { await api.koreksiHapus(k.tanggal); setPesan(['ok', 'Koreksi dibatalkan.']); muat(); }}>Batalkan</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Riwayat() {
  const [data, setData] = useState([]);
  useEffect(() => { api.riwayat().then(setData); }, []);
  return (
    <>
      <p className="sub">Seluruh perubahan tercatat agar dapat ditelusuri dan dipertanggungjawabkan dalam rapat.</p>
      <div className="gulir">
        <table className="tbl">
          <thead><tr><th>Waktu</th><th>Bagian</th><th>Tindakan</th><th>Kunci</th><th>Oleh</th></tr></thead>
          <tbody>{data.map((r) => (
            <tr key={r.id}><td>{r.waktu}</td><td>{r.tabel}</td><td>{r.aksi}</td><td>{r.kunci}</td><td>{r.oleh || '—'}</td></tr>
          ))}</tbody>
        </table>
      </div>
      {data.length === 0 && <p className="sub">Belum ada perubahan.</p>}
    </>
  );
}

/* ---------------- Panduan ---------------- */
function Panduan({ meta }) {
  return (
    <div className="panel">
      <h2>Panduan Membaca</h2>
      <p className="sub">Ringkasan panduan interpretasi sebagaimana ditulis penyusun pada lembar aslinya.</p>

      <h3>Arti warna dan taraf</h3>
      <p>Kuat-lemahnya sebuah hari ditentukan oleh berapa banyak unsur Wariga yang menguncinya (warna dibedakan antara Ayu/Arah Positif dan Ala/Arah Pantangan):</p>
      <div className="grid2" style={{ marginTop: '.7rem' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
          <div key={t} className="kartu s3" style={{ borderLeftColor: WARNA_TARAF_AYU[t], marginBottom: '1rem' }}>
            <div className="nm">
              <span className="pil" style={{ background: WARNA_TARAF_AYU[t], color: t >= 7 ? '#fff' : '#2B2B2B', marginRight: '.5rem' }}>Ayu: {meta.taraf[t]?.nama || 'Taraf ' + t}</span>
              <span className="pil" style={{ background: WARNA_TARAF_ALA[t], color: t >= 4 ? '#fff' : '#2B2B2B' }}>Ala: {meta.taraf[t]?.nama || 'Taraf ' + t}</span>
            </div>
            <div className="desc" style={{ marginTop: '.5rem' }}>
              <b>Bila Ayu:</b> {['Kebaikan Nistaning Nista (Unsur Teramat Ringan)', 'Kebaikan Nistaning Madya (Pertumbuhan Awal)', 'Kebaikan Nistaning Utama (Kebaikan Mulai Terasa)', 'Kebaikan Madyaning Nista (Tingkat Menengah Awal)', 'Kebaikan Madyaning Madya (Stabil/Wajar/Seimbang)', 'Kebaikan Madyaning Utama (Kebaikan Menengah Kuat)', 'Kebaikan Utamaning Nista (Matang/Kuat/Berbobot)', 'Kebaikan Utamaning Madya (Sangat Padat/Berwibawa)', 'Kebaikan Utamaning Utama (Puncak Kesucian/Kemuliaan Mutlak)'][t - 1]}.<br />
              <b>Bila Ala:</b> {['Bahaya Nistaning Nista (Sangat Tipis/Ringan/Kecil)', 'Bahaya Nistaning Madya (Mulai Ada Gesekan)', 'Bahaya Nistaning Utama (Potensi Hambatan Terasa)', 'Bahaya Madyaning Nista (Tingkat Kerawanan Menengah Rendah)', 'Bahaya Madyaning Madya (Kerawanan Menengah/Seimbang)', 'Bahaya Madyaning Utama (Kerawanan Menengah Tinggi)', 'Bahaya Utamaning Nista (Kandungan Energi Buruk Cukup Kuat)', 'Bahaya Utamaning Madya (Potensi Bahaya Sangat Nyata)', 'Bahaya Utamaning Utama (Puncak Pantangan Terberat/Wajib Dihindari Mutlak)'][t - 1]}.<br />
              <i>Dasar: {meta.taraf[t]?.dasar || ''}</i>
            </div>
          </div>
        ))}
      </div>

      <p><b>1. Taraf lebih tinggi menang.</b> Bila pada hari yang sama Ayu bertaraf Madyaning Madya sedangkan Ala hanya Madyaning Nista, hari itu masih layak dipergunakan — kebaikan dengan unsur lebih lengkap menetralisir pantangan yang unsurnya lebih sedikit.</p>
      <p><b>2. Hari terbaik tanpa cela.</b> Hari paling utama adalah bila kolom Ayu terisi (terutama Madyaning Madya atau Utamaning Nista) sedangkan kolom Ala kosong sama sekali.</p>

      <h3>Sampai tahun berapa aplikasi ini berlaku?</h3>
      <p><b>Wewaran dan Wuku: selamanya.</b> Siklus Pawukon 210 hari dihitung sendiri oleh aplikasi dan telah diuji cocok sempurna terhadap 33 siklus penuh dalam berkas Excel — tanpa satu pun selisih.</p>
      <p><b>Sasih dan Penanggal: dihitung, tetapi menunggu penetapan.</b> Berkas Excel memuat satu siklus Metonic (19 tahun, {fmt(meta.rentangExcel.mulai)} — {fmt(meta.rentangExcel.sampai)}) yang telah diaudit penyusun. Di luar rentang itu aplikasi mengulang siklus tersebut dan menandainya <b>PROYEKSI</b>. Penetapan sesungguhnya — terutama Nampih Sasih — tetap wewenang rapat peranda, dan hasilnya dimasukkan lewat menu <b>Kelola Data → Koreksi Sasih</b>.</p>
      <p><b>Dewasa:</b> di dalam rentang Excel dipakai tabel harian yang telah diaudit. Di luar rentang itu, dewasa dihitung dari aturan tertulisnya (mis. <i>“Buda Landep Penanggal 2”</i>).</p>

      <h3>Catatan kejujuran mengenai data</h3>
      <p>Pada berkas asli terdapat beberapa dewasa yang <b>aturan tertulisnya tidak sejalan dengan tabel hariannya</b> — misalnya <i>Kala Muncrat</i> tertulis “Soma Pon Merakih”, padahal hari yang ditandai seluruhnya Soma <i>Paing</i> Merakih. Selama masih di dalam rentang Excel hal ini tidak berpengaruh karena tabel yang dipakai. Namun untuk tahun-tahun berikutnya, aturan itulah yang dihitung — karena itu perbaikannya sebaiknya ditetapkan lewat rapat dan dimasukkan pada menu Kelola Data.</p>
    </div>
  );
}
