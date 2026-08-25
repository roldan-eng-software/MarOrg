const SERVICOS = [
  {
    titulo: "Cozinha Planejada",
    descricao:
      "Armários, gavetas, ilhas e nichos projetados para otimizar cada centímetro da sua cozinha.",
    icone: (
      <svg
        className="w-10 h-10 text-[#5B3A29]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    titulo: "Guarda-Roupa",
    descricao:
      "Closet planejado com organização interna pensada para facilitar seu dia a dia.",
    icone: (
      <svg
        className="w-10 h-10 text-[#5B3A29]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
  },
  {
    titulo: "Home Office",
    descricao:
      "Ambiente ergonômico e produtivo com mesa, estante e organização para trabalhar em casa.",
    icone: (
      <svg
        className="w-10 h-10 text-[#5B3A29]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    titulo: "Closet",
    descricao:
      "Organização de roupas e acessórios com compartimentos personalizados para cada item.",
    icone: (
      <svg
        className="w-10 h-10 text-[#5B3A29]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    titulo: "Estante / Rack",
    descricao:
      "Móveis para sala com design exclusivo para livros, decoração e equipamentos.",
    icone: (
      <svg
        className="w-10 h-10 text-[#5B3A29]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    titulo: "Outros Sob Medida",
    descricao:
      "Projetos personalizados para qualquer ambiente: lavanderia, banheiro, despensa e mais.",
    icone: (
      <svg
        className="w-10 h-10 text-[#5B3A29]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
        />
      </svg>
    ),
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
              className="bg-white rounded-xl p-6 border border-[#D4C4B0] hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{servico.icone}</div>
              <h3 className="text-lg font-semibold text-[#3D2519] mb-2">
                {servico.titulo}
              </h3>
              <p className="text-sm text-[#8B7A6B]">{servico.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
