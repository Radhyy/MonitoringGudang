import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BarangKeluarForm from "@/components/forms/BarangKeluarForm";

export default async function TambahBarangKeluarPage() {
  // Fetch barang list with current stock
  const barangList = await prisma.barang.findMany({
    orderBy: { namaBarang: "asc" },
    where: { stok: { gt: 0 } }, // Hanya tampilkan yang stoknya > 0
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/barang-keluar"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <PageHeader
          title="Input Barang Keluar"
          description="Catat pengeluaran stok dari gudang. Sistem akan otomatis mengurangi jumlah stok." 
        />
      </div>

      {barangList.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-sm text-amber-700">
          <svg className="w-8 h-8 mx-auto mb-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium mb-1">Tidak ada barang yang bisa dikeluarkan</p>
          <p className="text-xs text-amber-600">Semua barang saat ini memiliki stok 0. Input barang masuk terlebih dahulu.</p>
        </div>
      ) : (
        <BarangKeluarForm barangList={barangList} />
      )}
    </div>
  );
}
