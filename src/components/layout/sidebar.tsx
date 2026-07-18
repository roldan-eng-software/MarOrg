"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/customers", label: "Clientes", icon: "👥" },
  { href: "/budgets", label: "Orçamentos", icon: "📋" },
  { href: "/service-orders", label: "Ordens de Serviço", icon: "🔧" },
  { href: "/schedule", label: "Agenda", icon: "📅" },
  { href: "/inventory", label: "Estoque", icon: "📦" },
  { href: "/furniture-templates", label: "Modelos de Móveis", icon: "🪑" },
  { href: "/settings", label: "Configurações", icon: "⚙️" },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="flex h-6 w-6 flex-col items-center justify-center">
      <span
        className={`block h-0.5 w-5 transform bg-[#3D2519] transition-all duration-300 ${
          open ? "translate-y-1 rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-5 bg-[#3D2519] transition-all duration-300 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-5 transform bg-[#3D2519] transition-all duration-300 ${
          open ? "-translate-y-1 -rotate-45" : ""
        }`}
      />
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function NavLinks({ mobile = false }: { mobile?: boolean }) {
    return (
      <>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#5B3A29] text-white"
                  : "text-[#3D2519] hover:bg-[#F5F0EB]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 shadow-md md:hidden"
        aria-label="Menu"
      >
        <HamburgerIcon open={mobileOpen} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#D4C4B0] bg-white transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-[#D4C4B0] px-6 py-5">
          <h1 className="text-lg font-bold text-[#3D2519]">Roldan</h1>
          <p className="text-xs text-[#8B7A6B]">Sistema de Gestão</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <NavLinks mobile />
        </nav>
        <div className="border-t border-[#D4C4B0] px-3 py-4">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
            Sair
          </Button>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-60 lg:w-64 flex-col border-r border-[#D4C4B0] bg-white shrink-0">
        <div className="border-b border-[#D4C4B0] px-6 py-5">
          <h1 className="text-lg font-bold text-[#3D2519]">Roldan</h1>
          <p className="text-xs text-[#8B7A6B]">Sistema de Gestão</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="border-t border-[#D4C4B0] px-3 py-4">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
