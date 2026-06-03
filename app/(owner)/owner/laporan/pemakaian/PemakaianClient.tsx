"use client";

import PageHeader from "@/components/layout/PageHeader";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Packing, Produk, PackingDetail, Barang } from "@prisma/client";

type DetailWithBarang = PackingDetail & { barang: Barang };
type PackingWithRelations = Packing & { produk: Produk; detail: DetailWithBarang[] };

interface Props {
  packingList: PackingWithRelations[];
}

export default function PemakaianClient({ packingList }: Props) {
  const handleExportExcel = () => {
    const data = packingList.map((packing, i) => {
      const bahan = packing.detail.map(d => `${d.jumlahTerpakai} ${d.barang.satuan} ${d.barang.namaBarang}`).join(", ");
      return {
        "No": i + 1,
        "Tanggal": format(new Date(packing.tanggalPacking), "dd MMM yyyy, HH:mm", { locale: id }),
        "Produk Dihasilkan": packing.produk.namaProduk,
        "Jumlah Produksi": packing.jumlahProduksi,
        "Rincian Bahan Dipakai": bahan,
        "Catatan": packing.catatan || "-"
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Rapikan lebar kolom
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 20 }, // Tanggal
      { wch: 30 }, // Produk Dihasilkan
      { wch: 15 }, // Jumlah Produksi
      { wch: 50 }, // Rincian Bahan Dipakai
      { wch: 30 }  // Catatan
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pemakaian Packing");
    XLSX.writeFile(wb, `Laporan-Pemakaian-Packing-${new Date().getTime()}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(14);
    doc.text("LAPORAN PEMAKAIAN PACKING", 15, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 15, 22);

    // Data
    const data = packingList.map((packing, i) => {
      const bahan = packing.detail.map(d => `${d.jumlahTerpakai} ${d.barang.satuan} ${d.barang.namaBarang}`).join("\n");
      return [
        i + 1,
        format(new Date(packing.tanggalPacking), "dd MMM yyyy", { locale: id }),
        packing.produk.namaProduk,
        `${packing.jumlahProduksi} Pcs`,
        bahan || "-",
        packing.catatan || "-"
      ];
    });

    // Table
    autoTable(doc, {
      startY: 25,
      head: [["NO", "TANGGAL", "PRODUK", "PRODUKSI", "BAHAN DIPAKAI", "CATATAN"]],
      body: data,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    doc.save(`Laporan-Pemakaian-Packing-${new Date().getTime()}.pdf`);
  };

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
            <button onClick={handleExportPDF} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </button>
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
                      <p>Belum ada riwayat sesi packing.</p>
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
