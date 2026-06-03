import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function KelolaSupplierPage() {
  const supplierList = await prisma.supplier.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Data Supplier" 
          description="Kelola daftar pemasok bahan baku dan rekanan bisnis." 
        />
        <Link 
          href="/karyawan/supplier/tambah"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Supplier
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Supplier / Perusahaan</th>
                <th className="px-6 py-4">No. Telp / Kontak</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplierList.length > 0 ? (
                supplierList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {item.namaSupplier}
                    </td>
                    <td className="px-6 py-4">
                      {item.kontak || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {item.email ? (
                        <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline">
                          {item.email}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]">
                      {item.alamat || "-"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Edit">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p>Belum ada data supplier.</p>
                      <p className="text-xs mt-1 text-slate-400">Silakan input data pihak penyuplai terlebih dahulu.</p>
                    </div>
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
