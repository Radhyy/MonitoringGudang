import { prisma } from "@/lib/prisma";
import PenjualanClient from "./PenjualanClient";

export const dynamic = "force-dynamic";

export default async function PenjualanAdminPage() {
  const penjualanList = await prisma.penjualan.findMany({
    orderBy: { tanggal: "desc" },
    include: { produk: true }
  });

  const produkList = await prisma.produk.findMany({
    orderBy: { namaProduk: "asc" },
    where: { stok: { gt: 0 } } // Hanya produk yang ada stoknya yang bisa dijual
  });

  return <PenjualanClient penjualanList={penjualanList} produkList={produkList} />;
}
