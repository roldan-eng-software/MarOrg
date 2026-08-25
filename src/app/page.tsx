import Hero from "@/components/landing/hero";
import Sobre from "@/components/landing/sobre";
import Servicos from "@/components/landing/servicos";
import Contato from "@/components/landing/contato";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "Roldan Marcenaria — Móveis Planejados Sob Medida",
  description:
    "Móveis planejados que transformam espaços em ambientes únicos, funcionais e feitos para você. Cozinhas, guarda-roupas, home offices. Solicite seu orçamento.",
  alternates: {
    canonical: "https://mar-org.vercel.app",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Roldan Marcenaria",
    description:
      "Móveis planejados sob medida com qualidade e acabamento impecável",
    url: "https://mar-org.vercel.app",
    telephone: "+5516992406202",
    email: "roldan.marcenaria@gmail.com",
    foundingDate: "2018",
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "30",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Sobre />
      <Servicos />
      <Contato />
      <Footer />
    </main>
  );
}
