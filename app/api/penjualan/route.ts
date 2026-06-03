import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const { produkId, jumlahTerjual, tanggal } = body;

    if (!produkId || !jumlahTerjual || !tanggal) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Ambil data produk termasuk harga
      const produk = await tx.produk.findUnique({ where: { id: Number(produkId) } });
      if (!produk) throw new Error("Produk tidak ditemukan");

      if (produk.stok < Number(jumlahTerjual)) {
        throw new Error(`Stok "${produk.namaProduk}" tidak cukup! Tersisa ${produk.stok}, ingin jual ${jumlahTerjual}.`);
      }

      const totalHarga = produk.hargaJual * Number(jumlahTerjual);

      // Buat record penjualan
      const penjualan = await tx.penjualan.create({
        data: {
          produkId: Number(produkId),
          jumlah: Number(jumlahTerjual),
          totalHarga: totalHarga,
          tanggal: new Date(tanggal),
          userId: session?.user?.id ? Number(session.user.id) : 1,
        },
      });

      // Kurangi stok produk
      await tx.produk.update({
        where: { id: Number(produkId) },
        data: { stok: { decrement: Number(jumlahTerjual) } },
      });

      return penjualan;
    });

    return NextResponse.json(
      { message: "Penjualan berhasil dicatat!", data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating penjualan:", error);
    return NextResponse.json({ message: error.message || "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
