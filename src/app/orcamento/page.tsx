"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  budgetRequestSchema,
  type BudgetRequestFormData,
} from "@/lib/validations/budget-request";

function showToast(message: string, type: "success" | "error") {
  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm font-medium shadow-lg transition-all " +
    (type === "success"
      ? "bg-green-600 text-white"
      : "bg-red-600 text-white");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

const MDF_OPTIONS = [
  { id: "mdf_branco", label: "MDF branco" },
  { id: "mdf_madeira", label: "MDF cor madeira" },
  { id: "mdf_escura", label: "MDF cor escura" },
  { id: "laca", label: "Laca" },
  { id: "nao_sei", label: "Não sei / Quero sugestão" },
];

const HARDWARE_OPTIONS = [
  { id: "soft_close", label: "Dobradiças/corrediças soft-close" },
  { id: "inox", label: "Puxadores em aço inox" },
  { id: "iluminacao", label: "Iluminação interna" },
  { id: "sem_preferencia", label: "Não tenho preferência" },
];

const FURNITURE_TYPES = [
  "Cozinha planejada",
  "Guarda-roupa",
  "Home office",
  "Closet",
  "Estante / Rack",
  "Outro",
];

const BUDGET_RANGES = [
  "Prefiro não informar",
  "Até R$ 3.000",
  "R$ 3.000 – R$ 8.000",
  "R$ 8.000 – R$ 15.000",
  "Acima de R$ 15.000",
  "Prefiro receber a sugestão",
];

export default function OrcamentoPage() {
  const [showDialog, setShowDialog] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [protocolo, setProtocolo] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BudgetRequestFormData>({
    resolver: zodResolver(budgetRequestSchema),
    defaultValues: {
      canal_preferido: "whatsapp",
      materiais: [],
      ferragens: [],
      projeto_3d: false,
      visita_tecnica: false,
    },
  });

  const tipoMovel = watch("tipo_movel");
  const projeto3d = watch("projeto_3d");

  async function onSubmit(data: BudgetRequestFormData) {
    try {
      setLoading(true);

      const response = await fetch("/api/budget-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao enviar");
      }

      const result = await response.json();
      setProtocolo(result.protocolo);
      setSuccess(true);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao enviar pedido",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAddFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newFotos = [...fotos];
    for (let i = 0; i < files.length && newFotos.length < 3; i++) {
      const file = files[i];
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      newFotos.push(file);
    }
    setFotos(newFotos);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center p-4">
        <div className="mx-auto max-w-md text-center space-y-6">
          <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#3D2519]">Pedido recebido!</h1>
          <p className="text-[#8B7A6B]">
            Seu pedido de orçamento foi registrado com sucesso. Entraremos em contato em breve.
          </p>
          <div className="rounded-md bg-[#D4C4B0]/30 border border-[#D4C4B0] p-4">
            <p className="text-sm text-[#8B7A6B]">Seu protocolo</p>
            <p className="text-xl font-bold text-[#5B3A29]">{protocolo}</p>
          </div>
          <p className="text-xs text-[#8B7A6B]">
            Guarde este número para acompanhar seu pedido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">

      {/* Header */}
      <header className="bg-[#5B3A29] text-white px-4 md:px-8">
        <nav className="mx-auto max-w-5xl flex items-center justify-between h-16">
          <span className="font-semibold text-lg">Roldan Marcenaria</span>
          <div className="flex items-center gap-4 text-sm">
            <a href="/privacidade" className="hover:underline">Privacidade</a>
            <a href="/contato" className="hover:underline">Contato</a>
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-4">
          <p className="text-sm text-[#8B7A6B] uppercase tracking-wide">Móveis planejados sob medida</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D2519]">
            Conte o que você precisa e receba um retorno organizado do marceneiro.
          </h1>
          <p className="text-[#8B7A6B] max-w-2xl mx-auto">
            Substitua conversas soltas por um pedido de orçamento com protocolo e todas as informações para iniciar uma avaliação manual.
          </p>
        </section>

        {/* Checklist */}
        <section className="rounded-xl border border-[#D4C4B0] bg-white p-6 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-[#3D2519] mb-3">Tenha em mãos</h2>
          <ul className="list-disc pl-5 text-[#8B7A6B] space-y-1">
            <li>Tipo de móvel planejado</li>
            <li>Medidas aprovadas em centímetros</li>
            <li>Preferências de material e acabamento</li>
            <li>Contato por e-mail ou WhatsApp</li>
          </ul>
        </section>

        {/* Form */}
        <section className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-[#3D2519] mb-6 text-center">Solicite seu orçamento</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact */}
            <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D2519] mb-1">Nome completo</label>
                  <input
                    {...register("nome")}
                    className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                    placeholder="Nome completo"
                  />
                  {errors.nome && (
                    <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D2519] mb-1">E-mail</label>
                  <input
                    {...register("email")}
                    className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                    placeholder="E-mail"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D2519] mb-1">WhatsApp</label>
                  <input
                    {...register("whatsapp")}
                    className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                    placeholder="(11) 90000-0000"
                  />
                  {errors.whatsapp && (
                    <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D2519] mb-1">Canal preferido</label>
                  <select
                    {...register("canal_preferido")}
                    className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] focus:border-[#5B3A29] focus:outline-none"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                  </select>
                  {errors.canal_preferido && (
                    <p className="text-xs text-red-500 mt-1">{errors.canal_preferido.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Furniture */}
            <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D2519] mb-1">Tipo de móvel</label>
                  <select
                    {...register("tipo_movel")}
                    className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] focus:border-[#5B3A29] focus:outline-none"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    {FURNITURE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_movel && (
                    <p className="text-xs text-red-500 mt-1">{errors.tipo_movel.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D2519] mb-1">
                    Se escolheu Outro, descreva
                  </label>
                  <input
                    {...register("tipo_movel_outro")}
                    className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                    disabled={tipoMovel !== "Outro"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2519] mb-1">Ambiente de instalação</label>
                <input
                  {...register("ambiente")}
                  className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                  placeholder="Quarto do casal"
                />
                {errors.ambiente && (
                  <p className="text-xs text-red-500 mt-1">{errors.ambiente.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2519] mb-2">Medidas (cm)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#8B7A6B] mb-1">Largura</label>
                    <input
                      type="number"
                      {...register("largura_cm")}
                      className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                    />
                    {errors.largura_cm && (
                      <p className="text-xs text-red-500 mt-1">{errors.largura_cm.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#8B7A6B] mb-1">Altura</label>
                    <input
                      type="number"
                      {...register("altura_cm")}
                      className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                    />
                    {errors.altura_cm && (
                      <p className="text-xs text-red-500 mt-1">{errors.altura_cm.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#8B7A6B] mb-1">Profundidade</label>
                    <input
                      type="number"
                      {...register("profundidade_cm")}
                      className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                    />
                    {errors.profundidade_cm && (
                      <p className="text-xs text-red-500 mt-1">{errors.profundidade_cm.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Materials */}
            <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-3">
              <label className="block text-sm font-semibold text-[#3D2519]">Material / acabamento</label>
              {MDF_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 text-sm text-[#3D2519] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={opt.label}
                    {...register("materiais")}
                    className="accent-[#5B3A29]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* Hardware */}
            <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-3">
              <label className="block text-sm font-semibold text-[#3D2519]">Preferências de ferragens</label>
              {HARDWARE_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 text-sm text-[#3D2519] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={opt.label}
                    {...register("ferragens")}
                    className="accent-[#5B3A29]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* Additional Desc + Budget Range */}
            <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2519] mb-1">Descrição adicional</label>
                <textarea
                  {...register("descricao")}
                  className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] placeholder:text-[#8B7A6B] focus:border-[#5B3A29] focus:outline-none"
                  rows={3}
                  placeholder="Descreva seu projeto em detalhes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D2519] mb-1">Faixa de orçamento</label>
                <select
                  {...register("faixa_orcamento")}
                  className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519] focus:border-[#5B3A29] focus:outline-none"
                >
                  {BUDGET_RANGES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3D Project + Visit */}
            <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-4">
              <label className="block text-sm font-semibold text-[#3D2519]">Projeto e visita técnica</label>
              <label className="flex items-center gap-2 text-sm text-[#3D2519] cursor-pointer">
                <input
                  type="checkbox"
                  {...register("projeto_3d")}
                  className="accent-[#5B3A29]"
                />
                Projeto 3D técnico
              </label>
              <label
                className={`flex items-center gap-2 text-sm cursor-pointer ${
                  projeto3d ? "text-[#3D2519]" : "text-[#8B7A6B] cursor-not-allowed"
                }`}
              >
                <input
                  type="checkbox"
                  {...register("visita_tecnica")}
                  disabled={!projeto3d}
                  className="accent-[#5B3A29]"
                />
                Solicitar visita técnica
              </label>
              <p className="text-xs text-[#8B7A6B]">
                A visita técnica só é permitida se contratar o projeto 3D técnico.
              </p>
            </div>

            {/* Photos */}
            <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-3">
              <label className="block text-sm font-medium text-[#3D2519]">Fotos do ambiente (opcional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAddFotos}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={fotos.length >= 3}
                className="w-full rounded border-2 border-dashed border-[#D4C4B0] p-4 text-sm text-[#8B7A6B] hover:border-[#5B3A29] hover:text-[#5B3A29] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fotos.length === 0
                  ? "Adicionar fotos"
                  : `Adicionar mais (${3 - fotos.length} restantes)`}
              </button>
              <p className="text-xs text-[#8B7A6B]">Até 3 imagens, JPG/PNG/WEBP, até 5 MB cada.</p>
              {fotos.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {fotos.map((foto, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto ${i + 1}`}
                        className="h-20 w-20 rounded object-cover border border-[#D4C4B0]"
                      />
                      <button
                        type="button"
                        onClick={() => removeFoto(i)}
                        className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white h-5 w-5 flex items-center justify-center text-xs"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy + Submit */}
            <div className="rounded-xl border border-[#D4C4B0] bg-white p-6 space-y-4">
              <label className="flex items-start gap-2 text-sm text-[#3D2519] cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#5B3A29] mt-0.5"
                  onChange={(e) => {
                    const input = document.querySelector('[name="privacidade"]') as HTMLInputElement;
                    if (input) input.value = String(e.target.checked);
                  }}
                />
                <span>
                  Concordo com a Política de Privacidade e autorizo o uso dos meus dados para
                  elaboração do orçamento.
                </span>
              </label>
              {errors.privacidade && (
                <p className="text-xs text-red-500">{errors.privacidade.message}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#5B3A29] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3D2519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar pedido de orçamento"}
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Dialog de consentimento */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-[#3D2519]">Antes de solicitar seu orçamento</h2>
            <div className="text-sm text-[#8B7A6B] space-y-2">
              <p>
                Atuamos exclusivamente com móveis planejados novos, personalizados e de médio e alto
                padrão.
              </p>
              <p>
                Não realizamos reformas, consertos, manutenção de móveis antigos, cortes de chapa,
                peças avulsas de MDF, serviços de madeira maciça, uso de MDF de baixa qualidade
                ou instalação de móveis adquiridos pela internet.
              </p>
            </div>
            <button
              onClick={() => setShowDialog(false)}
              className="w-full rounded-lg bg-[#5B3A29] px＝4 py-2 text-sm font-medium text-white hover:bg-[#3A2519] transition-colors"
            >
              Entendo o que não pedir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}