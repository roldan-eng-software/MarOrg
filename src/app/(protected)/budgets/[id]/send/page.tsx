"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";
import { uploadBudgetImage, deleteBudgetImage } from "@/modules/images/services/images.actions";
import type { BudgetImage } from "@/types";

export default function BudgetSendPage() {
  const params = useParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<BudgetImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDescription, setImageDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const budgetId = params.id as string;

  useEffect(() => {
    loadImages();
  }, [budgetId]);

  async function loadImages() {
    const { data } = await supabase
      .from("budget_images")
      .select("*")
      .eq("budget_id", budgetId)
      .order("sort_order");
    if (data) setImages(data);
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Selecione um arquivo de imagem", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Imagem deve ter no máximo 5MB", "error");
      return;
    }

    try {
      setUploadingImage(true);
      const newImage = await uploadBudgetImage(budgetId, file, imageDescription || undefined);
      setImages((prev) => [...prev, newImage]);
      setImageDescription("");
      showToast("Imagem enviada com sucesso", "success");
    } catch {
      showToast("Erro ao enviar imagem", "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteImage(imageId: string) {
    try {
      await deleteBudgetImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showToast("Imagem excluída", "success");
    } catch {
      showToast("Erro ao excluir imagem", "error");
    }
  }

  async function handleSendWhatsApp() {
    try {
      setLoading(true);

      const { data: budget } = await supabase
        .from("budgets")
        .select("*, customers(*)")
        .eq("id", budgetId)
        .single();

      if (!budget) {
        showToast("Erro ao carregar orçamento", "error");
        return;
      }

      const customer = budget.customers;
      const phone = customer.phone.replace(/\D/g, "");
      const pdfUrl = `${window.location.origin}/api/pdf/${budgetId}`;

      const text = encodeURIComponent(
        `Olá ${customer.full_name}! Segue o orçamento ${budget.budget_number} no valor de R$ ${budget.total_amount.toFixed(2)}.\n\nAcesse o PDF: ${pdfUrl}\n\nRoldan Marcenaria`
      );

      await supabase.from("communications").insert({
        channel: "whatsapp",
        recipient: phone,
        message: `Orçamento ${budget.budget_number} enviado via WhatsApp`,
        entity_type: "budget",
        entity_id: budgetId,
        status: "success",
        sent_by: "",
      });

      window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
      showToast("WhatsApp aberto com sucesso", "success");
      router.push("/budgets");
    } catch {
      showToast("Erro ao enviar", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendEmail() {
    if (!email) {
      showToast("Informe o e-mail", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/pdf/${budgetId}`);
      if (!response.ok) throw new Error("PDF generation failed");

      showToast("E-mail enviado com sucesso", "success");
      router.push("/budgets");
    } catch {
      showToast("Erro ao enviar e-mail", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">
        Enviar Orçamento
      </h1>

      {/* Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Imagens / Desenhos Técnicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#8B7A6B]">
            Adicione imagens ou desenhos técnicos que serão incluídos no PDF do orçamento.
          </p>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                id="image-desc"
                label="Descrição da imagem (opcional)"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Ex: Fachada do móvel"
              />
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadImage}
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Enviando..." : "Selecionar Imagem"}
              </Button>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative rounded border border-[#D4C4B0] bg-[#F5F0EB] p-2"
                >
                  <img
                    src={img.image_url}
                    alt={img.description || "Imagem do orçamento"}
                    className="mb-1 h-24 w-full rounded object-contain"
                  />
                  {img.description && (
                    <p className="text-center text-xs text-[#8B7A6B] truncate">
                      {img.description}
                    </p>
                  )}
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    title="Excluir imagem"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <div className="rounded border-2 border-dashed border-[#D4C4B0] p-8 text-center">
              <p className="text-sm text-[#8B7A6B]">
                Nenhuma imagem adicionada. Selecione uma imagem para incluir no PDF.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#8B7A6B]">
            Abre o WhatsApp com uma mensagem pré-formatada contendo o link do PDF.
          </p>
          <Button onClick={handleSendWhatsApp} disabled={loading} className="w-full">
            Enviar via WhatsApp
          </Button>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle>E-mail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="email"
            label="E-mail do cliente"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@email.com"
          />
          <Textarea
            id="message"
            label="Mensagem (opcional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Segue seu orçamento..."
          />
          <Button
            variant="secondary"
            onClick={handleSendEmail}
            disabled={loading}
            className="w-full"
          >
            Enviar via E-mail
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
