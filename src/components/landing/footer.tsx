import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#3D2519] text-[#D4C4B0] py-8">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-white">Roldan Marcenaria</p>
            <p className="text-sm mt-1">
              Móveis planejados sob medida desde 2018
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacidade" className="hover:text-white transition-colors">
              Privacidade
            </Link>
            <Link href="/contato" className="hover:text-white transition-colors">
              Contato
            </Link>
          </div>
        </div>

        <div className="border-t border-[#5B3A29] mt-6 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Roldan Marcenaria. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
