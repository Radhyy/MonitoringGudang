import DashboardLayout from "@/components/layout/DashboardLayout";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="OWNER">{children}</DashboardLayout>;
}
