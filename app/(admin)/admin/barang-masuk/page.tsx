import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function KelolaBarangMasukPage() {
  const transaksiList = await prisma.barangMasuk.findMany({
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Transaksi Barang Masuk" 
          description="Catat dan kelola penerimaan bahan baku dari supplier." 
        />
        <Link 
          href="/admin/barang-masuk/tambah"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Input Barang Masuk
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal Terima</th>
                <th className="px-6 py-4">Barang</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-center">Jumlah Masuk</th>
                <th className="px-6 py-4 text-right">Total Harga (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaksiList.length > 0 ? (
                transaksiList.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-700">
                        {format(new Date(trx.tanggal), "dd MMM yyyy", { locale: id })}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(trx.tanggal), "HH:mm", { locale: id })} WIB
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{trx.barang.namaBarang}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{trx.barang.kodeBarang}</div>
                    </td>
                    <td className="px-6 py-4">
                      {trx.supplier.namaSupplier}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-600">
                      +{trx.jumlah} <span className="text-xs font-normal text-slate-500">{trx.barang.satuan}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-800">
                      {Number(trx.totalHarga).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p>Belum ada transaksi penerimaan barang.</p>
                      <p className="text-xs mt-1 text-slate-400">Klik tombol di atas untuk mencatat penerimaan baru.</p>
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
