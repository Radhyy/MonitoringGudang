"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    produkId: "",
    jumlahTerjual: "",
    tanggal: new Date().toISOString().slice(0, 16),
  });

  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);

  const handleProdukChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setFormData(prev => ({ ...prev, produkId: pId }));
    const prod = produkList.find(p => p.id.toString() === pId);
    setSelectedProduk(prod || null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShowForm(false);
      setFormData({
        produkId: "",
        jumlahTerjual: "",
        tanggal: new Date().toISOString().slice(0, 16),
      });
      setSelectedProduk(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hitung perkiraan pendapatan
  const perkiraanPendapatan = selectedProduk && formData.jumlahTerjual
    ? selectedProduk.hargaJual * Number(formData.jumlahTerjual)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Transaksi Penjualan" 
          description="Catat produk jadi yang terjual untuk dikurangi dari stok Gudang." 
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Input Penjualan
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
          <h3 className="font-bold text-slate-800 mb-5">Form Transaksi Penjualan</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tanggal Penjualan <span className="text-red-500">*</span></label>
              <input 
                type="datetime-local" 
                name="tanggal" 
                required 
                value={formData.tanggal} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pilih Produk (Berstok) <span className="text-red-500">*</span></label>
              <select 
                name="produkId" 
                required 
                value={formData.produkId} 
                onChange={handleProdukChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>-- Pilih Produk --</option>
                {produkList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.namaProduk} (Stok: {p.stok})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Jumlah Terjual (Pack) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="jumlahTerjual" 
                required 
                min="1"
                max={selectedProduk?.stok || undefined}
                value={formData.jumlahTerjual} 
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end pb-1">
               {selectedProduk && (
                 <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                   <p className="text-xs text-slate-500">Total Harga (Otomatis)</p>
                   <p className="text-lg font-bold text-blue-700">Rp {perkiraanPendapatan.toLocaleString("id-ID")}</p>
                 </div>
               )}
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors">
                Batal
              </button>
              <button type="submit" disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors min-w-[120px] flex items-center justify-center disabled:opacity-70">
                {loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Simpan Penjualan"}
              </button>
            </div>
          </form>
        </div>
      )}

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
