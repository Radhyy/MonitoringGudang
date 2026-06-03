"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Barang, Produk, User } from "@prisma/client";

interface BahanItem {
  barangId: string;
  jumlahTerpakai: string;
}

interface Props {
  produkList: Produk[];
  barangList: Barang[];
  karyawanList: User[];
}

export default function PackingForm({ produkList, barangList, karyawanList }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    produkId: "",
    karyawanId: "",
    jumlahProduksi: "",
    tanggalPacking: new Date().toISOString().slice(0, 16),
    catatan: "",
  });

  // Dynamic list of bahan
  const [bahanList, setBahanList] = useState<BahanItem[]>([
    { barangId: "", jumlahTerpakai: "" },
  ]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBahanChange = (index: number, field: keyof BahanItem, value: string) => {
    setBahanList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addBahan = () => {
    setBahanList(prev => [...prev, { barangId: "", jumlahTerpakai: "" }]);
  };

  const removeBahan = (index: number) => {
    if (bahanList.length === 1) return; // minimal 1 bahan
    setBahanList(prev => prev.filter((_, i) => i !== index));
  };

  const getStokInfo = (barangId: string) => {
    return barangList.find(b => b.id.toString() === barangId) || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, bahan: bahanList }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mencatat sesi packing");
      }

      router.push("/admin/packing");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Gagal Menyimpan</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bagian 1: Info Produksi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Informasi Produksi & Karyawan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tanggal & Waktu Packing <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                name="tanggalPacking"
                required
                value={formData.tanggalPacking}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Karyawan yang Mengerjakan <span className="text-red-500">*</span></label>
              <select
                name="karyawanId"
                required
                value={formData.karyawanId}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>-- Pilih Karyawan --</option>
                {karyawanList.map(k => (
                  <option key={k.id} value={k.id}>{k.name} ({k.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Produk yang Diproduksi <span className="text-red-500">*</span></label>
              <select
                name="produkId"
                required
                value={formData.produkId}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>-- Pilih Produk --</option>
                {produkList.map(p => (
                  <option key={p.id} value={p.id}>{p.namaProduk} (Tarif: Rp{Number(p.tarifPacking).toLocaleString('id-ID')})</option>
                ))}
              </select>
              {produkList.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Belum ada data produk.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Jumlah Produksi (Unit/Pcs) <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="jumlahProduksi"
                required
                min="1"
                value={formData.jumlahProduksi}
                onChange={handleFormChange}
                placeholder="Misal: 50"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Catatan / Keterangan</label>
              <textarea
                name="catatan"
                rows={2}
                value={formData.catatan}
                onChange={handleFormChange}
                placeholder="Catatan shift, kendala, dll..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Bagian 2: Daftar Bahan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Bahan Baku yang Dipakai
            </h3>
            <button
              type="button"
              onClick={addBahan}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Bahan
            </button>
          </div>

          <div className="space-y-4">
            {bahanList.map((bahan, index) => {
              const stokInfo = getStokInfo(bahan.barangId);
              const jumlahNum = Number(bahan.jumlahTerpakai) || 0;
              const isOverStock = stokInfo && jumlahNum > stokInfo.stok;

              return (
                <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Pilih Bahan <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={bahan.barangId}
                        onChange={e => handleBahanChange(index, "barangId", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      >
                        <option value="" disabled>-- Pilih Barang --</option>
                        {barangList.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.namaBarang} (Stok: {b.stok} {b.satuan})
                          </option>
                        ))}
                      </select>
                      {stokInfo && (
                        <p className={`text-[10px] ${isOverStock ? 'text-red-500' : 'text-slate-400'}`}>
                          {isOverStock ? `⚠️ Melebihi stok! Tersedia: ${stokInfo.stok} ${stokInfo.satuan}` : `Stok tersedia: ${stokInfo.stok} ${stokInfo.satuan}`}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Jumlah Dipakai <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        required
                        min="1"
                        max={stokInfo?.stok ?? undefined}
                        value={bahan.jumlahTerpakai}
                        onChange={e => handleBahanChange(index, "jumlahTerpakai", e.target.value)}
                        placeholder="Qty..."
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${isOverStock ? 'border-red-400 ring-2 ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                      />
                    </div>
                  </div>

                  {bahanList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBahan(index)}
                      className="mt-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Hapus bahan ini"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/packing"
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || produkList.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center justify-center min-w-[180px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Sesi Packing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
