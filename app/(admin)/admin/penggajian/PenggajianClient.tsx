"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Packing, Produk, User } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type PackingWithRelations = Packing & { produk: Produk };
type KaryawanWithPacking = User & { packingSebagaiKaryawan: PackingWithRelations[] };

interface Props {
  karyawanList: KaryawanWithPacking[];
}

export default function PenggajianClient({ karyawanList }: Props) {
  const [bulanFilter, setBulanFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const getRekap = (karyawan: KaryawanWithPacking) => {
    const [tahun, bulan] = bulanFilter.split("-").map(Number);
    const filtered = karyawan.packingSebagaiKaryawan.filter((p) => {
      const tgl = new Date(p.tanggalPacking);
      return tgl.getFullYear() === tahun && tgl.getMonth() + 1 === bulan;
    });

    const totalPack = filtered.reduce((sum, p) => sum + p.jumlahProduksi, 0);
    const totalGaji = filtered.reduce((sum, p) => sum + Number(p.totalGaji), 0);
    const jumlahSesi = filtered.length;

    return { filtered, totalPack, totalGaji, jumlahSesi };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Rekap Penggajian Karyawan"
          description="Lihat total upah packing masing-masing karyawan per bulan."
        />
        <input
          type="month"
          value={bulanFilter}
          onChange={(e) => setBulanFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {karyawanList.map((k) => {
          const { totalPack, totalGaji, jumlahSesi } = getRekap(k);
          return (
            <div key={k.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {k.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{k.name}</p>
                  <p className="text-xs text-slate-400">{k.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                <div>
                  <p className="text-lg font-bold text-slate-800">{jumlahSesi}</p>
                  <p className="text-xs text-slate-400">Sesi</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{totalPack}</p>
                  <p className="text-xs text-slate-400">Total Pack</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-600">Rp {totalGaji.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-slate-400">Total Gaji</p>
                </div>
              </div>
            </div>
          );
        })}
        {karyawanList.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            Belum ada karyawan terdaftar. Tambahkan melalui menu Kelola User.
          </div>
        )}
      </div>

      {/* Detail Table per Karyawan */}
      {karyawanList.map((k) => {
        const { filtered, totalPack, totalGaji } = getRekap(k);
        if (filtered.length === 0) return null;

        return (
          <div key={k.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{k.name}</h3>
                <p className="text-xs text-slate-400">Rincian packing bulan {bulanFilter}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Upah</p>
                <p className="text-lg font-bold text-green-600">Rp {totalGaji.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Produk</th>
                    <th className="px-6 py-3">Jumlah Pack</th>
                    <th className="px-6 py-3">Tarif/Pack</th>
                    <th className="px-6 py-3">Upah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 whitespace-nowrap">
                        {format(new Date(p.tanggalPacking), "dd MMM yyyy", { locale: id })}
                      </td>
                      <td className="px-6 py-3">{p.produk.namaProduk}</td>
                      <td className="px-6 py-3 font-bold">{p.jumlahProduksi}</td>
                      <td className="px-6 py-3 text-slate-500">Rp {Number(p.tarifPerPack).toLocaleString("id-ID")}</td>
                      <td className="px-6 py-3 font-medium text-green-600">
                        Rp {Number(p.totalGaji).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={2} className="px-6 py-3 text-slate-700">Total Bulan Ini</td>
                    <td className="px-6 py-3 text-slate-800">{totalPack} Pack</td>
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3 text-green-700">Rp {totalGaji.toLocaleString("id-ID")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
