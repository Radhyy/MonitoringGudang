"use client";

import PageHeader from "@/components/layout/PageHeader";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from "xlsx";
import { BarangMasuk, Barang, Supplier } from "@prisma/client";

type PembelianWithRelations = BarangMasuk & { barang: Barang; supplier: Supplier };

interface Props {
  pembelianList: PembelianWithRelations[];
}

export default function PembelianClient({ pembelianList }: Props) {
  const handleExportExcel = () => {
    const data = pembelianList.map((trx, i) => ({
      "No": i + 1,
      "Tanggal": format(new Date(trx.tanggal), "dd MMM yyyy", { locale: id }),
      "Nama Barang": trx.barang.namaBarang,
      "Supplier": trx.supplier.namaSupplier,
      "Jumlah": `${trx.jumlah} ${trx.barang.satuan}`,
      "Harga Satuan (Rp)": Number(trx.hargaSatuan),
      "Total Harga (Rp)": Number(trx.totalHarga),
      "Keterangan": trx.keterangan || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Rapikan lebar kolom
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 20 }, // Tanggal
      { wch: 30 }, // Nama Barang
      { wch: 30 }, // Supplier
      { wch: 15 }, // Jumlah
      { wch: 20 }, // Harga Satuan
      { wch: 20 }, // Total Harga
      { wch: 30 }  // Keterangan
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pembelian Masuk");
    XLSX.writeFile(wb, `Laporan-Pembelian-Masuk-${new Date().getTime()}.xlsx`);
  };

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
            <button onClick={handleExportExcel} className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2">
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
                      <p>Belum ada riwayat pembelian / barang masuk.</p>
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
