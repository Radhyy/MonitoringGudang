import { prisma } from "@/lib/prisma";
import KelolaProduкClient from "./KelolaProduкClient";

export const dynamic = "force-dynamic";

export default async function KelolaProduкPage() {
  const produkList = await prisma.produk.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <KelolaProduкClient produkList={produkList} />;
}
