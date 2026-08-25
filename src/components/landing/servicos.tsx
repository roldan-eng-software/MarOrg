import Image from "next/image";

const SERVICOS = [
  {
    titulo: "Cozinha Planejada",
    descricao:
      "Armários, gavetas, ilhas e nichos projetados para otimizar cada centímetro da sua cozinha.",
    imagem: "/assetsLanding/Imagem-landing-01.png",
  },
  {
    titulo: "Guarda-Roupa",
    descricao:
      "Closet planejado com organização interna pensada para facilitar seu dia a dia.",
    imagem: "/assetsLanding/Imagem-landing-02.png",
  },
  {
    titulo: "Home Office",
    descricao:
      "Ambiente ergonômico e produtivo com mesa, estante e organização para trabalhar em casa.",
    imagem: "/assetsLanding/Imagem-landing-03.png",
  },
  {
    titulo: "Closet",
    descricao:
      "Organização de roupas e acessórios com compartimentos personalizados para cada item.",
    imagem: "/assetsLanding/Imagem-landing-04.png",
  },
  {
    titulo: "Estante / Rack",
    descricao:
      "Móveis para sala com design exclusivo para livros, decoração e equipamentos.",
    imagem: "/assetsLanding/Imagem-landing-05.png",
  },
  {
    titulo: "Outros Sob Medida",
    descricao:
      "Projetos personalizados para qualquer ambiente: lavanderia, banheiro, despensa e mais.",
    imagem: "/assetsLanding/Imagem-landing-06.png",
  },
];

export default function Servicos() {
  return (
    <section id="servicos" className="bg-[#F5F0EB] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3D2519]">
            Nossos Serviços
          </h2>
          <p className="text-[#8B7A6B] max-w-2xl mx-auto">
            Criamos móveis planejados para transformar qualquer ambiente da sua
            casa ou empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICOS.map((servico) => (
            <div
              key={servico.titulo}
              className="bg-white rounded-xl overflow-hidden border border-[#D4C4B0] hover:shadow-md transition-shadow"
            >
              <Image
                src={servico.imagem}
                alt={servico.titulo}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#3D2519] mb-2">
                  {servico.titulo}
                </h3>
                <p className="text-sm text-[#8B7A6B]">{servico.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
