import { prisma } from "@/lib/prisma";
import PembelianClient from "./PembelianClient";

export default async function PembelianMasukPage() {
  const pembelianList = await prisma.barangMasuk.findMany({
    orderBy: {
      tanggal: "desc",
    },
    include: {
      barang: true,
      supplier: true,
    },
  });

  return <PembelianClient pembelianList={pembelianList} />;
}
