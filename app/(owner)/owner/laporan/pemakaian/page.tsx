import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function PemakaianPackingPage() {
  // Ambil data sesi packing beserta produk dan detail bahan yang dipakai
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laporan Pemakaian Packing" 
        description="Riwayat produksi dan penggunaan bahan baku untuk setiap sesi packing." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari produk atau sesi packing..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Waktu
            </button>
            <button className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Produk Dihasilkan</th>
                <th className="px-6 py-4 text-center">Jumlah Produksi</th>
                <th className="px-6 py-4">Rincian Bahan Dipakai</th>
                <th className="px-6 py-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packingList.length > 0 ? (
                packingList.map((packing) => (
                  <tr key={packing.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(packing.tanggalPacking), "dd MMM yyyy, HH:mm", { locale: id })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {packing.produk.namaProduk}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        + {packing.jumlahProduksi} Pcs
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {packing.detail.length > 0 ? (
                        <ul className="space-y-1">
                          {packing.detail.map((d) => (
                            <li key={d.id} className="flex items-center text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
                              <span className="font-medium text-slate-700 mr-1">{d.jumlahTerpakai} {d.barang.satuan}</span> 
                              <span className="text-slate-500">{d.barang.namaBarang}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Tidak ada rincian bahan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {packing.catatan || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <p>Belum ada riwayat sesi packing.</p>
                      <p className="text-xs mt-1 text-slate-400">Data ini otomatis terisi ketika tim Packing menyelesaikan produksi.</p>
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
