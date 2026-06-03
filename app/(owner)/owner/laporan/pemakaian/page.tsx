import { prisma } from "@/lib/prisma";
import PemakaianClient from "./PemakaianClient";

export default async function PemakaianPackingPage() {
  const packingList = await prisma.packing.findMany({
    orderBy: {
      tanggalPacking: "desc",
    },
    include: {
      produk: true,
      detail: {
        include: {
          barang: true,
        },
      },
    },
  });

  return <PemakaianClient packingList={packingList} />;
}
