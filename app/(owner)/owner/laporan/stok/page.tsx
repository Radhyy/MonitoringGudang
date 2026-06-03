import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Server component
export default async function LaporanStok() {
  // Ambil semua data barang dari database
  const barangList = await prisma.barang.findMany({
    orderBy: {
      namaBarang: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laporan Stok Bahan" 
        description="Ringkasan data master bahan dan persediaan saat ini." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari nama atau kode barang..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </button>
            <button className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kode Barang</th>
                <th className="px-6 py-4">Nama Bahan</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4 text-right">Harga (Rp)</th>
                <th className="px-6 py-4 text-center">Stok Minimal</th>
                <th className="px-6 py-4 text-center">Stok Saat Ini</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {barangList.length > 0 ? (
                barangList.map((barang) => {
                  const isKritis = barang.stok <= barang.stokMinimum;
                  return (
                    <tr key={barang.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{barang.kodeBarang}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{barang.namaBarang}</td>
                      <td className="px-6 py-4">{barang.satuan}</td>
                      <td className="px-6 py-4 text-right">
                        {Number(barang.hargaSatuan).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">{barang.stokMinimum}</td>
                      <td className={`px-6 py-4 text-center font-bold ${isKritis ? 'text-red-600' : 'text-slate-800'}`}>
                        {barang.stok}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isKritis ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Stok Kritis
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Belum ada data barang. Hubungi Admin Gudang untuk menambahkan data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>Menampilkan <span className="font-medium text-slate-800">{barangList.length}</span> data barang</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Sebelumnnya</button>
            <button className="px-3 py-1 rounded bg-blue-600 text-white border border-blue-600">1</button>
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
