# SITU HANURA (Sistem Informasi Terpadu)

SITU HANURA adalah aplikasi manajemen kantor berbasis web yang dirancang untuk efisiensi administrasi, korespondensi, dan pengelolaan data internal DPC HANURA Kota Tanjungpinang. Aplikasi ini mendukung sinkronisasi cloud secara realtime dan fitur keamanan "1 User 1 Perangkat".

## 🚀 Fitur Utama

- **Dashboard Terintegrasi**: Ringkasan data surat, kas, dan karyawan secara visual.
- **Surat Menyurat Cloud**: Pencatatan Surat Masuk dan Surat Keluar secara realtime di database Firebase.
- **Kas Office**: Ledger transaksi (Pemasukan & Pengeluaran) otomatis dengan perhitungan saldo.
- **Manajemen Karyawan**: Database SDM, pelacakan Kasbon, hingga sistem Slip Gaji.
- **Pustaka Digital**: Arsip metadata dokumen dan pencarian berkas yang efisien.
- **Keamanan Lapis Tinggi**: 
  - Login berbasis role (Admin, Petugas, Verifikator).
  - **1 User 1 Perangkat**: Mencegah akun yang sama login di dua tempat secara bersamaan.
- **Responsive Design**: Tampilan premium yang optimal di Laptop (Desktop) maupun Smartphone.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Database**: Firebase Realtime Database
- **Styling**: Vanilla CSS (Modern Design System)
- **Icons**: Lucide React
- **Icons**: Framer Motion (Mikro-animasi)

## 📦 Instalasi & Penggunaan

### 1. Clone Repositori
```bash
git clone https://github.com/username/situ-hanura.git
cd situ-hanura
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Firebase
- Copy file `.env.example` menjadi `.env`:
  ```bash
  cp .env.example .env
  ```
- Isi variabel di dalam `.env` dengan konfigurasi dari Firebase Console Anda (Project Settings > General > Your Apps).

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`.

## 🔒 Catatan Keamanan
Jangan pernah mengunggah file `.env` Anda ke repositori publik. Pastikan file tersebut sudah terdaftar di `.gitignore`.

## 📄 Lisensi
Distributed under the MIT License. See `LICENSE` for more information.

---
Dikembangkan dengan ❤️ untuk DPC HANURA Kota Tanjungpinang.
