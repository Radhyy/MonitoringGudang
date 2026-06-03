import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kodeBarang, namaBarang, satuan, stokMinimum, hargaSatuan } = body;

    // Validasi
    if (!kodeBarang || !namaBarang || !satuan || hargaSatuan === undefined) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Cek apakah kode barang sudah ada
    const existingBarang = await prisma.barang.findUnique({
      where: { kodeBarang },
    });

    if (existingBarang) {
      return NextResponse.json({ message: "Kode Barang sudah terdaftar" }, { status: 400 });
    }

    // Buat barang baru
    const newBarang = await prisma.barang.create({
      data: {
        kodeBarang,
        namaBarang,
        satuan,
        stokMinimum: Number(stokMinimum) || 5,
        hargaSatuan: Number(hargaSatuan),
        stok: 0, // Stok awal selalu 0, harus ditambah via Barang Masuk
      },
    });

    return NextResponse.json(
      { message: "Data barang berhasil ditambahkan", barang: newBarang },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating barang:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
