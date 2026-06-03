import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import TrenKeuanganChart from "@/components/charts/TrenKeuanganChart";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function OwnerDashboard() {
  // --- 1. Fetch Summary Data ---
  const [
    barangMasukAgg,
    pengeluaranAgg,
    barangMasukCount,
    barangKeluarCount,
    stokAlertCount,
    recentBarangMasuk,
    allBarangMasuk,
    allPengeluaran
  ] = await Promise.all([
    prisma.barangMasuk.aggregate({ _sum: { totalHarga: true } }),
    prisma.pengeluaran.aggregate({ _sum: { jumlah: true } }),
    prisma.barangMasuk.count(),
    prisma.barangKeluar.count(),
    prisma.barang.count({ where: { stok: { lte: prisma.barang.fields.stokMinimum } } }),
    prisma.barangMasuk.findMany({ 
      take: 5, 
      orderBy: { tanggal: "desc" }, 
      include: { barang: true, supplier: true } 
    }),
    prisma.barangMasuk.findMany({ select: { tanggal: true, totalHarga: true } }),
    prisma.pengeluaran.findMany({ select: { tanggal: true, jumlah: true } }),
  ]);

  const totalPembelian = Number(barangMasukAgg._sum.totalHarga || 0);
  const totalPengeluaran = Number(pengeluaranAgg._sum.jumlah || 0);
  const totalBiaya = totalPembelian + totalPengeluaran;

  // --- 2. Process Chart Data ---
  const trendMap: Record<string, { name: string, pemasukan: number, pengeluaran: number }> = {};
  
  allBarangMasuk.forEach(trx => {
    const month = format(new Date(trx.tanggal), "MMM yy", { locale: id });
    if (!trendMap[month]) trendMap[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
    trendMap[month].pengeluaran += Number(trx.totalHarga);
  });

  allPengeluaran.forEach(trx => {
    const month = format(new Date(trx.tanggal), "MMM yy", { locale: id });
    if (!trendMap[month]) trendMap[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
    trendMap[month].pengeluaran += Number(trx.jumlah);
  });

  const trendData = Object.values(trendMap);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard Owner" 
        description="Ringkasan operasional harian gudang, aktivitas stok, dan keuangan." 
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Total Biaya & Pembelian</h3>
          <p className="text-2xl font-bold text-red-600">
            - Rp {(totalBiaya / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Aktivitas Barang Masuk</h3>
          <p className="text-2xl font-bold text-slate-800">{barangMasukCount.toLocaleString('id-ID')} Kali</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Aktivitas Barang Keluar</h3>
          <p className="text-2xl font-bold text-slate-800">{barangKeluarCount.toLocaleString('id-ID')} Kali</p>
        </div>
        <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${stokAlertCount > 0 ? 'border-red-100 bg-red-50/30' : 'border-slate-100'}`}>
          <h3 className={`${stokAlertCount > 0 ? 'text-red-500' : 'text-slate-500'} font-medium text-sm mb-2`}>Alert Stok Kritis</h3>
          <p className={`text-2xl font-bold ${stokAlertCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {stokAlertCount} Item
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Pergerakan Biaya Gudang</h3>
              <p className="text-xs text-slate-500">Tren pengeluaran dari pembelian bahan dan operasional bulanan.</p>
            </div>
          </div>
          <TrenKeuanganChart data={trendData} />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Barang Masuk Terbaru</h3>
          
          <div className="space-y-5">
            {recentBarangMasuk.length > 0 ? (
              recentBarangMasuk.map((trx) => (
                <div key={trx.id} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 leading-none mb-1">
                      {trx.barang.namaBarang}
                    </h4>
                    <p className="text-xs text-slate-500 mb-1">Dari: {trx.supplier.namaSupplier}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        +{trx.jumlah} {trx.barang.satuan}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {format(new Date(trx.tanggal), "dd MMM, HH:mm", { locale: id })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">Belum ada aktivitas barang masuk.</p>
              </div>
            )}
          </div>
          
          {recentBarangMasuk.length > 0 && (
            <button className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-xl transition-colors">
              Lihat Semua Laporan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
