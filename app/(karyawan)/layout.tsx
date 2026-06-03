import DashboardLayout from "@/components/layout/DashboardLayout";

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="KARYAWAN">{children}</DashboardLayout>;
}
