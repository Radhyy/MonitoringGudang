import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const { supplierId, barangId, jumlah, hargaSatuan, tanggal, keterangan } = body;

    if (!supplierId || !barangId || !jumlah || !hargaSatuan || !tanggal) {
      return NextResponse.json({ message: "Data wajib tidak lengkap" }, { status: 400 });
    }

    const jumlahNum = Number(jumlah);
    const hargaSatuanNum = Number(hargaSatuan);
    const totalHarga = jumlahNum * hargaSatuanNum;

    // Gunakan Prisma Transaction: 
    // 1. Buat record BarangMasuk
    // 2. Tambah stok di tabel Barang
    const result = await prisma.$transaction(async (tx) => {
      
      const barangMasuk = await tx.barangMasuk.create({
        data: {
          supplierId: Number(supplierId),
          barangId: Number(barangId),
          jumlah: jumlahNum,
          hargaSatuan: hargaSatuanNum,
          totalHarga,
          tanggal: new Date(tanggal),
          keterangan: keterangan || null,
          // Fallback ke user ID 1 (Admin) jika session blm ada di context API ini
          userId: session?.user?.id ? Number(session.user.id) : 1, 
        },
      });

      // Otomatis tambah stok
      await tx.barang.update({
        where: { id: Number(barangId) },
        data: { stok: { increment: jumlahNum } },
      });

      return barangMasuk;
    });

    return NextResponse.json(
      { message: "Transaksi Barang Masuk berhasil dicatat, stok bertambah!", data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating barang masuk:", error);
    return NextResponse.json({ message: error.message || "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
