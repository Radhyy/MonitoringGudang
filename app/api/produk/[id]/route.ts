import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params;
    const id = Number(idString);
    const body = await req.json();

    const { kodeProduk, namaProduk, deskripsi, stok, hargaJual, tarifPacking } = body;

    const existingProduk = await prisma.produk.findFirst({
      where: {
        kodeProduk,
        NOT: {
          id
        }
      }
    });

    if (existingProduk) {
      return NextResponse.json(
        { message: "Kode produk sudah digunakan oleh produk lain" },
        { status: 400 }
      );
    }

    const produk = await prisma.produk.update({
      where: { id },
      data: {
        kodeProduk,
        namaProduk,
        deskripsi,
        stok: Number(stok),
        hargaJual: Number(hargaJual),
        tarifPacking: Number(tarifPacking),
      },
    });

    return NextResponse.json(produk);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params;
    const id = Number(idString);

    // Cek apakah produk dipakai di tabel lain
    const checkPacking = await prisma.packing.findFirst({ where: { produkId: id } });
    const checkPenjualan = await prisma.penjualan.findFirst({ where: { produkId: id } });

    if (checkPacking || checkPenjualan) {
      return NextResponse.json(
        { message: "Gagal menghapus! Produk ini sudah dipakai dalam transaksi penjualan atau sesi packing." },
        { status: 400 }
      );
    }

    await prisma.produk.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
