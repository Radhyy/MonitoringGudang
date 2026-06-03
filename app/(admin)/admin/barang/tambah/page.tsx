"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

export default function TambahBarangPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    satuan: "Pcs",
    hargaSatuan: "",
    stokMinimum: "5",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menambahkan barang");
      }

      router.push("/admin/barang");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/barang"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <PageHeader 
          title="Tambah Master Barang" 
          description="Daftarkan barang baru ke dalam sistem inventaris." 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kode Barang</label>
              <input 
                type="text" 
                name="kodeBarang"
                required
                value={formData.kodeBarang}
                onChange={handleChange}
                placeholder="Misal: BRG-001"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Barang / Bahan Baku</label>
              <input 
                type="text" 
                name="namaBarang"
                required
                value={formData.namaBarang}
                onChange={handleChange}
                placeholder="Misal: Kardus Packing Besar"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Satuan (UoM)</label>
              <select 
                name="satuan"
                value={formData.satuan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="Pcs">Pcs</option>
                <option value="Box">Box</option>
                <option value="Kg">Kg</option>
                <option value="Meter">Meter</option>
                <option value="Roll">Roll</option>
                <option value="Rim">Rim</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Batas Stok Minimum</label>
              <input 
                type="number" 
                name="stokMinimum"
                required
                min="0"
                value={formData.stokMinimum}
                onChange={handleChange}
                placeholder="Misal: 5"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Harga Beli Satuan (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                <input 
                  type="number" 
                  name="hargaSatuan"
                  required
                  min="0"
                  value={formData.hargaSatuan}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link 
              href="/admin/barang"
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-colors"
            >
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Simpan Barang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
