"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Clientes" },
  { href: "/budgets", label: "Orçamentos" },
  { href: "/furniture-templates", label: "Modelos de Móveis" },
  { href: "/settings", label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#D4C4B0] bg-white">
      <div className="border-b border-[#D4C4B0] px-6 py-5">
        <h1 className="text-lg font-bold text-[#3D2519]">Roldan</h1>
        <p className="text-xs text-[#8B7A6B]">Sistema de Gestão</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#5B3A29] text-white"
                  : "text-[#3D2519] hover:bg-[#F5F0EB]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#D4C4B0] px-3 py-4">
        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
          Sair
        </Button>
      </div>
    </aside>
  );
}
