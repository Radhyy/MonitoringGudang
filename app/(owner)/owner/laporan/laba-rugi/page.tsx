import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import TrenKeuanganChart from "@/components/charts/TrenKeuanganChart";
import KategoriPengeluaranChart from "@/components/charts/KategoriPengeluaranChart";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function LabaRugiPage() {
  // Fetch data
  const allBarangMasuk = await prisma.barangMasuk.findMany({
    select: { tanggal: true, totalHarga: true },
    orderBy: { tanggal: "asc" }
  });
  
  const allPengeluaran = await prisma.pengeluaran.findMany({
    select: { tanggal: true, jumlah: true, kategori: true },
    orderBy: { tanggal: "asc" }
  });

  // Calculate Totals
  const totalPembelian = allBarangMasuk.reduce((acc, curr) => acc + Number(curr.totalHarga), 0);
  const totalPengeluaranOperasional = allPengeluaran.reduce((acc, curr) => acc + Number(curr.jumlah), 0);
  const totalBiaya = totalPembelian + totalPengeluaranOperasional;
  const totalPendapatan = 0; // Modul penjualan belum ada
  const labaRugi = totalPendapatan - totalBiaya;

  // 1. Process Trend Data (Group by Month)
  const trendMap: Record<string, { name: string, pemasukan: number, pengeluaran: number }> = {};
  
  // Masukkan pengeluaran dari pembelian bahan (barang masuk)
  allBarangMasuk.forEach(trx => {
    const month = format(new Date(trx.tanggal), "MMM yy", { locale: id });
    if (!trendMap[month]) trendMap[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
    trendMap[month].pengeluaran += Number(trx.totalHarga);
  });

  // Masukkan pengeluaran dari operasional
  allPengeluaran.forEach(trx => {
    const month = format(new Date(trx.tanggal), "MMM yy", { locale: id });
    if (!trendMap[month]) trendMap[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
    trendMap[month].pengeluaran += Number(trx.jumlah);
  });

  // Convert map to array
  const trendData = Object.values(trendMap);

  // 2. Process Kategori Pengeluaran Data
  const catMap: Record<string, number> = {};
  allPengeluaran.forEach(trx => {
    const cat = trx.kategori || "Lainnya";
    if (!catMap[cat]) catMap[cat] = 0;
    catMap[cat] += Number(trx.jumlah);
  });
  
  const kategoriData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Laporan Laba Rugi" 
        description="Ringkasan biaya operasional, pembelian bahan, dan kalkulasi profit." 
      />

      {/* Chart Section (At The Top) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Tren Keuangan Bulanan</h3>
          <p className="text-xs text-slate-500 mb-4">Perbandingan akumulasi biaya yang dikeluarkan tiap bulan.</p>
          <TrenKeuanganChart data={trendData} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Sebaran Pengeluaran Operasional</h3>
          <p className="text-xs text-slate-500 mb-4">Rincian distribusi biaya operasional gudang berdasarkan kategori.</p>
          <KategoriPengeluaranChart data={kategoriData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ringkasan Biaya */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Rincian Keuangan</h3>
            
            <div className="space-y-6">
              {/* Pendapatan */}
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Total Pendapatan (Penjualan)</h4>
                    <p className="text-xs text-slate-500">Modul penjualan belum tersedia</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-800">Rp 0</span>
              </div>

              {/* Pembelian Bahan */}
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Biaya Pembelian Bahan Baku</h4>
                    <p className="text-xs text-slate-500">Total belanja dari supplier</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-red-600">
                  - Rp {totalPembelian.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Pengeluaran Operasional */}
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Biaya Operasional</h4>
                    <p className="text-xs text-slate-500">Pengeluaran harian dan operasional gudang</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-red-600">
                  - Rp {totalPengeluaranOperasional.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center pt-2">
                <h3 className="text-xl font-bold text-slate-800">Total Keuntungan Bersih</h3>
                <span className={`text-2xl font-bold ${labaRugi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {labaRugi < 0 ? '-' : ''} Rp {Math.abs(labaRugi).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg h-full">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Informasi Sistem</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Saat ini sistem fokus pada manajemen stok dan inventaris gudang. Karena belum ada modul atau tabel khusus untuk mencatat "Penjualan / Pemasukan", kalkulasi Laba Rugi saat ini hanya menampilkan total pengeluaran dan biaya (Cost).
            </p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl text-sm font-medium backdrop-blur-sm mt-auto">
              Cetak Laporan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
