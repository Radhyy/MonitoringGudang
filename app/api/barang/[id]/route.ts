import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const { kodeBarang, namaBarang, satuan, stokMinimum, hargaSatuan } = body;

    const existingBarang = await prisma.barang.findFirst({
      where: {
        kodeBarang,
        NOT: {
          id
        }
      }
    });

    if (existingBarang) {
      return NextResponse.json(
        { message: "Kode barang sudah digunakan oleh barang lain" },
        { status: 400 }
      );
    }

    const barang = await prisma.barang.update({
      where: { id },
      data: {
        kodeBarang,
        namaBarang,
        satuan,
        stokMinimum: Number(stokMinimum),
        hargaSatuan: Number(hargaSatuan),
      },
    });

    return NextResponse.json(barang);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    // Cek apakah barang dipakai di tabel lain
    const checkMasuk = await prisma.barangMasuk.findFirst({ where: { barangId: id } });
    const checkKeluar = await prisma.barangKeluar.findFirst({ where: { barangId: id } });
    const checkPacking = await prisma.packingDetail.findFirst({ where: { barangId: id } });

    if (checkMasuk || checkKeluar || checkPacking) {
      return NextResponse.json(
        { message: "Gagal menghapus! Barang ini sudah dipakai dalam transaksi atau sesi packing." },
        { status: 400 }
      );
    }

    await prisma.barang.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Barang berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
