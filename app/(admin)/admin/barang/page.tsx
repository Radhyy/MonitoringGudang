import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BarangClient from "./BarangClient";

export const dynamic = "force-dynamic";

export default async function KelolaBarangPage() {
  const barangList = await prisma.barang.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Master Data Barang" 
          description="Kelola daftar bahan baku dan barang yang ada di gudang." 
        />
        <Link 
          href="/admin/barang/tambah"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Barang
        </Link>
      </div>

      <BarangClient initialBarangList={barangList} />
    </div>
  );
}
