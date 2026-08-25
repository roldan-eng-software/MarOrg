import Hero from "@/components/landing/hero";
import Sobre from "@/components/landing/sobre";
import Servicos from "@/components/landing/servicos";
import Galeria from "@/components/landing/galeria";
import Contato from "@/components/landing/contato";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "Roldan Marcenaria — Móveis Planejados Sob Medida",
  description:
    "Móveis planejados que transformam espaços em ambientes únicos, funcionais e feitos para você. Solicite seu orçamento.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Sobre />
      <Servicos />
      <Galeria />
      <Contato />
      <Footer />
    </main>
  );
}
