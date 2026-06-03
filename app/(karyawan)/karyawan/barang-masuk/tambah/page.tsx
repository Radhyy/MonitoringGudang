import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BarangMasukForm from "@/components/forms/BarangMasukForm";

export default async function TambahBarangMasukPage() {
  // Fetch master data to pass to client component form
  const [barangList, supplierList] = await Promise.all([
    prisma.barang.findMany({ orderBy: { namaBarang: "asc" } }),
    prisma.supplier.findMany({ orderBy: { namaSupplier: "asc" } })
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/karyawan/barang-masuk"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <PageHeader 
          title="Input Barang Masuk" 
          description="Catat penerimaan stok baru dan otomatis tambah jumlah stok di gudang." 
        />
      </div>

      <BarangMasukForm barangList={barangList} supplierList={supplierList} />
    </div>
  );
}
