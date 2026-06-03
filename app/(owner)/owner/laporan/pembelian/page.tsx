import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function PembelianMasukPage() {
  // Ambil data barang masuk beserta relasi barang dan supplier
  const pembelianList = await prisma.barangMasuk.findMany({
    orderBy: {
      tanggal: "desc",
    },
    include: {
      barang: true,
      supplier: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laporan Pembelian Masuk" 
        description="Riwayat penerimaan stok bahan dan barang masuk dari supplier." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari transaksi atau barang..." 
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
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-center">Jumlah</th>
                <th className="px-6 py-4 text-right">Harga Satuan</th>
                <th className="px-6 py-4 text-right">Total Harga</th>
                <th className="px-6 py-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pembelianList.length > 0 ? (
                pembelianList.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(trx.tanggal), "dd MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {trx.barang.namaBarang}
                    </td>
                    <td className="px-6 py-4">
                      {trx.supplier.namaSupplier}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">
                      {trx.jumlah} <span className="text-xs font-normal text-slate-500">{trx.barang.satuan}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      Rp {Number(trx.hargaSatuan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-800">
                      Rp {Number(trx.totalHarga).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      {trx.keterangan || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p>Belum ada riwayat pembelian / barang masuk.</p>
                      <p className="text-xs mt-1 text-slate-400">Data ini akan terisi ketika Admin Gudang melakukan input penerimaan barang.</p>
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
