import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kodeProduk, namaProduk, deskripsi, stok, hargaJual, tarifPacking } = body;

    if (!kodeProduk || !namaProduk) {
      return NextResponse.json({ message: "Kode dan Nama Produk wajib diisi" }, { status: 400 });
    }

    if (hargaJual === undefined || tarifPacking === undefined) {
      return NextResponse.json({ message: "Harga Jual dan Tarif Packing wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.produk.findUnique({ where: { kodeProduk } });
    if (existing) {
      return NextResponse.json({ message: "Kode Produk sudah digunakan" }, { status: 400 });
    }

    const produk = await prisma.produk.create({
      data: { 
        kodeProduk, 
        namaProduk, 
        deskripsi: deskripsi || null,
        stok: Number(stok) || 0,
        hargaJual: Number(hargaJual),
        tarifPacking: Number(tarifPacking)
      },
    });

    return NextResponse.json({ message: "Produk berhasil ditambahkan", produk }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
