"use client";

import PageHeader from "@/components/layout/PageHeader";
import { Produk, Penjualan } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type PenjualanWithProduk = Penjualan & { produk: Produk };

interface Props {
  penjualanList: PenjualanWithProduk[];
  produkList: Produk[];
}

export default function PenjualanClient({ penjualanList, produkList }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Laporan Penjualan" 
          description="Riwayat produk jadi yang terjual." 
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Jumlah Terjual</th>
                <th className="px-6 py-4">Harga Satuan</th>
                <th className="px-6 py-4">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penjualanList.length > 0 ? (
                penjualanList.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(p.tanggal), "dd MMM yyyy, HH:mm", { locale: id })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{p.produk.namaProduk}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{p.jumlah} Pack</td>
                    <td className="px-6 py-4 text-slate-500">Rp {Number(p.produk.hargaJual).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">Rp {Number(p.totalHarga).toLocaleString("id-ID")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <p>Belum ada transaksi penjualan.</p>
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
