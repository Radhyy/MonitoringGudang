import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { redirect } from "next/navigation";

export default async function KaryawanDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);

  const [packingRiwayat, totalGaji, bulanIni] = await Promise.all([
    // 10 packing terbaru karyawan ini
    prisma.packing.findMany({
      where: { karyawanId: userId },
      orderBy: { tanggalPacking: "desc" },
      take: 10,
      include: { produk: true },
    }),
    // Total gaji keseluruhan
    prisma.packing.aggregate({
      where: { karyawanId: userId },
      _sum: { totalGaji: true, jumlahProduksi: true },
    }),
    // Gaji bulan ini
    prisma.packing.aggregate({
      where: {
        karyawanId: userId,
        tanggalPacking: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalGaji: true, jumlahProduksi: true },
    }),
  ]);

  const totalGajiAll = Number(totalGaji._sum.totalGaji || 0);
  const totalPackAll = Number(totalGaji._sum.jumlahProduksi || 0);
  const gajiIni = Number(bulanIni._sum.totalGaji || 0);
  const packIni = Number(bulanIni._sum.jumlahProduksi || 0);
  const bulanNama = format(new Date(), "MMMM yyyy", { locale: id });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat Datang, ${session.user.name}!`}
        description="Pantau riwayat packing dan total pendapatan Anda."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-md text-white">
          <p className="text-blue-100 text-sm font-medium">Gaji Bulan Ini</p>
          <p className="text-3xl font-bold mt-1">Rp {gajiIni.toLocaleString("id-ID")}</p>
          <p className="text-blue-200 text-xs mt-2">{bulanNama}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Pack Bulan Ini</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{packIni.toLocaleString("id-ID")}</p>
          <p className="text-slate-400 text-xs mt-2">Pack selesai bulan ini</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Total Gaji (All Time)</p>
          <p className="text-3xl font-bold text-green-600 mt-1">Rp {totalGajiAll.toLocaleString("id-ID")}</p>
          <p className="text-slate-400 text-xs mt-2">Akumulasi seluruh waktu</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Total Pack (All Time)</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{totalPackAll.toLocaleString("id-ID")}</p>
          <p className="text-slate-400 text-xs mt-2">Pack dikerjakan sejak awal</p>
        </div>
      </div>

      {/* Riwayat Packing */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Riwayat Packing Saya</h3>
          <p className="text-sm text-slate-400 mt-0.5">10 pekerjaan packing terakhir yang dicatat admin.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Jumlah Pack</th>
                <th className="px-6 py-4">Tarif/Pack</th>
                <th className="px-6 py-4">Upah Diterima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packingRiwayat.length > 0 ? (
                packingRiwayat.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(p.tanggalPacking), "dd MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{p.produk.namaProduk}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{p.jumlahProduksi} Pack</td>
                    <td className="px-6 py-4 text-slate-500">Rp {Number(p.tarifPerPack).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                        Rp {Number(p.totalGaji).toLocaleString("id-ID")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-medium">Belum ada riwayat packing.</p>
                    <p className="text-xs mt-1">Admin gudang akan menginputkan pekerjaan kamu di sini.</p>
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

