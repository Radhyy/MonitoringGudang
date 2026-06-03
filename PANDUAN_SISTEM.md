# 📦 PANDUAN SISTEM MANAJEMEN GUDANG, PACKING, & PENGGAJIAN
> **Panduan ini dibuat untuk membantu Gemini AI membangun sistem secara bertahap dan konsisten. Telah di-update dengan Revisi 1 (Perubahan Role & Alur Karyawan/Penggajian).**

---

## 🧾 RINGKASAN PROYEK

**Nama Sistem:** Sistem Manajemen Gudang, Packing, & Penggajian  
**Framework:** Next.js 14 (App Router)  
**Bahasa:** TypeScript  
**Database:** PostgreSQL (Neon)  
**ORM:** Prisma  
**Auth:** NextAuth.js (JWT / Credentials Provider)  
**UI Library:** Tailwind CSS + shadcn/ui  
**Role User:** 3 role — `OWNER`, `ADMIN_GUDANG`, `KARYAWAN`

---

## 👥 ROLE & HAK AKSES

| Role | Akses Utama |
|---|---|
| `OWNER` | Dashboard, semua laporan, kelola user, export PDF/Excel. |
| `ADMIN_GUDANG` | Dashboard, Data Barang, Data Produk (Input harga jual & tarif packing), Supplier, Transaksi Barang Masuk & Keluar, **Input Packing (Pilih Karyawan)**, **Input Penjualan Produk**, **Laporan Gaji Mingguan & Rekap Packing**. |
| `KARYAWAN` | Dashboard (Lihat riwayat kerja & pendapatan gaji), Akses Data Supplier, Akses Data Bahan Baku, **Input Transaksi Barang Masuk (dari supplier)**. |

---

## 🗄️ STRUKTUR DATABASE (Prisma Schema)

```prisma
// prisma/schema.prisma

model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  password  String
  role      Role      @default(KARYAWAN)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  packing   Packing[] // Relasi ke pekerjaan packing yang dilakukan karyawan
}

enum Role {
  OWNER
  ADMIN_GUDANG
  KARYAWAN
}

model Barang {
  id           Int            @id @default(autoincrement())
  kodeBarang   String         @unique
  namaBarang   String
  satuan       String
  stok         Int            @default(0)
  stokMinimum  Int            @default(5)
  hargaSatuan  Decimal
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  barangMasuk  BarangMasuk[]
  barangKeluar BarangKeluar[]
  packingDetail PackingDetail[]
}

model Supplier {
  id           Int           @id @default(autoincrement())
  namaSupplier String
  kontak       String?
  alamat       String?
  email        String?
  createdAt    DateTime      @default(now())
  barangMasuk  BarangMasuk[]
}

model BarangMasuk {
  id          Int      @id @default(autoincrement())
  supplierId  Int
  barangId    Int
  jumlah      Int
  hargaSatuan Decimal
  totalHarga  Decimal
  tanggal     DateTime
  keterangan  String?
  userId      Int      // Bisa Karyawan atau Admin Gudang yang input
  createdAt   DateTime @default(now())
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  barang      Barang   @relation(fields: [barangId], references: [id])
}

model BarangKeluar {
  id         Int      @id @default(autoincrement())
  barangId   Int
  jumlah     Int
  tujuan     String?
  tanggal    DateTime
  keterangan String?
  userId     Int
  createdAt  DateTime @default(now())
  barang     Barang   @relation(fields: [barangId], references: [id])
}

model Produk {
  id           Int         @id @default(autoincrement())
  kodeProduk   String      @unique
  namaProduk   String
  deskripsi    String?
  hargaJual    Decimal     // Harga jual produk jadi
  tarifPacking Decimal     // Upah karyawan per pack (misal Rp250)
  createdAt    DateTime    @default(now())
  packing      Packing[]
  penjualan    Penjualan[]
}

model Packing {
  id              Int             @id @default(autoincrement())
  produkId        Int
  karyawanId      Int             // Karyawan yang mengerjakan
  jumlahProduksi  Int
  tarifPerPack    Decimal         // Snapshot tarif saat itu (mencegah data lama berubah jika tarif naik)
  totalGaji       Decimal         // jumlahProduksi * tarifPerPack
  tanggalPacking  DateTime
  catatan         String?
  userId          Int             // Admin yang menginput
  createdAt       DateTime        @default(now())
  produk          Produk          @relation(fields: [produkId], references: [id])
  karyawan        User            @relation(fields: [karyawanId], references: [id])
  detail          PackingDetail[]
}

model PackingDetail {
  id             Int     @id @default(autoincrement())
  packingId      Int
  barangId       Int
  jumlahTerpakai Int
  packing        Packing @relation(fields: [packingId], references: [id])
  barang         Barang  @relation(fields: [barangId], references: [id])
}

model Penjualan {
  id          Int      @id @default(autoincrement())
  produkId    Int
  jumlah      Int
  hargaSatuan Decimal  // Harga jual per item saat transaksi
  totalHarga  Decimal
  pembeli     String?
  tanggal     DateTime
  keterangan  String?
  userId      Int
  createdAt   DateTime @default(now())
  produk      Produk   @relation(fields: [produkId], references: [id])
}

model Pengeluaran {
  id          Int      @id @default(autoincrement())
  keterangan  String
  jumlah      Decimal
  kategori    String?
  tanggal     DateTime
  userId      Int
  createdAt   DateTime @default(now())
}
```

---

## 🗺️ STRUKTUR ROUTE / HALAMAN

```
app/
├── (auth)/
│   └── login/page.tsx
│
├── (owner)/
│   └── owner/
│       ├── dashboard/page.tsx
│       ├── laporan/
│       │   ├── stok/page.tsx
│       │   ├── pembelian/page.tsx
│       │   ├── penjualan/page.tsx
│       │   ├── penggajian/page.tsx
│       │   └── laba-rugi/page.tsx
│       └── kelola-user/page.tsx
│
├── (admin)/
│   └── admin/
│       ├── dashboard/page.tsx
│       ├── barang/page.tsx
│       ├── produk/page.tsx             → kelola produk (harga jual & tarif)
│       ├── supplier/page.tsx
│       ├── barang-masuk/page.tsx
│       ├── barang-keluar/page.tsx
│       ├── packing/                    → riwayat packing
│       │   └── tambah/page.tsx         → Admin input packing & pilih Karyawan
│       ├── penjualan/page.tsx          → Admin input penjualan produk
│       └── penggajian/page.tsx         → Rekap gaji mingguan (cetak slip)
│
└── (karyawan)/
    └── karyawan/
        ├── dashboard/page.tsx          → Lihat hasil kerja & pendapatan sendiri
        ├── supplier/page.tsx           → Akses data supplier
        ├── barang/page.tsx             → Akses data barang baku
        └── barang-masuk/
            └── tambah/page.tsx         → Karyawan input barang masuk
```

---

## ⚙️ LOGIKA BISNIS PENGGAJIAN & PENJUALAN

### 1. Perhitungan Gaji & Input Packing (Oleh Admin)
Saat Admin menginput Packing:
- Memilih `Karyawan` yang mengerjakan.
- Memasukkan `jumlahProduksi`.
- Sistem menarik `tarifPacking` dari tabel `Produk`.
- Sistem menyimpan ke tabel `Packing` dengan `totalGaji` = `jumlahProduksi * tarifPacking`.

### 2. Rekap Hasil Packing & Penggajian Mingguan (Oleh Admin)
- Admin punya halaman **Penggajian** (`/admin/penggajian`).
- Halaman ini merekap total packing dan total gaji **per Karyawan** dalam seminggu.
- Terdapat tombol cetak (Export) Daftar Gaji.

### 3. Penjualan Produk (Oleh Admin)
- Admin bisa melakukan transaksi Penjualan.
- Tabel yang digunakan adalah `Penjualan`.
- Penjualan akan menyumbang pendapatan di Laporan Laba/Rugi.
