const dasar = '';
async function minta(jalur, opsi = {}) {
  const r = await fetch(dasar + jalur, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',                 // sesi memakai cookie httpOnly
    ...opsi,
    body: opsi.body ? JSON.stringify(opsi.body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(data.galat || `Gagal (${r.status})`); e.kode = r.status; throw e; }
  return data;
}
export const api = {
  // sesi & pengguna
  saya: () => minta('/api/saya'),
  masuk: (b) => minta('/api/masuk', { method: 'POST', body: b }),
  keluar: () => minta('/api/keluar', { method: 'POST' }),
  gantiSandi: (b) => minta('/api/ganti-sandi', { method: 'POST', body: b }),
  penggunaList: () => minta('/api/pengguna'),
  penggunaTambah: (b) => minta('/api/pengguna', { method: 'POST', body: b }),
  penggunaUbah: (id, b) => minta(`/api/pengguna/${id}`, { method: 'PUT', body: b }),
  penggunaHapus: (id) => minta(`/api/pengguna/${id}`, { method: 'DELETE' }),
  meta: () => minta('/api/meta'),
  tika: () => minta('/api/tika'),
  hari: (t) => minta(`/api/hari?tanggal=${t}`),
  bulan: (th, bl) => minta(`/api/bulan?tahun=${th}&bulan=${bl}`),
  hariBaik: (p) => minta(`/api/hari-baik?dari=${p.dari}&jenis=${p.jenis}&taraf=${p.taraf}&tanpaAla=${p.tanpaAla ? 1 : 0}`),
  dewasaList: (cari = '') => minta(`/api/dewasa?cari=${encodeURIComponent(cari)}`),
  dewasaTambah: (b) => minta('/api/dewasa', { method: 'POST', body: b }),
  dewasaUbah: (id, b) => minta(`/api/dewasa/${id}`, { method: 'PUT', body: b }),
  dewasaHapus: (id) => minta(`/api/dewasa/${id}`, { method: 'DELETE' }),
  koreksiList: () => minta('/api/koreksi-sasih'),
  koreksiSimpan: (b) => minta('/api/koreksi-sasih', { method: 'POST', body: b }),
  koreksiHapus: (t) => minta(`/api/koreksi-sasih/${t}`, { method: 'DELETE' }),
  penilaianSimpan: (b) => minta('/api/penilaian', { method: 'POST', body: b }),
  penilaianHapus: (t, j, s) => minta(`/api/penilaian/${t}/${j}/${s}`, { method: 'DELETE' }),
  catatanTambah: (b) => minta('/api/catatan', { method: 'POST', body: b }),
  catatanHapus: (id) => minta(`/api/catatan/${id}`, { method: 'DELETE' }),
  riwayat: () => minta('/api/riwayat'),
};
