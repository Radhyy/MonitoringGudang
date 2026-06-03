import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import EmailNotifikasiForm from "@/components/forms/EmailNotifikasiForm";

export default async function NotifikasiStokPage() {
  const barangKritis = await prisma.barang.findMany({
    where: { stok: { lte: prisma.barang.fields.stokMinimum } },
    orderBy: { stok: "asc" },
  });

  const barangHabis = barangKritis.filter(b => b.stok === 0);
  const barangMenipis = barangKritis.filter(b => b.stok > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi Stok"
        description="Daftar bahan baku yang sudah kritis atau habis dan perlu segera direstock."
      />

      {barangKritis.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-green-100">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Semua Stok Aman! 🎉</h3>
          <p className="text-sm text-slate-400">Tidak ada bahan baku yang kritis saat ini. Produksi bisa berjalan lancar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stok Habis */}
          {barangHabis.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h3 className="font-bold text-slate-800">Stok Habis ({barangHabis.length} item)</h3>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                {barangHabis.map((barang, i) => (
                  <div key={barang.id} className={`flex items-center justify-between p-5 ${i !== barangHabis.length - 1 ? 'border-b border-red-50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{barang.namaBarang}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{barang.kodeBarang}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-red-100 text-red-700">
                        HABIS
                      </span>
                      <p className="text-xs text-slate-400 mt-1">Min: {barang.stokMinimum} {barang.satuan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stok Menipis */}
          {barangMenipis.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <h3 className="font-bold text-slate-800">Stok Menipis ({barangMenipis.length} item)</h3>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                {barangMenipis.map((barang, i) => {
                  const pct = Math.min((barang.stok / Math.max(barang.stokMinimum, 1)) * 100, 100);
                  return (
                    <div key={barang.id} className={`p-5 ${i !== barangMenipis.length - 1 ? 'border-b border-amber-50' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{barang.namaBarang}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{barang.kodeBarang}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-amber-600">{barang.stok}</span>
                          <span className="text-slate-400 text-sm"> / {barang.stokMinimum} {barang.satuan}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-amber-400 transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Kirim Email */}
          <EmailNotifikasiForm barangHabis={barangHabis} barangMenipis={barangMenipis} />

          {/* Info Box */}
          <div className="bg-slate-800 rounded-2xl p-6 text-white text-sm">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cara Melaporkan ke Admin
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Hubungi Admin Gudang untuk melakukan pemesanan ulang ke supplier. 
              Informasikan nama barang, kode barang, dan jumlah yang dibutuhkan untuk memperlancar proses restock.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
