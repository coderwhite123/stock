import { Sidebar } from '@/components/dashboard/sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3ef] dark:bg-slate-950 md:flex-row md:h-screen md:overflow-hidden">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
