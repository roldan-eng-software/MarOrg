const PROJETOS = [
  {
    titulo: "Cozinha Moderna",
    descricao:
      "Planejamento completo com ilha, armários elevados e organização inteligente de utensílios.",
    cor: "bg-[#D4C4B0]",
  },
  {
    titulo: "Quarto com Guarda-Roupa",
    descricao:
      "Organização e funcionalidade com gavetas internas, cabideiros e prateleiras ajustáveis.",
    cor: "bg-[#E4D4C0]",
  },
  {
    titulo: "Home Office Produtivo",
    descricao:
      "Ambiente ergonômico com mesa ampla, estante organizada e iluminação integrada.",
    cor: "bg-[#D4C4B0]",
  },
  {
    titulo: "Closet Planejado",
    descricao:
      "Organização de roupas e acessórios com compartimentos para cada tipo de peça.",
    cor: "bg-[#E4D4C0]",
  },
  {
    titulo: "Estante para Sala",
    descricao:
      "Design exclusivo para livros e decoração, com iluminação e acabamento premium.",
    cor: "bg-[#D4C4B0]",
  },
  {
    titulo: "Ambiente Personalizado",
    descricao:
      "Projetos sob medida para qualquer cômodo: lavanderia, banheiro, despensa e mais.",
    cor: "bg-[#E4D4C0]",
  },
];

export default function Galeria() {
  return (
    <section id="galeria" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3D2519]">
            Nossos Trabalhos
          </h2>
          <p className="text-[#8B7A6B] max-w-2xl mx-auto">
            Conheça alguns dos projetos que já realizamos para nossos clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJETOS.map((projeto) => (
            <div
              key={projeto.titulo}
              className={`${projeto.cor} rounded-xl p-6 border border-[#D4C4B0] hover:shadow-md transition-shadow`}
            >
              <div className="aspect-[4/3] rounded-lg bg-white/50 flex items-center justify-center mb-4">
                <svg
                  className="w-16 h-16 text-[#8B7A6B]/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-[#3D2519] mb-2">
                {projeto.titulo}
              </h3>
              <p className="text-sm text-[#8B7A6B]">{projeto.descricao}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-[#8B7A6B]">
            Em breve, imagens reais dos nossos projetos.
          </p>
        </div>
      </div>
    </section>
  );
}
