"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Barang } from "@prisma/client";

interface Props {
  barangList: Barang[];
}

export default function BarangKeluarForm({ barangList }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);

  const [formData, setFormData] = useState({
    barangId: "",
    jumlah: "",
    tujuan: "",
    tanggal: new Date().toISOString().slice(0, 16),
    keterangan: "",
  });

  const handleBarangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const barang = barangList.find(b => b.id.toString() === selectedId) || null;
    setSelectedBarang(barang);
    setFormData(prev => ({ ...prev, barangId: selectedId }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/barang-keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mencatat transaksi");
      }

      router.push("/admin/barang-keluar");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const jumlahNum = Number(formData.jumlah) || 0;
  const stokCukup = selectedBarang ? selectedBarang.stok >= jumlahNum : true;

  return (
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
            <label className="text-sm font-medium text-slate-700">Tanggal & Waktu Keluar <span className="text-red-500">*</span></label>
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
            <label className="text-sm font-medium text-slate-700">Tujuan / Digunakan Untuk</label>
            <input
              type="text"
              name="tujuan"
              value={formData.tujuan}
              onChange={handleChange}
              placeholder="Misal: Produksi, Retur, Rusak..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-700">Pilih Barang yang Akan Dikeluarkan <span className="text-red-500">*</span></label>
            <select
              name="barangId"
              required
              value={formData.barangId}
              onChange={handleBarangChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              <option value="" disabled>-- Pilih Barang --</option>
              {barangList.map(b => (
                <option key={b.id} value={b.id}>
                  [{b.kodeBarang}] - {b.namaBarang} (Stok: {b.stok} {b.satuan})
                </option>
              ))}
            </select>
          </div>

          {/* Stok Info Box */}
          {selectedBarang && (
            <div className={`md:col-span-2 p-4 rounded-xl border text-sm flex items-center gap-3 ${selectedBarang.stok <= selectedBarang.stokMinimum ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Stok saat ini: <strong>{selectedBarang.stok} {selectedBarang.satuan}</strong>
                {selectedBarang.stok <= selectedBarang.stokMinimum && (
                  <span className="ml-2 font-medium text-red-600">(⚠️ Mendekati / Di bawah batas minimum: {selectedBarang.stokMinimum})</span>
                )}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Jumlah yang Dikeluarkan <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="jumlah"
              required
              min="1"
              max={selectedBarang?.stok ?? undefined}
              value={formData.jumlah}
              onChange={handleChange}
              placeholder="Masukkan jumlah..."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${!stokCukup && jumlahNum > 0 ? 'border-red-400 ring-2 ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
            />
            {!stokCukup && jumlahNum > 0 && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Stok tidak cukup! Jumlah melebihi stok yang tersedia ({selectedBarang?.stok}).
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Keterangan Tambahan</label>
            <textarea
              name="keterangan"
              rows={2}
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Opsional..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
            ></textarea>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <Link
            href="/admin/barang-keluar"
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || !stokCukup || barangList.length === 0}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center justify-center min-w-[160px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Simpan & Kurangi Stok"}
          </button>
        </div>
      </form>
    </div>
  );
}
