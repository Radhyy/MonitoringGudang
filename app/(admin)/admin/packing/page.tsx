import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function RiwayatPackingAdminPage() {
  const packingList = await prisma.packing.findMany({
    orderBy: { tanggalPacking: "desc" },
    include: {
      produk: true,
      karyawan: true,
      detail: {
        include: { barang: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Riwayat Input Packing" 
          description="Daftar seluruh produksi packing yang telah diinput." 
        />
        <Link
          href="/admin/packing/tambah"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Input Data Packing
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Karyawan</th>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Hasil Pack</th>
                <th className="px-6 py-4">Total Gaji</th>
                <th className="px-6 py-4">Bahan Dipakai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packingList.length > 0 ? (
                packingList.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(p.tanggalPacking), "dd MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {p.karyawan.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">{p.produk.namaProduk}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {p.jumlahProduksi} Pack
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium whitespace-nowrap">
                      Rp {Number(p.totalGaji).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">
                      {p.detail.map(d => `${d.jumlahTerpakai} ${d.barang.satuan} ${d.barang.namaBarang}`).join(", ")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p>Belum ada riwayat packing.</p>
                      <Link href="/admin/packing/tambah" className="text-blue-600 hover:underline mt-2">Buat input packing pertama</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
