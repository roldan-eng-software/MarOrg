export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toast";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F5F0EB]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
      <Toaster />
    </div>
  );
}
