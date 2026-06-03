import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const { barangId, jumlah, tujuan, tanggal, keterangan } = body;

    if (!barangId || !jumlah || !tanggal) {
      return NextResponse.json({ message: "Data wajib tidak lengkap" }, { status: 400 });
    }

    const jumlahNum = Number(jumlah);

    // Gunakan Prisma Transaction: 
    // 1. Cek stok cukup atau tidak
    // 2. Buat record BarangKeluar
    // 3. Kurangi stok di tabel Barang
    const result = await prisma.$transaction(async (tx) => {
      // Cek stok
      const barang = await tx.barang.findUnique({
        where: { id: Number(barangId) },
      });

      if (!barang) {
        throw new Error("Barang tidak ditemukan");
      }

      if (barang.stok < jumlahNum) {
        throw new Error(`Stok tidak cukup! Stok saat ini hanya ${barang.stok} ${barang.satuan}`);
      }

      const barangKeluar = await tx.barangKeluar.create({
        data: {
          barangId: Number(barangId),
          jumlah: jumlahNum,
          tujuan: tujuan || null,
          tanggal: new Date(tanggal),
          keterangan: keterangan || null,
          userId: session?.user?.id ? Number(session.user.id) : 1,
        },
      });

      // Otomatis kurangi stok
      await tx.barang.update({
        where: { id: Number(barangId) },
        data: { stok: { decrement: jumlahNum } },
      });

      return barangKeluar;
    });

    return NextResponse.json(
      { message: "Transaksi Barang Keluar berhasil dicatat, stok berkurang!", data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating barang keluar:", error);
    return NextResponse.json({ message: error.message || "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
