import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function BarangKeluarPage() {
  // Ambil data barang keluar beserta relasi barang
  const pengeluaranList = await prisma.barangKeluar.findMany({
    orderBy: {
      tanggal: "desc",
    },
    include: {
      barang: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laporan Barang Keluar" 
        description="Riwayat pengeluaran stok untuk keperluan packing atau lainnya." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari transaksi atau nama barang..." 
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
              Filter Bulan
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
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4 text-center">Jumlah Keluar</th>
                <th className="px-6 py-4">Tujuan / Digunakan Untuk</th>
                <th className="px-6 py-4">Keterangan Tambahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pengeluaranList.length > 0 ? (
                pengeluaranList.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(trx.tanggal), "dd MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {trx.barang.namaBarang}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">
                      <span className="text-red-600 mr-1">-</span>
                      {trx.jumlah} <span className="text-xs font-normal text-slate-500">{trx.barang.satuan}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {trx.tujuan || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {trx.keterangan || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p>Belum ada riwayat pengeluaran barang.</p>
                      <p className="text-xs mt-1 text-slate-400">Data ini otomatis terisi ketika bahan dipakai untuk Packing atau diretur.</p>
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
