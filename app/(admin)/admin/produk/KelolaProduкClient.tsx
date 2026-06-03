"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";
import { Produk } from "@prisma/client";

interface Props {
  produkList: Produk[];
}

export default function KelolaProduкClient({ produkList: initialProdukList }: Props) {
  const router = useRouter();
  const [produkList, setProdukList] = useState(initialProdukList);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ kodeProduk: "", namaProduk: "", deskripsi: "", stok: 0, hargaJual: 0, tarifPacking: 0 });

  // Edit & Delete State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ kodeProduk: "", namaProduk: "", deskripsi: "", stok: "", hargaJual: "", tarifPacking: "" });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "stok" || name === "hargaJual" || name === "tarifPacking" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/produk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setProdukList(prev => [data, ...prev]);
      setShowForm(false);
      setFormData({ kodeProduk: "", namaProduk: "", deskripsi: "", stok: 0, hargaJual: 0, tarifPacking: 0 });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (produk: Produk) => {
    setError("");
    setEditingId(produk.id);
    setEditForm({
      kodeProduk: produk.kodeProduk,
      namaProduk: produk.namaProduk,
      deskripsi: produk.deskripsi || "",
      stok: produk.stok.toString(),
      hargaJual: produk.hargaJual.toString(),
      tarifPacking: produk.tarifPacking.toString(),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/produk/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengupdate produk");

      setProdukList(prev => prev.map(p => p.id === editingId ? { ...p, ...data } : p));
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    
    setDeletingId(id);
    setError("");

    try {
      const res = await fetch(`/api/produk/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus produk");

      setProdukList(prev => prev.filter(p => p.id !== id));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title="Kelola Produk" description="Master data produk jadi beserta harga jual dan tarif upah packing." />
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Produk
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
          <h3 className="font-bold text-slate-800 mb-5">Form Tambah Produk Baru</h3>
          {error && !editingId && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kode Produk <span className="text-red-500">*</span></label>
              <input type="text" name="kodeProduk" required value={formData.kodeProduk} onChange={handleChange}
                placeholder="Misal: PRD-001"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Produk <span className="text-red-500">*</span></label>
              <input type="text" name="namaProduk" required value={formData.namaProduk} onChange={handleChange}
                placeholder="Misal: Produk Kemasan A"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Stok Awal <span className="text-red-500">*</span></label>
              <input type="number" name="stok" required value={formData.stok} onChange={handleChange} min="0"
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Harga Jual (Rp) <span className="text-red-500">*</span></label>
              <input type="number" name="hargaJual" required value={formData.hargaJual} onChange={handleChange} min="0"
                placeholder="Misal: 15000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Tarif Upah Packing per Pack (Rp) <span className="text-red-500">*</span></label>
              <input type="number" name="tarifPacking" required value={formData.tarifPacking} onChange={handleChange} min="0"
                placeholder="Misal: 250"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Deskripsi (Opsional)</label>
              <textarea name="deskripsi" rows={2} value={formData.deskripsi} onChange={handleChange}
                placeholder="Keterangan singkat tentang produk..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-colors"></textarea>
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
                ) : "Simpan Produk"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {error && editingId && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Nama Produk</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Harga Jual</th>
                <th className="px-6 py-4">Tarif Packing</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produkList.length > 0 ? (
                produkList.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    {editingId === p.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input type="text" value={editForm.kodeProduk} onChange={e => setEditForm({...editForm, kodeProduk: e.target.value})} className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="text" value={editForm.namaProduk} onChange={e => setEditForm({...editForm, namaProduk: e.target.value})} className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={editForm.stok} onChange={e => setEditForm({...editForm, stok: e.target.value})} className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={editForm.hargaJual} onChange={e => setEditForm({...editForm, hargaJual: e.target.value})} className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={editForm.tarifPacking} onChange={e => setEditForm({...editForm, tarifPacking: e.target.value})} className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="text" value={editForm.deskripsi} onChange={e => setEditForm({...editForm, deskripsi: e.target.value})} className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <button onClick={handleSaveEdit} disabled={loading} className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition disabled:opacity-50">
                            Simpan
                          </button>
                          <button onClick={handleCancelEdit} disabled={loading} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-300 transition disabled:opacity-50">
                            Batal
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.kodeProduk}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{p.namaProduk}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{p.stok}</td>
                        <td className="px-6 py-4 font-medium text-blue-600">Rp {Number(p.hargaJual).toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4 font-medium text-green-600">Rp {Number(p.tarifPacking).toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs max-w-[200px] truncate">{p.deskripsi || "-"}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleEditClick(p)} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Edit">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteClick(p.id)} disabled={deletingId === p.id} className="text-slate-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50" title="Hapus">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <p>Belum ada data produk. Tambahkan produk agar tim bisa memilihnya.</p>
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
