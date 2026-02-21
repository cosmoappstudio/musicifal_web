import AdminShell from '@/components/admin/AdminShell';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children }: Props) {
  return <AdminShell>{children}</AdminShell>;
}
