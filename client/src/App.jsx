import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';

/* ---------------- alat bantu ---------------- */
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
  'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const SAPTA = [['Redite', 'Minggu'], ['Soma', 'Senin'], ['Anggara', 'Selasa'], ['Buda', 'Rabu'],
  ['Wraspati', 'Kamis'], ['Sukra', 'Jumat'], ['Saniscara', 'Sabtu']];
const SASIH = ['', 'Kasa', 'Karo', 'Katiga', 'Kapat', 'Kalima', 'Kanem', 'Kapitu', 'Kaulu',
  'Kasanga', 'Kadasa', 'Jyestha', 'Sadha'];
const SIFAT = ['Ayu', 'Ala', 'Ayu & Ala', 'Netral'];
const WARNA_TARAF = ['transparent', 'var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t4)'];

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

  if (saya.masuk && saya.wajibGanti)
    return <div className="wrap"><div className="app"><GantiSandi wajib selesai={() => { setSaya(null); muatSesi(); }} /></div></div>;
  if (layarMasuk || (saya.wajibMasuk && !saya.masuk))
    return <div className="wrap"><div className="app"><Masuk batal={saya.wajibMasuk ? null : () => setLayarMasuk(false)}
      selesai={() => { setLayarMasuk(false); setSaya(null); muatSesi(); }} /></div></div>;

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
              <div>
                <div className="nm">{saya.nama}</div>
                <div className="pr">{PERAN_NAMA[saya.peran]}</div>
              </div>
              <button className="btn" onClick={keluar}>Keluar</button>
            </>) : (<>
              <div><div className="nm">Belum masuk</div><div className="pr">hanya dapat membaca</div></div>
              <button className="btn utama" onClick={() => setLayarMasuk(true)}>Masuk</button>
            </>)}
          </div>
        </div>

        {tab === 'kalender' && <Kalender meta={meta} tanggal={tanggal} setTanggal={setTanggal} bolehSunting={bolehSunting} />}
        {tab === 'cari' && <div className="utama"><CariDewasa buka={(t) => { setTanggal(t); setTab('kalender'); }} /></div>}
        {tab === 'baik' && <div className="utama"><HariBaik meta={meta} buka={(t) => { setTanggal(t); setTab('kalender'); }} /></div>}
        {tab === 'tika' && <div className="utama"><PapanTika /></div>}
        {tab === 'kelola' && bolehSunting && <div className="utama"><Kelola meta={meta} saya={saya} /></div>}
        {tab === 'panduan' && <div className="utama"><Panduan meta={meta} /></div>}
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
    <div className="panel" style={{ maxWidth: '32rem', margin: '3rem auto' }}>
      <h2>Masuk</h2>
      <p className="sub">Membaca kalender terbuka untuk umum. Masuk diperlukan hanya untuk menambah atau memperbaiki data.</p>
      {galat && <div className="pesan galat">{galat}</div>}
      <form onSubmit={kirim}>
        <label className="fl">Nama pengguna</label>
        <input type="text" autoFocus autoComplete="username" value={f.namaPengguna}
          onChange={(e) => setF({ ...f, namaPengguna: e.target.value })} />
        <label className="fl" style={{ marginTop: '.8rem' }}>Kata sandi</label>
        <input type="password" autoComplete="current-password" value={f.sandi}
          onChange={(e) => setF({ ...f, sandi: e.target.value })} />
        <div className="baris" style={{ marginTop: '1.1rem' }}>
          <button type="submit" className="btn utama" disabled={sibuk}>{sibuk ? 'Memeriksa…' : 'Masuk'}</button>
          {batal && <button type="button" className="btn" onClick={batal}>Kembali ke kalender</button>}
        </div>
      </form>
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
          <button type="submit" className="btn utama">Simpan</button>
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
  const [keperluan, setKeperluan] = useState('pawiwahan');
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
  const kAyu = keperluan === 'ngaben' ? 'ngabenAyu' : 'pawiwahanAyu';
  const kAla = keperluan === 'ngaben' ? 'ngabenAla' : 'pawiwahanAla';

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
          <MiniKalender bln={bln} geser={geserBulan} tanggal={tanggal} hariIni={hariIni} pilih={pilihTanggal} />

          <div className="kartu">
            <h3>Kesimpulan hari terpilih</h3>
            {detail && <>
              <Simpul k={detail.kesimpulan} />
              <div style={{ fontSize: '.74rem', color: 'var(--tulis3)', textAlign: 'center', margin: '.2rem 0 .5rem' }}>
                Ayu {detail.kesimpulan.ayu} · Ala {detail.kesimpulan.ala} · dari {detail.dewasa.length} dewasa
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

          <div className="kartu">
            <h3>Sebaran bulan ini</h3>
            <Sebaran hari={hari} kAyu={kAyu} kAla={kAla} meta={meta} />
          </div>

          <div className="kartu">
            <h3>Keperluan</h3>
            <div className="baris">
              {[['pawiwahan', 'Pawiwahan'], ['ngaben', 'Ngaben']].map(([v, l]) => (
                <button key={v} className={`btn ${keperluan === v ? 'on' : ''}`} onClick={() => setKeperluan(v)}>{l}</button>
              ))}
            </div>
            <p className="sub" style={{ margin: '.6rem 0 0', fontSize: '.78rem' }}>
              Menentukan pita Ayu/Ala yang ditampilkan pada kalender.
            </p>
          </div>
        </div>

        <div className="utama">
          <div className="judulbar">
            <button className="navbtn" onClick={() => geserBulan(-1)} aria-label="Bulan sebelumnya">‹</button>
            <h2>{BULAN[bln.b - 1]} {bln.t}
              {hari.length > 0 && <small style={{ display: 'block', fontFamily: "'Lora',serif",
                fontWeight: 400, fontSize: '.6rem', letterSpacing: '.16em', textTransform: 'uppercase',
                color: '#F0D2D2', marginTop: '.15rem' }}>
                Sasih {namaSasih(hari[Math.floor(hari.length / 2)].sasih)}
              </small>}
            </h2>
            <button className="navbtn" onClick={() => geserBulan(1)} aria-label="Bulan berikutnya">›</button>
            <button className="navbtn utamai" onClick={() => { const d = new Date(); setBln({ t: d.getFullYear(), b: d.getMonth() + 1 }); setTanggal(iso(d)); }}>Hari Ini</button>
            <div className="segmen">
              {[['bulan', 'Bulan'], ['pekan', 'Pekan'], ['hari', 'Hari']].map(([v, l]) => (
                <button key={v} className={tampil === v ? 'on' : ''} onClick={() => setTampil(v)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="striplegenda">
            <b style={{ color: 'var(--tulis)' }}>Strip 4 warna:</b>
            <span>Ngaben Ayu · Ngaben Ala · Pawiwahan Ayu · Pawiwahan Ala</span>
            {[1, 2, 3, 4].map((t) => (
              <span className="kk" key={t}>
                <i className={`t${t}`} style={{ background: ['', '#2B2B2B', '#C25A10', '#2E7D32', '#1565C0'][t] }} />
                {meta.taraf[t].nama}
              </span>
            ))}
            <span className="kk"><i style={{ background: 'repeating-linear-gradient(45deg,#fff 0 3px,#EFEAE2 3px 6px)' }} />kosong</span>
            <span className="kk"><i style={{ background: '#C22F2F', borderRadius: '50%' }} />angka Penanggal</span>
            <span className="kk"><i style={{ background: '#3B6FB5', borderRadius: '50%' }} />angka Panglong</span>
          </div>

          {sibuk && <div className="muat">Menghitung…</div>}

          {!sibuk && tampil === 'bulan' && (
            <TampilBulan hari={hari} bln={bln} tanggal={tanggal} hariIni={hariIni}
              kAyu={kAyu} kAla={kAla} meta={meta} pilih={bukaTanggal} />
          )}
          {!sibuk && tampil === 'pekan' && (
            <TampilPekan pekan={pekan} tanggal={tanggal} hariIni={hariIni}
              kAyu={kAyu} kAla={kAla} meta={meta} pilih={bukaTanggal} />
          )}
          {!sibuk && tampil === 'hari' && detail && (<>
            <TampilHari d={detail} kAyu={kAyu} kAla={kAla} meta={meta} />
            <button className="navbtn utamai bukapenuh" onClick={() => setPopup(true)}>
              Lihat keterangan lengkap
            </button>
          </>)}

          <p className="sub" style={{ margin: '.9rem 0 0', fontSize: '.8rem' }}>
            Blok berwarna = dewasa yang berlaku: <b style={{ color: 'var(--ayuT)' }}>hijau Ayu</b>,
            <b style={{ color: 'var(--alaT)' }}> merah Ala</b>, <b style={{ color: 'var(--duaT)' }}>jingga Ayu &amp; Ala</b>.
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

const WARNA_SIFAT = ['var(--ayu)', 'var(--ala)', 'var(--dua)', 'var(--net)'];

/** Strip empat warna dengan susunan sama seperti kolom pada berkas Excel. */
function Strip({ n, meta, ket = true }) {
  const kolom = [
    ['Ngaben Ayu', n.ngabenAyu.taraf], ['Ngaben Ala', n.ngabenAla.taraf],
    ['Pawiwahan Ayu', n.pawiwahanAyu.taraf], ['Pawiwahan Ala', n.pawiwahanAla.taraf],
  ];
  return (
    <>
      <span className="strip">
        {kolom.map(([nama, t], i) => (
          <i key={i} className={t ? `t${t}` : 'kosong'}
            title={`${nama}: ${t ? meta.taraf[t].nama : 'kosong'}`} />
        ))}
      </span>
      {ket && <span className="stripket"><span>NGABEN</span><span>PAWIWAHAN</span></span>}
    </>
  );
}

/** Kesimpulan lima tingkat, selalu berupa tulisan — bukan warna saja. */
function Simpul({ k, kecil }) {
  if (!k) return null;
  return <span className={`simpul k${k.tingkat}`} title={`Ayu ${k.ayu} · Ala ${k.ala}`}>
    {kecil ? k.ringkas : k.nama}</span>;
}

function MiniKalender({ bln, geser, tanggal, hariIni, pilih }) {
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
      <div className="miniatas">
        <b>{BULAN[bln.b - 1]} {bln.t}</b>
        <span className="baris">
          <button className="bulat" style={{ width: '2.2rem', height: '2.2rem' }} onClick={() => geser(-1)} aria-label="Bulan sebelumnya">‹</button>
          <button className="bulat" style={{ width: '2.2rem', height: '2.2rem' }} onClick={() => geser(1)} aria-label="Bulan berikutnya">›</button>
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

function Sebaran({ hari, kAyu, kAla, meta }) {
  if (!hari.length) return <div className="muat">Memuat…</div>;
  const kel = [
    ['Sangat baik', 'var(--ayu)', (h) => h.nilai[kAyu].taraf >= 3 && h.nilai[kAla].taraf === 0],
    ['Baik', '#7BC47F', (h) => h.nilai[kAyu].taraf > 0 && h.nilai[kAla].taraf === 0 && !(h.nilai[kAyu].taraf >= 3)],
    ['Perlu timbang', 'var(--dua)', (h) => h.nilai[kAyu].taraf > 0 && h.nilai[kAla].taraf > 0],
    ['Pantangan', 'var(--ala)', (h) => h.nilai[kAyu].taraf === 0 && h.nilai[kAla].taraf > 0],
  ];
  return (<>
    {kel.map(([nama, warna, uji]) => {
      const n = hari.filter(uji).length;
      return (
        <div className="bar" key={nama}>
          <span>{nama}</span>
          <span className="jalur"><span className="isi" style={{ width: `${(n / hari.length) * 100}%`, background: warna }} /></span>
          <span className="ang">{n}</span>
        </div>
      );
    })}
    <p className="sub" style={{ margin: '.5rem 0 0', fontSize: '.76rem' }}>Dari {hari.length} hari.</p>
  </>);
}

function PitaNilai({ h, kAyu, kAla, meta }) {
  const A = h.nilai[kAyu].taraf, L = h.nilai[kAla].taraf;
  return (
    <div className="pita">
      <span className={`pitab ${A ? 'ayu' : 'kosong'}`}>AYU {A ? meta.taraf[A].nama : '—'}</span>
      <span className={`pitab ${L ? 'ala' : 'kosong'}`}>ALA {L ? meta.taraf[L].nama : '—'}</span>
    </div>
  );
}

function TampilBulan({ hari, bln, tanggal, hariIni, kAyu, kAla, meta, pilih }) {
  const depan = (new Date(bln.t, bln.b - 1, 1).getDay() + 6) % 7;
  return (
    <div className="bulangrid">
      {['Soma', 'Anggara', 'Buda', 'Wraspati', 'Sukra', 'Saniscara', 'Redite'].map((n, i) => (
        <div key={n} className="harikepala"><div className="nm">{n}</div>
          <div className="tg">{['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][i]}</div></div>
      ))}
      {Array.from({ length: depan }, (_, i) => <div key={'k' + i} className="bsel luar" />)}
      {hari.map((h) => {
        return (
          <button key={h.tanggal} className={`bsel ${h.tanggal === tanggal ? 'pilih' : ''} ${h.tanggal === hariIni ? 'ini' : ''}`}
            onClick={() => pilih(h.tanggal)}>
            <span className="sudut">{(() => {
              const pen = /Penanggal\s*(\d+)/i.exec(h.tp || '');
              const pang = /Pang?e?long\s*(\d+)/i.exec(h.tp || '');
              const n = pen ? pen[1] : (pang ? pang[1] : null);
              return n ? (<><i className={pen ? 'png' : 'pgl'} />{n}</>) : null;
            })()}</span>
            <span className="blnbaris"><span className="no">{h.hariKe}</span>
              <BulanFase tp={h.tp} ukuran={13} /></span>
            <span className="kt">{pendek(h.tp)}<br />{h.wuku}{h.proyeksi ? ' · proyeksi' : ''}</span>
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

function TampilPekan({ pekan, tanggal, hariIni, kAyu, kAla, meta, pilih }) {
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
      {pekan.map((h) => (
        <div key={h.tanggal} onClick={() => pilih(h.tanggal)}
          className={`harikolom ${h.tanggal === tanggal ? 'pilih' : ''} ${h.proyeksi ? 'proyeksi' : ''}`}>
          {h.dewasa.slice(0, 6).map((x) => (
            <div key={x.id} className={`blok s${x.sifat}`}>
              <div className="jd">{x.nama}</div>
              <div className="sb">{SIFAT[x.sifat]}</div>
            </div>
          ))}
          {h.dewasa.length > 6 && <div className="lagi">+{h.dewasa.length - 6} lagi</div>}
          {h.dewasa.length === 0 && <div className="lagi">tanpa dewasa khusus</div>}
        </div>
      ))}
    </div>
  </>);
}

function TampilHari({ d, kAyu, kAla, meta }) {
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
      <div className={`harikolom ${d.proyeksi ? 'proyeksi' : ''}`} style={{ cursor: 'default' }}>
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

  const WARA = [['ekaNama', 'Eka Wara'], ['dwiNama', 'Dwi Wara'], ['triNama', 'Tri Wara'],
    ['caturNama', 'Catur Wara'], ['sadNama', 'Sadwara'], ['astaNama', 'Astawara'],
    ['sangaNama', 'Sangawara'], ['ingsadNama', 'Ing. Sadina'], ['dasaNama', 'Dasawara'],
    ['saptawara', 'Saptawara'], ['pancawara', 'Pancawara'], ['wuku', 'Wuku'], ['pertithi', 'Pertithi']];

  const slot = (label, nilai, jenis, sisi) => (
    <div className="kotak" style={{ display: 'block' }}>
      <div className="baris" style={{ marginBottom: '.25rem' }}>
        <b>{label}</b>
        {nilai.taraf > 0
          ? <span className="cip" style={{ background: WARNA_TARAF[nilai.taraf], margin: 0 }}>{meta.taraf[nilai.taraf].nama}</span>
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
      <div className={`putusan p-${d.putusan.kode}`}>{d.putusan.teks}</div>
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
          purnamaAstro: /Penanggal\s*15/i.test(d.tpAstronomis || ''),
          tilemAstro: /Pang?e?long\s*15/i.test(d.tpAstronomis || ''),
        }} /></span>
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
          {[0, 2, 1, 3].flatMap((sf) => d.dewasa.filter((x) => x.sifat === sf)).map((x) => (
            <div key={x.id} className={`dbaris s${x.sifat}`}>
              <div className="nm">{x.nama}
                <span style={{ fontWeight: 400, fontSize: '.74rem', color: '#6B6577', marginLeft: '.4rem' }}>
                  {x.sumber === 'excel' ? 'dari Excel' : 'dari aturan'}</span></div>
              <div className="ds">{x.keterangan || '—'}</div>
            </div>
          ))}
        </div>

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

function PapanTika() {
  const [data, setData] = useState(null);
  const [sel, setSel] = useState(null);
  const [galat, setGalat] = useState(null);
  const [maksud, setMaksud] = useState('umum');

  // Tekan Esc untuk menutup pop-up — jalan keluar yang tetap tersedia
  // walau tombol tutup terlewat oleh pengguna.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSel(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { api.tika().then(setData).catch((e) => setGalat(e.message)); }, []);

  if (galat) return <div className="pesan galat">{galat}</div>;
  if (!data) return <div className="muat">Menyusun papan tika…</div>;

  const semuaSel = data.baris.flatMap((b) => b.hari);
  const tingkatSel = (h) => h.tingkat[maksud] || 0;
  const jumlahTingkat = semuaSel.reduce((a, h) => { const t = tingkatSel(h); a[t] = (a[t] || 0) + 1; return a; }, {});
  const yTerpilih = data.yadnya.find((y) => y.kunci === maksud);
  const kosongYadnya = yTerpilih && semuaSel.every((h) => h.tingkat[maksud] === 0) ? yTerpilih : null;

  const simbol = (i) => {
    const l = data.lambang[i];
    return <span key={i} className={KELAS_SIFAT[l.sifat]} title={`${l.nama} — ${SIFAT[l.sifat]}`}>{LAMBANG[i]}</span>;
  };

  return (
    <>
      <h2>Papan Tika</h2>
      <p className="sub">
        Bentuk tika cetak: 30 baris Wuku × 7 kolom Saptawara = 210 hari, satu putaran penuh Pawukon.
        Isinya berulang selamanya, jadi papan ini berlaku untuk tahun mana pun.
      </p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 17rem', gap: '.7rem', alignItems: 'start' }}>
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
                      <td className="wk">{b.wuku}</td>
                      {b.hari.map((h) => (
                        <td key={h.pawukon}
                          className={`tikasel n${tingkatSel(h)} ${sel?.pawukon === h.pawukon ? 'pilih' : ''}`}
                          onClick={() => setSel({ ...h, wuku: b.wuku, ingkel: b.ingkel })}
                          title={`${b.wuku} · ${data.saptawara[h.pawukon % 7]} — ${
                            tingkatSel(h) ? data.tingkatan[tingkatSel(h)].nama : 'tanpa penilaian'} · ${h.dewasa.length} dewasa`}>
                          <span className="tk">{tingkatSel(h) ? data.tingkatan[tingkatSel(h)].ringkas : '–'}</span>
                          <div className="lam">{h.lambang.map(simbol)}</div>
                          {h.dewasa.length > h.lambang.length &&
                            <div className="sisa">+{h.dewasa.length - h.lambang.length}</div>}
                        </td>
                      ))}
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
                <h3>{sel.wuku} · {data.saptawara[sel.pawukon % 7]}</h3>
                <div className="sub2">
                  Hari ke-{sel.pawukon + 1} dari 210 · Ingkel {sel.ingkel} · {sel.dewasa.length} dewasa berlaku
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
                        <div className="nm">{x.nama}</div>
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
        <div className="baris" style={{ marginBottom: '.9rem' }}>
          {[0, 1, 2, 3, 4].map((t) => (
            <button key={t} className={`btn ${taraf === t ? 'on' : ''}`} onClick={() => setTaraf(t)}>
              {t === 0 ? 'Kosong' : meta.taraf[t].nama}
            </button>
          ))}
        </div>
        <label className="fl">Keterangan</label>
        <textarea value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="Keterangan hari…" />
        <div className="baris" style={{ marginTop: '1rem' }}>
          <button className="btn utama" onClick={simpan}>Simpan</button>
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
            {[1, 2, 3, 4].map((t) => <option key={t} value={t}>{meta.taraf[t].nama} — taraf {t}</option>)}
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
            <div key={h.tanggal} className="kartu s0" style={{ borderLeftColor: WARNA_TARAF[h.taraf], cursor: 'pointer' }} onClick={() => buka(h.tanggal)}>
              <div className="nm">{fmtP(h.tanggal)}
                <span className="pil" style={{ background: WARNA_TARAF[h.taraf] }}>Ayu {h.tarafNama}</span>
                {h.tarafAla > 0 && <span className="pil" style={{ background: 'var(--alafg)' }}>Ala {h.tarafAlaNama}</span>}
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
        <button className="btn utama" onClick={() => setForm({ ...PENGGUNA_KOSONG })}>+ Tambah Pengguna</button>
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
              <button className="btn utama" onClick={simpan}>Simpan</button>
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
        <button className="btn utama" onClick={() => setForm({ ...KOSONG })}>+ Tambah Dewasa</button>
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
              <button className="btn utama" onClick={simpan}>Simpan</button>
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
      <div className="baris" style={{ margin: '.8rem 0 1.2rem' }}><button className="btn utama" onClick={simpan}>Simpan Koreksi</button></div>

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
      <p>Kuat-lemahnya sebuah hari ditentukan oleh berapa banyak unsur Wariga yang menguncinya:</p>
      <div className="grid2" style={{ marginTop: '.7rem' }}>
        {[1, 2, 3, 4].map((t) => (
          <div key={t} className="kartu s3" style={{ borderLeftColor: WARNA_TARAF[t] }}>
            <div className="nm"><span className="pil" style={{ background: WARNA_TARAF[t] }}>{meta.taraf[t].nama}</span> taraf {t}</div>
            <div className="desc">
              <b>Bila Ayu:</b> {['kebaikan paling ringan', 'kebaikan menengah', 'kebaikan tinggi', 'kebaikan paling sempurna'][t - 1]}.<br />
              <b>Bila Ala:</b> {['bahaya paling ringan', 'bahaya menengah', 'bahaya tinggi', 'bahaya paling berat'][t - 1]}.<br />
              <i>Dasar: {meta.taraf[t].dasar}</i>
            </div>
          </div>
        ))}
      </div>

      <h3>Cara mengambil keputusan</h3>
      <p><b>1. Taraf lebih tinggi menang.</b> Bila pada hari yang sama Ayu bertaraf Hijau sedangkan Ala hanya Coklat, hari itu masih layak dipergunakan — kebaikan dengan unsur lebih lengkap menetralisir pantangan yang unsurnya lebih sedikit.</p>
      <p><b>2. Hari terbaik tanpa cela.</b> Hari paling utama adalah bila kolom Ayu terisi (terutama Hijau atau Biru) sedangkan kolom Ala kosong sama sekali.</p>

      <h3>Sampai tahun berapa aplikasi ini berlaku?</h3>
      <p><b>Wewaran dan Wuku: selamanya.</b> Siklus Pawukon 210 hari dihitung sendiri oleh aplikasi dan telah diuji cocok sempurna terhadap 33 siklus penuh dalam berkas Excel — tanpa satu pun selisih.</p>
      <p><b>Sasih dan Penanggal: dihitung, tetapi menunggu penetapan.</b> Berkas Excel memuat satu siklus Metonic (19 tahun, {fmt(meta.rentangExcel.mulai)} — {fmt(meta.rentangExcel.sampai)}) yang telah diaudit penyusun. Di luar rentang itu aplikasi mengulang siklus tersebut dan menandainya <b>PROYEKSI</b>. Penetapan sesungguhnya — terutama Nampih Sasih — tetap wewenang rapat peranda, dan hasilnya dimasukkan lewat menu <b>Kelola Data → Koreksi Sasih</b>.</p>
      <p><b>Dewasa:</b> di dalam rentang Excel dipakai tabel harian yang telah diaudit. Di luar rentang itu, dewasa dihitung dari aturan tertulisnya (mis. <i>“Buda Landep Penanggal 2”</i>).</p>

      <h3>Catatan kejujuran mengenai data</h3>
      <p>Pada berkas asli terdapat beberapa dewasa yang <b>aturan tertulisnya tidak sejalan dengan tabel hariannya</b> — misalnya <i>Kala Muncrat</i> tertulis “Soma Pon Merakih”, padahal hari yang ditandai seluruhnya Soma <i>Paing</i> Merakih. Selama masih di dalam rentang Excel hal ini tidak berpengaruh karena tabel yang dipakai. Namun untuk tahun-tahun berikutnya, aturan itulah yang dihitung — karena itu perbaikannya sebaiknya ditetapkan lewat rapat dan dimasukkan pada menu Kelola Data.</p>
    </div>
  );
}
