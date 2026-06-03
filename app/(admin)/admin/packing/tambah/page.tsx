import PageHeader from "@/components/layout/PageHeader";
import PackingForm from "@/components/forms/PackingForm";
import { prisma } from "@/lib/prisma";

export default async function TambahPackingAdminPage() {
  const produkList = await prisma.produk.findMany({
    orderBy: { namaProduk: "asc" }
  });

  const barangList = await prisma.barang.findMany({
    orderBy: { namaBarang: "asc" }
  });

  const karyawanList = await prisma.user.findMany({
    where: { role: "KARYAWAN" },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Input Data Packing" 
        description="Catat hasil packing karyawan dan bahan baku yang digunakan." 
      />
      <PackingForm 
        produkList={produkList} 
        barangList={barangList} 
        karyawanList={karyawanList} 
      />
    </div>
  );
}
