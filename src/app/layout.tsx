export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roldan Marcenaria — Sistema de Gestão",
  description: "Sistema de gestão para marcenaria sob medida",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
