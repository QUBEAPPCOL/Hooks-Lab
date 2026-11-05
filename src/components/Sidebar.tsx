"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/generar", label: "Generar hooks" },
  { href: "/generaciones", label: "Historial" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/investigador", label: "Investigador" },
  { href: "/creadores", label: "Creadores" },
  { href: "/industrias", label: "Industrias" },
  { href: "/marcas", label: "Mis marcas" },
  { href: "/resultados", label: "Mis resultados" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/configuracion", label: "Configuración" },
];

export function Sidebar({ logout }: { logout: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-bg/90 backdrop-blur border-b border-line">
        <Link href="/" className="serif text-xl">HOOKS LAB</Link>
        <button className="btn btn-ghost py-1.5" onClick={() => setOpen(!open)} aria-label="Menú">{open ? "Cerrar" : "Menú"}</button>
      </div>
      <aside
        className={`${open ? "block" : "hidden"} lg:block lg:sticky lg:top-0 lg:h-screen w-full lg:w-60 shrink-0 border-r border-line bg-surface px-4 py-6`}
      >
        <Link href="/" className="hidden lg:block px-2 mb-8">
          <p className="text-[10px] tracking-[0.3em] text-muted font-semibold">LABORATORIO</p>
          <p className="serif text-2xl leading-tight">HOOKS LAB</p>
        </Link>
        <nav className="space-y-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                active(n.href) ? "bg-olive-soft text-ink font-semibold" : "text-ink-2 hover:bg-surface-2"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-8 px-2">
          <button className="text-xs text-muted hover:text-ink">Cerrar sesión</button>
        </form>
      </aside>
    </>
  );
}
