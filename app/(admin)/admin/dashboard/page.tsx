import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import TrenKeuanganChart from "@/components/charts/TrenKeuanganChart";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // --- 1. Fetch Summary Data ---
  const [
    barangMasukAgg,
    pengeluaranAgg,
    penjualanAgg,
    packingAgg,
    barangMasukCount,
    barangKeluarCount,
    stokAlertCount,
    stokBarangAgg,
    barangTerpakaiAgg,
    produkTerjualAgg,
    barangMasukQtyAgg,
    barangKeluarQtyAgg,
    recentBarangMasuk,
    allBarangMasuk,
    allPengeluaran,
    allPenjualan,
    allPacking
  ] = await Promise.all([
    prisma.barangMasuk.aggregate({ _sum: { totalHarga: true } }),
    prisma.pengeluaran.aggregate({ _sum: { jumlah: true } }),
    prisma.penjualan.aggregate({ _sum: { totalHarga: true } }),
    prisma.packing.aggregate({ _sum: { totalGaji: true } }),
    prisma.barangMasuk.count(),
    prisma.barangKeluar.count(),
    prisma.barang.count({ where: { stok: { lte: prisma.barang.fields.stokMinimum } } }),
    prisma.barang.aggregate({ _sum: { stok: true } }),
    prisma.packingDetail.aggregate({ _sum: { jumlahTerpakai: true } }),
    prisma.penjualan.aggregate({ _sum: { jumlah: true } }),
    prisma.barangMasuk.aggregate({ _sum: { jumlah: true } }),
    prisma.barangKeluar.aggregate({ _sum: { jumlah: true } }),
    prisma.barangMasuk.findMany({ 
      take: 5, 
      orderBy: { tanggal: "desc" }, 
      include: { barang: true, supplier: true } 
    }),
    prisma.barangMasuk.findMany({ select: { tanggal: true, totalHarga: true } }),
    prisma.pengeluaran.findMany({ select: { tanggal: true, jumlah: true } }),
    prisma.penjualan.findMany({ select: { tanggal: true, totalHarga: true } }),
    prisma.packing.findMany({ select: { tanggalPacking: true, totalGaji: true } })
  ]);

  // Keuangan
  const totalPembelian = Number(barangMasukAgg._sum.totalHarga || 0);
  const totalPengeluaranLain = Number(pengeluaranAgg._sum.jumlah || 0);
  const totalGaji = Number(packingAgg._sum.totalGaji || 0);
  const totalPenjualan = Number(penjualanAgg._sum.totalHarga || 0);
  
  const totalPengeluaran = totalPembelian + totalPengeluaranLain + totalGaji;
  const labaRugi = totalPenjualan - totalPengeluaran;

  // Statistik Kuantitas
  const sisaBarang = Number(stokBarangAgg._sum.stok || 0);
  const barangTerpakai = Number(barangTerpakaiAgg._sum.jumlahTerpakai || 0);
  const produkTerjual = Number(produkTerjualAgg._sum.jumlah || 0);
  const qtyBarangMasuk = Number(barangMasukQtyAgg._sum.jumlah || 0);
  const qtyBarangKeluar = Number(barangKeluarQtyAgg._sum.jumlah || 0);

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

  allPacking.forEach(trx => {
    const month = format(new Date(trx.tanggalPacking), "MMM yy", { locale: id });
    if (!trendMap[month]) trendMap[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
    trendMap[month].pengeluaran += Number(trx.totalGaji);
  });

  allPenjualan.forEach(trx => {
    const month = format(new Date(trx.tanggal), "MMM yy", { locale: id });
    if (!trendMap[month]) trendMap[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
    trendMap[month].pemasukan += Number(trx.totalHarga);
  });

  const trendData = Object.values(trendMap);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard Admin Gudang" 
        description="Ringkasan operasional harian gudang, aktivitas stok, dan keuangan." 
      />
      
      {/* Keuangan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Total Laba/Rugi Bersih</h3>
          <p className={`text-2xl font-bold ${labaRugi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {labaRugi < 0 ? '-' : ''} Rp {Math.abs(labaRugi / 1000).toLocaleString('id-ID')}K
          </p>
        </div>
        <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${stokAlertCount > 0 ? 'border-red-100 bg-red-50/30' : 'border-slate-100'}`}>
          <h3 className={`${stokAlertCount > 0 ? 'text-red-500' : 'text-slate-500'} font-medium text-sm mb-2`}>Alert Stok Kritis</h3>
          <p className={`text-2xl font-bold ${stokAlertCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {stokAlertCount} Item
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Total Pemasukan (Kotor)</h3>
          <p className="text-2xl font-bold text-green-600">Rp {(totalPenjualan / 1000).toLocaleString('id-ID')}K</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-red-600">Rp {(totalPengeluaran / 1000).toLocaleString('id-ID')}K</p>
        </div>
      </div>

      {/* Statistik Kuantitas Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <h3 className="text-blue-600/80 font-medium text-xs mb-1">Barang Masuk</h3>
          <p className="text-lg font-bold text-blue-700">{qtyBarangMasuk.toLocaleString('id-ID')} <span className="text-xs font-normal">Unit</span></p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h3 className="text-slate-500 font-medium text-xs mb-1">Barang Keluar</h3>
          <p className="text-lg font-bold text-slate-700">{qtyBarangKeluar.toLocaleString('id-ID')} <span className="text-xs font-normal">Unit</span></p>
        </div>
        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
          <h3 className="text-orange-600/80 font-medium text-xs mb-1">Barang Terpakai (Pack)</h3>
          <p className="text-lg font-bold text-orange-700">{barangTerpakai.toLocaleString('id-ID')} <span className="text-xs font-normal">Unit</span></p>
        </div>
        <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
          <h3 className="text-green-600/80 font-medium text-xs mb-1">Produk Terjual</h3>
          <p className="text-lg font-bold text-green-700">{produkTerjual.toLocaleString('id-ID')} <span className="text-xs font-normal">Pack</span></p>
        </div>
        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 lg:col-span-2">
          <h3 className="text-indigo-600/80 font-medium text-xs mb-1">Sisa Barang (Total Stok Gudang)</h3>
          <p className="text-xl font-bold text-indigo-700">{sisaBarang.toLocaleString('id-ID')} <span className="text-sm font-normal">Unit</span></p>
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
