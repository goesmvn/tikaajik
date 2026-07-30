/**
 * Basis data bersama (SQLite bawaan Node — tanpa dependensi luar).
 *
 * Berkas Excel diperlakukan sebagai SUMBER ASAL yang tidak diubah.
 * Semua penambahan & perbaikan peranda disimpan di sini sebagai lapisan
 * di atasnya, lengkap dengan riwayat perubahan supaya bisa ditelusuri
 * dan dikembalikan bila rapat memutuskan lain.
 */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = process.env.TIKA_DB || path.join(DATA_DIR, 'tika.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS dewasa (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nama        TEXT NOT NULL,
  kondisi     TEXT NOT NULL DEFAULT '',
  keterangan  TEXT NOT NULL DEFAULT '',
  sifat       INTEGER NOT NULL DEFAULT 0,   -- 0 Ayu, 1 Ala, 2 Ayu&Ala, 3 Netral
  asal        TEXT NOT NULL DEFAULT 'excel',-- 'excel' | 'tambahan'
  aktif       INTEGER NOT NULL DEFAULT 1,
  diubah      TEXT NOT NULL DEFAULT (datetime('now')),
  pengguna_id INTEGER REFERENCES pengguna(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_dewasa_nama ON dewasa(nama);
CREATE INDEX IF NOT EXISTS idx_dewasa_pengguna ON dewasa(pengguna_id);

-- Penanda harian dewasa per pengguna (kekeran desa / pengecualian khusus)
CREATE TABLE IF NOT EXISTS penanda_dewasa (
  tanggal     TEXT NOT NULL,
  dewasa_id   INTEGER NOT NULL REFERENCES dewasa(id) ON DELETE CASCADE,
  pengguna_id INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  sifat       INTEGER NOT NULL,             -- 0 Ayu, 1 Ala, 2 Ayu & Ala, 3 Netral, 4 Tidak Berlaku
  oleh        TEXT NOT NULL DEFAULT '',
  diubah      TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tanggal, dewasa_id, pengguna_id)
);
CREATE INDEX IF NOT EXISTS idx_penanda_dewasa_tgl ON penanda_dewasa(tanggal);

-- Koreksi Sasih / Penanggal hasil rapat peranda (menimpa perhitungan)
CREATE TABLE IF NOT EXISTS koreksi_sasih (
  tanggal   TEXT PRIMARY KEY,               -- YYYY-MM-DD
  tp        TEXT,                           -- mis. 'Penanggal 12'
  sasih     TEXT,                           -- mis. '4' atau 'M.11'
  alasan    TEXT NOT NULL DEFAULT '',
  oleh      TEXT NOT NULL DEFAULT '',
  diubah    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Penilaian Ayu/Ala untuk Ngaben & Pawiwahan
CREATE TABLE IF NOT EXISTS penilaian (
  tanggal  TEXT NOT NULL,
  jenis    TEXT NOT NULL,                   -- 'ngaben' | 'pawiwahan'
  sisi     TEXT NOT NULL,                   -- 'ayu' | 'ala'
  taraf    INTEGER NOT NULL DEFAULT 0,      -- 0 kosong, 1 Hitam .. 4 Biru
  teks     TEXT NOT NULL DEFAULT '',
  oleh     TEXT NOT NULL DEFAULT '',
  diubah   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tanggal, jenis, sisi)
);

-- Catatan bebas per tanggal
CREATE TABLE IF NOT EXISTS catatan (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal  TEXT NOT NULL,
  isi      TEXT NOT NULL,
  oleh     TEXT NOT NULL DEFAULT '',
  dibuat   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_catatan_tgl ON catatan(tanggal);

-- Pengguna & sesi
CREATE TABLE IF NOT EXISTS pengguna (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nama          TEXT NOT NULL,
  nama_pengguna TEXT NOT NULL UNIQUE,
  sandi_hash    TEXT NOT NULL,
  garam         TEXT NOT NULL,
  peran         TEXT NOT NULL DEFAULT 'pembaca',  -- admin | peranda | pembaca
  aktif         INTEGER NOT NULL DEFAULT 1,
  wajib_ganti   INTEGER NOT NULL DEFAULT 0,
  dibuat        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sesi (
  token_hash  TEXT PRIMARY KEY,
  pengguna_id INTEGER NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  kedaluwarsa TEXT NOT NULL,
  alamat      TEXT NOT NULL DEFAULT '',
  dibuat      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sesi_pengguna ON sesi(pengguna_id);

-- Jejak seluruh perubahan
CREATE TABLE IF NOT EXISTS riwayat (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  tabel     TEXT NOT NULL,
  kunci     TEXT NOT NULL,
  aksi      TEXT NOT NULL,                  -- 'tambah' | 'ubah' | 'hapus'
  sebelum   TEXT,
  sesudah   TEXT,
  oleh      TEXT NOT NULL DEFAULT '',
  waktu     TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

export function catat(tabel, kunci, aksi, sebelum, sesudah, oleh = '') {
  db.prepare('INSERT INTO riwayat (tabel,kunci,aksi,sebelum,sesudah,oleh) VALUES (?,?,?,?,?,?)')
    .run(tabel, String(kunci), aksi,
      sebelum ? JSON.stringify(sebelum) : null,
      sesudah ? JSON.stringify(sesudah) : null, oleh);
}

/** Isi awal tabel dewasa dari berkas Excel — hanya sekali, saat masih kosong. */
export function seed() {
  const jml = db.prepare('SELECT COUNT(*) c FROM dewasa').get().c;
  if (jml > 0) return { diisi: 0, sudahAda: jml };
  const src = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'dewasa-seed.json'), 'utf8'));
  const ins = db.prepare(
    'INSERT INTO dewasa (id,nama,kondisi,keterangan,sifat,asal) VALUES (?,?,?,?,?,?)');
  db.exec('BEGIN');
  for (const d of src) ins.run(d.id, d.nama, d.kondisi || '', d.keterangan || '', d.sifat, 'excel');
  db.exec('COMMIT');
  return { diisi: src.length, sudahAda: 0 };
}

/** Peta hari-hari asli dari Excel: id dewasa -> Set indeks hari. */
export function muatMatriksExcel() {
  const src = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'dewasa-seed.json'), 'utf8'));
  const peta = new Map();
  for (const d of src) peta.set(d.id, new Set(d.hariExcel));
  return peta;
}
