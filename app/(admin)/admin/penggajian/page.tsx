import { prisma } from "@/lib/prisma";
import PenggajianClient from "./PenggajianClient";

export default async function PenggajianAdminPage() {
  // Ambil semua karyawan beserta rekap total gaji mereka
  const karyawanList = await prisma.user.findMany({
    where: { role: "KARYAWAN" },
    include: {
      packingSebagaiKaryawan: {
        include: { produk: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return <PenggajianClient karyawanList={karyawanList} />;
}
