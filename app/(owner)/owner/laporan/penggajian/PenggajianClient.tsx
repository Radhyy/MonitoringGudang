"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Packing, Produk, User } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const [tahun, bulan] = bulanFilter.split("-").map(Number);
    const namaBulan = new Date(tahun, bulan - 1).toLocaleString('id-ID', { month: 'long' }).toUpperCase();
    
    // Prepare Data
    const data: any[] = [];
    let grandTotal = 0;
    
    // Filter and map employees who have salary this month
    const employeesWithSalary = karyawanList
      .map(k => ({ ...k, rekap: getRekap(k) }))
      .filter(k => k.rekap.totalGaji > 0);

    employeesWithSalary.forEach((k, index) => {
      grandTotal += k.rekap.totalGaji;
      data.push([
        index + 1,
        k.name,
        k.rekap.totalGaji.toLocaleString("id-ID"),
        index + 1 // For signature column
      ]);
    });

    // Header Text
    doc.setFontSize(14);
    doc.text("DAFTAR GAJI PACKING", 15, 15);
    doc.setFontSize(10);
    doc.text(`PERIODE : ${namaBulan} ${tahun}`, 15, 22);
    doc.text(`TOTAL : Rp. ${grandTotal.toLocaleString("id-ID")}`, 140, 22);

    // Table
    autoTable(doc, {
      startY: 25,
      head: [["NO", "NAMA", "JUMLAH GAJI", "TANDA TANGAN"]],
      body: data,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { cellWidth: 70 },
        2: { halign: "right", cellWidth: 50 },
        3: { cellWidth: 50 }
      },
      didDrawCell: (data) => {
        // Customize Signature column
        if (data.section === "body" && data.column.index === 3) {
          // Keep it empty but maybe add some dots or just leave the number at the top left/right based on odd/even
          // We can let the autoTable print the number since we passed it in the data array
          // To make it look like a signature list, odd numbers on left, even on right
          const cell = data.cell;
          // Clear the text drawn by default
          doc.setFillColor(255, 255, 255);
          doc.rect(cell.x + 0.5, cell.y + 0.5, cell.width - 1, cell.height - 1, "F");
          
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          const rawRow = data.row.raw as any[];
          const num = Number(rawRow[3]);
          if (num % 2 !== 0) {
            doc.text(`${num}.`, cell.x + 2, cell.y + 4);
          } else {
            doc.text(`${num}.`, cell.x + cell.width / 2, cell.y + 10);
          }
        }
      }
    });

    doc.save(`Daftar-Gaji-Packing-${namaBulan}-${tahun}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Rekap Penggajian Karyawan"
          description="Lihat total upah packing masing-masing karyawan per bulan."
        />
        <div className="flex gap-3">
          <input
            type="month"
            value={bulanFilter}
            onChange={(e) => setBulanFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
          />
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
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
