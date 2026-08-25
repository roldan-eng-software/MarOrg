export const dynamic = "force-dynamic";

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mar-org.vercel.app"),
  title: {
    default: "Roldan Marcenaria — Móveis Planejados Sob Medida",
    template: "%s | Roldan Marcenaria",
  },
  description:
    "Móveis planejados sob medida com qualidade, precisão e acabamento impecável. Cozinhas, guarda-roupas, home offices e mais. Solicite seu orçamento.",
  keywords: [
    "móveis planejados",
    "marcenaria sob medida",
    "cozinha planejada",
    "guarda-roupa planejado",
    "home office",
    "closet",
    "marcenaria",
    "móveis sob medida",
  ],
  authors: [{ name: "Roldan Marcenaria" }],
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Roldan",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://mar-org.vercel.app",
    siteName: "Roldan Marcenaria",
    title: "Roldan Marcenaria — Móveis Planejados Sob Medida",
    description:
      "Móveis planejados sob medida com qualidade e acabamento impecável. Solicite seu orçamento.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#5B3A29",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SF9Z2E7EMT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SF9Z2E7EMT');
          `}
        </Script>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
