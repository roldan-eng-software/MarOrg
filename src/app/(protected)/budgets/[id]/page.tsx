"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils/format";
import type { Budget, BudgetItem, Customer, BudgetImage } from "@/types";

type BudgetWithRelations = Budget & {
  customers: Customer;
  items: BudgetItem[];
};

const statusLabels: Record<Budget["status"], string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
  vencido: "Vencido",
  revisado: "Revisado",
};

const statusVariants: Record<
  Budget["status"],
  "default" | "success" | "warning" | "danger" | "info"
> = {
  rascunho: "default",
  enviado: "info",
  em_analise: "warning",
  aprovado: "success",
  recusado: "danger",
  vencido: "danger",
  revisado: "info",
};

const paymentTypeLabels: Record<string, string> = {
  pix: "PIX",
  credit: "Crédito",
  debit: "Débito",
  boleto: "Boleto",
  cash: "Dinheiro",
  transfer: "Transferência",
};

export default function BudgetViewPage() {
  const params = useParams();
  const router = useRouter();
  const [budget, setBudget] = useState<BudgetWithRelations | null>(null);
  const [images, setImages] = useState<BudgetImage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const budgetId = params.id as string;

  useEffect(() => {
    loadBudget();
  }, [budgetId]);

  async function loadBudget() {
    try {
      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .select("*, customers(*)")
        .eq("id", budgetId)
        .single();

      if (budgetError) throw budgetError;

      const { data: itemsData } = await supabase
        .from("budget_items")
        .select("*")
        .eq("budget_id", budgetId)
        .order("sort_order");

      const { data: imagesData } = await supabase
        .from("budget_images")
        .select("*")
        .eq("budget_id", budgetId)
        .order("sort_order");

      setBudget({
        ...budgetData,
        items: itemsData || [],
        customers: budgetData.customers as Customer,
      } as BudgetWithRelations);

      setImages(imagesData || []);
    } catch {
      showToast("Erro ao carregar orçamento", "error");
      router.push("/budgets");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadPdf() {
    window.open(`/api/pdf/${budgetId}`, "_blank");
  }

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  if (!budget) {
    return <p className="py-8 text-center text-[#8B7A6B]">Orçamento não encontrado</p>;
  }

  const customer = budget.customers;
  const subtotal = budget.items.reduce((sum, item) => sum + item.total_price, 0);
  const totalDiscount = budget.items.reduce((sum, item) => sum + item.discount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2519]">
            {budget.budget_number}
          </h1>
          <p className="text-sm text-[#8B7A6B]">
            Criado em {formatDate(budget.created_at)}
            {budget.sent_at && ` · Enviado em ${formatDate(budget.sent_at)}`}
            {budget.approved_at && ` · Aprovado em ${formatDate(budget.approved_at)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[budget.status]}>
            {statusLabels[budget.status]}
          </Badge>
          <Button variant="secondary" onClick={handleDownloadPdf}>
            Baixar PDF
          </Button>
          <Link href={`/budgets/${budgetId}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Link href={`/budgets/${budgetId}/send`}>
            <Button>Enviar</Button>
          </Link>
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[#8B7A6B]">Nome</p>
              <p className="font-medium text-[#3D2519]">{customer.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-[#8B7A6B]">Telefone</p>
              <p className="font-medium text-[#3D2519]">{formatPhone(customer.phone)}</p>
            </div>
            {customer.email && (
              <div>
                <p className="text-sm text-[#8B7A6B]">E-mail</p>
                <p className="font-medium text-[#3D2519]">{customer.email}</p>
              </div>
            )}
            {customer.cpf_cnpj && (
              <div>
                <p className="text-sm text-[#8B7A6B]">CPF/CNPJ</p>
                <p className="font-medium text-[#3D2519]">{customer.cpf_cnpj}</p>
              </div>
            )}
            {customer.address_street && (
              <div className="sm:col-span-2">
                <p className="text-sm text-[#8B7A6B]">Endereço</p>
                <p className="font-medium text-[#3D2519]">
                  {customer.address_street}
                  {customer.address_number && `, ${customer.address_number}`}
                  {customer.address_complement && ` - ${customer.address_complement}`}
                  {customer.address_neighborhood && ` - ${customer.address_neighborhood}`}
                  {customer.address_city && ` - ${customer.address_city}/${customer.address_state}`}
                  {customer.address_zip && ` - CEP: ${customer.address_zip}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens ({budget.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D4C4B0]">
                  <th className="py-2 text-left text-xs text-[#8B7A6B]">Descrição</th>
                  <th className="py-2 text-left text-xs text-[#8B7A6B] hidden sm:table-cell">Material</th>
                  <th className="py-2 text-left text-xs text-[#8B7A6B] hidden md:table-cell">Dimensões</th>
                  <th className="py-2 text-left text-xs text-[#8B7A6B] hidden sm:table-cell">Acabamento</th>
                  <th className="py-2 text-right text-xs text-[#8B7A6B]">Qtd</th>
                  <th className="py-2 text-right text-xs text-[#8B7A6B]">Valor Unit.</th>
                  <th className="py-2 text-right text-xs text-[#8B7A6B]">Total</th>
                </tr>
              </thead>
              <tbody>
                {budget.items.map((item) => (
                  <tr key={item.id} className="border-b border-[#F5F0EB]">
                    <td className="py-3">
                      <p className="font-medium text-[#3D2519]">{item.description}</p>
                      <p className="text-xs text-[#8B7A6B] capitalize">{item.item_type}</p>
                    </td>
                    <td className="py-3 text-[#8B7A6B] hidden sm:table-cell">{item.material || "-"}</td>
                    <td className="py-3 text-[#8B7A6B] hidden md:table-cell">
                      {item.width_cm && item.depth_cm && item.height_cm
                        ? `${item.width_cm} x ${item.depth_cm} x ${item.height_cm} cm`
                        : "-"}
                    </td>
                    <td className="py-3 text-[#8B7A6B] hidden sm:table-cell">{item.finish || "-"}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-right font-semibold text-[#3D2519]">
                      {formatCurrency(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 border-t border-[#D4C4B0] pt-4">
            <div className="flex justify-end space-y-2">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B7A6B]">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B7A6B]">Desconto</span>
                    <span className="text-red-600">-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#D4C4B0] pt-2 text-lg font-bold">
                  <span className="text-[#3D2519]">Total</span>
                  <span className="text-[#3D2519]">{formatCurrency(budget.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      {(budget.payment_conditions || budget.payment_types?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Condições de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budget.payment_types && budget.payment_types.length > 0 && (
              <div>
                <p className="text-sm text-[#8B7A6B]">Formas de Pagamento</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {budget.payment_types.map((type) => (
                    <Badge key={type} variant="default">
                      {paymentTypeLabels[type] || type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {budget.payment_conditions && (
              <div>
                <p className="text-sm text-[#8B7A6B]">Condições</p>
                <p className="text-[#3D2519]">{budget.payment_conditions}</p>
              </div>
            )}
            {budget.payment_installments && budget.payment_installments.length > 0 && (
              <div>
                <p className="text-sm text-[#8B7A6B]">Parcelamento</p>
                <div className="mt-1 space-y-1">
                  {budget.payment_installments.map((installment, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[#8B7A6B]">{installment.installment}ª parcela - {installment.description}</span>
                      <span className="font-medium text-[#3D2519]">{installment.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {(budget.notes_client || budget.notes_internal) && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budget.notes_client && (
              <div>
                <p className="text-sm text-[#8B7A6B]">Observações para o Cliente</p>
                <p className="text-[#3D2519] whitespace-pre-wrap">{budget.notes_client}</p>
              </div>
            )}
            {budget.notes_internal && (
              <div>
                <p className="text-sm text-[#8B7A6B]">Observações Internas</p>
                <p className="text-[#3D2519] whitespace-pre-wrap">{budget.notes_internal}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imagens / Desenhos Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img) => (
                <div key={img.id} className="rounded border border-[#D4C4B0] bg-[#F5F0EB] p-2">
                  <img
                    src={img.image_url}
                    alt={img.description || "Imagem do orçamento"}
                    className="h-32 w-full rounded object-contain"
                  />
                  {img.description && (
                    <p className="mt-1 text-center text-xs text-[#8B7A6B] truncate">
                      {img.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[#8B7A6B]">Validade</p>
              <p className="font-medium text-[#3D2519]">{budget.validity_days} dias</p>
            </div>
            <div>
              <p className="text-[#8B7A6B]">Prazo de Entrega</p>
              <p className="font-medium text-[#3D2519]">{budget.delivery_days} dias</p>
            </div>
            <div>
              <p className="text-[#8B7A6B]">Versão</p>
              <p className="font-medium text-[#3D2519]">v{budget.version}</p>
            </div>
            <div>
              <p className="text-[#8B7A6B]">Criado em</p>
              <p className="font-medium text-[#3D2519]">{formatDate(budget.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
