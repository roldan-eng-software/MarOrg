import Link from "next/link";
import { getPublicCompanySettings } from "@/modules/documents/services/company-settings";

export const metadata = {
  title: "Política de Privacidade — Roldan Marcenaria",
};

export default async function PrivacidadePage() {
  const settings = await getPublicCompanySettings();

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <header className="bg-[#5B3A29] text-white px-4 md:px-8">
        <nav className="mx-auto max-w-3xl flex items-center justify-between h-16">
          <span className="font-semibold text-lg">Roldan Marcenaria</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacidade" className="hover:underline">Privacidade</Link>
            <Link href="/contato" className="hover:underline">Contato</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <Link href="/orcamento" className="text-sm text-[#8B7A6B] hover:underline">
          ← Voltar ao formulário
        </Link>

        <h1 className="text-3xl font-bold text-[#3D2519]">Política de Privacidade</h1>

        <section className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-6 text-[#8B7A6B] leading-relaxed text-sm">
          <div>
            <h2 className="text-base font-semibold text-[#3D2519] mb-2">
              Controlador dos dados
            </h2>
            <p>
              A {settings.company_name} é a responsável pelo tratamento dos dados pessoais
              coletados através do formulário de orçamento disponível em nosso site.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#3D2519] mb-2">
              Dados coletados
            </h2>
            <p>Ao utilizar o formulário de orçamento, coletamos as seguintes informações:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Nome completo;</li>
              <li>E-mail e/ou WhatsApp para contato;</li>
              <li>Dados do projeto: tipo de móvel, ambiente, medidas e preferências de materiais e ferragens;</li>
              <li>Fotos do ambiente (quando enviadas);</li>
              <li>Informações complementares fornecidas voluntariamente.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#3D2519] mb-2">
              Finalidade do tratamento
            </h2>
            <p>
              Os dados coletados são utilizados exclusivamente para a elaboração do orçamento
              solicitado e para o atendimento do pedido, incluindo o contato para esclarecimentos
              e o envio da proposta comercial.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#3D2519] mb-2">
              Compartilhamento de dados
            </h2>
            <p>
              Não compartilhamos, vendemos ou disponibilizamos seus dados pessoais a terceiros
              para fins de marketing. As informações são acessadas apenas pela equipe da empresa
              para o atendimento do seu pedido.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#3D2519] mb-2">
              Armazenamento e segurança
            </h2>
            <p>
              Os dados são armazenados em ambiente seguro com controles de acesso, de acordo com
              as boas práticas de segurança da informação, pelo tempo necessário à finalidade do
              tratamento ou prazo legal aplicável.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#3D2519] mb-2">
              Direitos do titular (LGPD)
            </h2>
            <p>
              Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode
              solicitar a qualquer momento o acesso, a correção, a portabilidade e a exclusão
              dos seus dados pessoais. Para exercer seus direitos, entre em contato conosco
              através da página de{" "}
              <Link href="/contato" className="text-[#5B3A29] underline">contato</Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
