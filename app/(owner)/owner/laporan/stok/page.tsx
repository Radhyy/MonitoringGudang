import { prisma } from "@/lib/prisma";
import StokClient from "./StokClient";

export default async function LaporanStok() {
  const barangList = await prisma.barang.findMany({
    orderBy: {
      namaBarang: "asc",
    },
  });

  return <StokClient barangList={barangList} />;
}
