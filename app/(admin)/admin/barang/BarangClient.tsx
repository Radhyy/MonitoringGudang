"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Barang } from "@prisma/client";

interface Props {
  initialBarangList: Barang[];
}

export default function BarangClient({ initialBarangList }: Props) {
  const router = useRouter();
  const [barangList, setBarangList] = useState(initialBarangList);
  
  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    kodeBarang: "",
    namaBarang: "",
    satuan: "",
    stokMinimum: "",
    hargaSatuan: "",
  });

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEditClick = (barang: Barang) => {
    setError("");
    setEditingId(barang.id);
    setEditForm({
      kodeBarang: barang.kodeBarang,
      namaBarang: barang.namaBarang,
      satuan: barang.satuan,
      stokMinimum: barang.stokMinimum.toString(),
      hargaSatuan: barang.hargaSatuan.toString(),
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
      const res = await fetch(`/api/barang/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengupdate barang");

      // Update local state
      setBarangList(prev => prev.map(b => b.id === editingId ? { ...b, ...data } : b));
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus barang ini?")) return;
    
    setDeletingId(id);
    setError("");

    try {
      const res = await fetch(`/api/barang/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus barang");

      // Remove from local state
      setBarangList(prev => prev.filter(b => b.id !== id));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      alert(err.message); // Tampilkan popup error jika gagal dihapus karena relasi
    } finally {
      setDeletingId(null);
    }
  };

  return (
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
              <th className="px-6 py-4">Kode Barang</th>
              <th className="px-6 py-4">Nama Barang</th>
              <th className="px-6 py-4">Satuan</th>
              <th className="px-6 py-4 text-right">Harga Beli Satuan</th>
              <th className="px-6 py-4 text-center">Stok Min.</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {barangList.length > 0 ? (
              barangList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {editingId === item.id ? (
                    // EDIT MODE
                    <>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={editForm.kodeBarang}
                          onChange={(e) => setEditForm({...editForm, kodeBarang: e.target.value})}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={editForm.namaBarang}
                          onChange={(e) => setEditForm({...editForm, namaBarang: e.target.value})}
                          className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={editForm.satuan}
                          onChange={(e) => setEditForm({...editForm, satuan: e.target.value})}
                          className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          value={editForm.hargaSatuan}
                          onChange={(e) => setEditForm({...editForm, hargaSatuan: e.target.value})}
                          className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-right"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          value={editForm.stokMinimum}
                          onChange={(e) => setEditForm({...editForm, stokMinimum: e.target.value})}
                          className="w-16 mx-auto px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center block"
                        />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button 
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Simpan
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-300 transition disabled:opacity-50"
                        >
                          Batal
                        </button>
                      </td>
                    </>
                  ) : (
                    // VIEW MODE
                    <>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {item.kodeBarang}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.namaBarang}
                      </td>
                      <td className="px-6 py-4">
                        {item.satuan}
                      </td>
                      <td className="px-6 py-4 text-right">
                        Rp {Number(item.hargaSatuan).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {item.stokMinimum}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1" 
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          disabled={deletingId === item.id}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50" 
                          title="Hapus"
                        >
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
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p>Belum ada data barang.</p>
                    <p className="text-xs mt-1 text-slate-400">Silakan tambah master barang terlebih dahulu.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
