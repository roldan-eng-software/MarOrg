"use client";

import Link from "next/link";
import { useState } from "react";

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#5B3A29] text-white">
        <nav className="mx-auto max-w-6xl flex items-center justify-between h-16 px-4 md:px-8">
          <Link href="/" className="font-semibold text-lg">
            Roldan Marcenaria
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#sobre" className="hover:underline">
              Sobre
            </a>
            <a href="#servicos" className="hover:underline">
              Serviços
            </a>
            <a href="#galeria" className="hover:underline">
              Galeria
            </a>
            <a href="#contato" className="hover:underline">
              Contato
            </a>
            <Link
              href="/login"
              className="bg-white text-[#5B3A29] px-4 py-2 rounded-md font-medium hover:bg-[#F5F0EB] transition-colors"
            >
              Área do cliente
            </Link>
          </div>

          {/* Botão Menu Mobile */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden bg-[#4A2E20] px-4 py-4 space-y-3">
            <a
              href="#sobre"
              className="block hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Sobre
            </a>
            <a
              href="#servicos"
              className="block hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Serviços
            </a>
            <a
              href="#galeria"
              className="block hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Galeria
            </a>
            <a
              href="#contato"
              className="block hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Contato
            </a>
            <Link
              href="/login"
              className="block bg-white text-[#5B3A29] px-4 py-2 rounded-md font-medium text-center hover:bg-[#F5F0EB] transition-colors"
            >
              Área do cliente
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-[#F5F0EB] pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-4xl px-4 md:px-8 text-center space-y-6">
          <p className="text-sm text-[#8B7A6B] uppercase tracking-wide">
            Móveis planejados sob medida
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D2519] leading-tight">
            Móveis planejados que transformam espaços em ambientes únicos,
            funcionais e feitos para você.
          </h1>

          <p className="text-lg text-[#8B7A6B] max-w-2xl mx-auto">
            Do projeto à instalação, cuidamos de cada detalhe para criar móveis
            sob medida com qualidade, precisão e acabamento impecável.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/orcamento"
              className="w-full sm:w-auto bg-[#5B3A29] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3D2519] transition-colors"
            >
              Solicitar Orçamento
            </Link>

            <a
              href="https://wa.me/5516992406202"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
