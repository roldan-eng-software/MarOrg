import Link from "next/link";
import { getPublicCompanySettings } from "@/modules/documents/services/company-settings";

export const metadata = {
  title: "Contato — Roldan Marcenaria",
};

export default async function ContatoPage() {
  const settings = await getPublicCompanySettings();

  const hasPhone = settings.company_phone.length > 0;
  const hasEmail = settings.company_email.length > 0;
  const hasAddress = settings.company_address.length > 0;

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

        <h1 className="text-3xl font-bold text-[#3D2519]">Contato</h1>
        <p className="text-[#8B7A6B]">
          Fale com a {settings.company_name}. Retornamos o mais rápido possível.
        </p>

        <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-6">
          {!hasPhone && !hasEmail && !hasAddress && (
            <p className="text-sm text-[#8B7A6B]">
              As informações de contato ainda não foram cadastradas. Tente novamente em breve.
            </p>
          )}

          {hasPhone && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Telefone / WhatsApp</p>
              <a
                href={`tel:${settings.company_phone.replace(/\D/g, "")}`}
                className="text-[#5B3A29] underline"
              >
                {settings.company_phone}
              </a>
            </div>
          )}

          {hasEmail && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">E-mail</p>
              <a
                href={`mailto:${settings.company_email}`}
                className="text-[#5B3A29] underline"
              >
                {settings.company_email}
              </a>
            </div>
          )}

          {hasAddress && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Endereço</p>
              <p className="text-[#8B7A6B]">{settings.company_address}</p>
            </div>
          )}

          {settings.company_cnpj && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">CNPJ</p>
              <p className="text-[#8B7A6B]">{settings.company_cnpj}</p>
            </div>
          )}
        </div>

        <Link href="/orcamento" className="inline-block rounded-lg bg-[#5B3A29] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3D2519] transition-colors">
          Solicitar orçamento
        </Link>
      </main>
    </div>
  );
}
