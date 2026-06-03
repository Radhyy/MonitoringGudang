import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const { produkId, karyawanId, jumlahProduksi, tanggalPacking, catatan, bahan } = body;

    if (!produkId || !karyawanId || !jumlahProduksi || !tanggalPacking) {
      return NextResponse.json({ message: "Data utama tidak lengkap (Produk, Karyawan, Jumlah, Tanggal)" }, { status: 400 });
    }

    if (!bahan || !Array.isArray(bahan) || bahan.length === 0) {
      return NextResponse.json({ message: "Minimal 1 bahan harus diinput" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Dapatkan tarif packing dari produk
      const produk = await tx.produk.findUnique({ where: { id: Number(produkId) } });
      if (!produk) throw new Error("Produk tidak ditemukan");

      const tarifPerPack = Number(produk.tarifPacking) || 0;
      const totalGaji = Number(jumlahProduksi) * tarifPerPack;

      // Buat record sesi Packing utama
      const packingSesi = await tx.packing.create({
        data: {
          produkId: Number(produkId),
          karyawanId: Number(karyawanId),
          jumlahProduksi: Number(jumlahProduksi),
          tarifPerPack: tarifPerPack,
          totalGaji: totalGaji,
          tanggalPacking: new Date(tanggalPacking),
          catatan: catatan || null,
          userId: session?.user?.id ? Number(session.user.id) : 1,
        },
      });

      // Loop setiap bahan: cek stok, buat detail, kurangi stok
      for (const item of bahan) {
        const barang = await tx.barang.findUnique({
          where: { id: Number(item.barangId) },
        });

        if (!barang) {
          throw new Error(`Barang dengan ID ${item.barangId} tidak ditemukan`);
        }

        if (barang.stok < Number(item.jumlahTerpakai)) {
          throw new Error(
            `Stok "${barang.namaBarang}" tidak cukup! Tersisa ${barang.stok} ${barang.satuan}, dibutuhkan ${item.jumlahTerpakai}.`
          );
        }

        // Buat PackingDetail
        await tx.packingDetail.create({
          data: {
            packingId: packingSesi.id,
            barangId: Number(item.barangId),
            jumlahTerpakai: Number(item.jumlahTerpakai),
          },
        });

        // Kurangi stok otomatis
        await tx.barang.update({
          where: { id: Number(item.barangId) },
          data: { stok: { decrement: Number(item.jumlahTerpakai) } },
        });
      }

      // Tambahkan stok Produk (Hasil dari packing)
      await tx.produk.update({
        where: { id: Number(produkId) },
        data: { stok: { increment: Number(jumlahProduksi) } },
      });

      return packingSesi;
    });

    return NextResponse.json(
      { message: "Sesi packing berhasil dicatat dan stok bahan telah dikurangi!", data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating packing:", error);
    return NextResponse.json({ message: error.message || "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
