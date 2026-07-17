"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

export default function BudgetSendPage() {
  const params = useParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSendWhatsApp() {
    try {
      setLoading(true);

      const { data: budget } = await supabase
        .from("budgets")
        .select("*, customers(*)")
        .eq("id", params.id)
        .single();

      if (!budget) {
        showToast("Erro ao carregar orçamento", "error");
        return;
      }

      const customer = budget.customers;
      const phone = customer.phone.replace(/\D/g, "");
      const pdfUrl = `${window.location.origin}/api/pdf/${params.id}`;

      const text = encodeURIComponent(
        `Olá ${customer.full_name}! Segue o orçamento ${budget.budget_number} no valor de R$ ${budget.total_amount.toFixed(2)}.\n\nAcesse o PDF: ${pdfUrl}\n\nRoldan Marcenaria`
      );

      await supabase.from("communications").insert({
        channel: "whatsapp",
        recipient: phone,
        message: `Orçamento ${budget.budget_number} enviado via WhatsApp`,
        entity_type: "budget",
        entity_id: params.id as string,
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

      const response = await fetch(`/api/pdf/${params.id}`);
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
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">
        Enviar Orçamento
      </h1>

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
