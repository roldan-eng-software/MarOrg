export default function Sobre() {
  return (
    <section id="sobre" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-8 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3D2519] text-center">
          Sobre a Roldan Marcenaria
        </h2>

        <div className="space-y-6 text-[#8B7A6B] leading-relaxed">
          <p>
            A Roldan Marcenaria nasceu em 2018, com o objetivo de transformar
            espaços por meio de móveis planejados que unem funcionalidade,
            estética e durabilidade. Desde o início, o foco foi oferecer um
            atendimento próximo e um trabalho artesanal, onde cada detalhe é
            pensado para atender às necessidades reais de quem vai usar o móvel
            no dia a dia.
          </p>

          <p>
            Com certificado do SENAI em construção de móveis planejados, todo o
            processo produtivo segue padrões técnicos que garantem encaixes
            precisos, acabamento impecável e longa vida útil aos projetos. Essa
            base técnica, somada à experiência prática, permite entregar soluções
            que realmente funcionam no ambiente do cliente.
          </p>

          <p>
            Ao longo desses anos, já foram entregues mais de 320 móveis, com
            clientes satisfeitos e muitos deles retornando para novos projetos ou
            indicando o trabalho para amigos e familiares. Esse resultado se
            reflete também na avaliação pública: a Roldan Marcenaria está entre
            as 5 primeiras colocações em satisfação nas buscas do Google Maps na
            região.
          </p>

          <p>
            O diferencial está no cuidado com os detalhes que fazem a diferença
            depois da instalação: alinhamento perfeito das portas, acabamentos
            bem feitos, ajustes finos no local e atenção a cada elemento visível
            e funcional do móvel. Cada projeto é tratado de forma dedicada e
            caprichosa, porque a ideia é que o cliente se sinta seguro e
            satisfeito por muitos anos.
          </p>
        </div>

        {/* Destaques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
          <div className="text-center p-6 rounded-xl bg-[#F5F0EB]">
            <p className="text-3xl font-bold text-[#5B3A29]">320+</p>
            <p className="text-sm text-[#8B7A6B] mt-2">Móveis entregues</p>
          </div>

          <div className="text-center p-6 rounded-xl bg-[#F5F0EB]">
            <p className="text-3xl font-bold text-[#5B3A29]">Top 5</p>
            <p className="text-sm text-[#8B7A6B] mt-2">
              Satisfação no Google Maps
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-[#F5F0EB]">
            <p className="text-3xl font-bold text-[#5B3A29]">SENAI</p>
            <p className="text-sm text-[#8B7A6B] mt-2">Certificado</p>
          </div>
        </div>
      </div>
    </section>
  );
}
