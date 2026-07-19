"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import {
  getServiceOrder,
  linkMaterialToOrderItem,
  unlinkMaterialFromOrderItem,
  getServiceOrderItemMaterials,
} from "@/modules/service-orders/services/service-orders.actions";
import { registerMovement, listMaterials } from "@/modules/inventory/services/inventory.actions";
import type { ServiceOrder, ServiceOrderItem, Customer, Material, ServiceOrderItemMaterial } from "@/types";

type OrderData = ServiceOrder & {
  customers: Customer;
  budgets: { budget_number: string; notes_client: string | null };
  items: ServiceOrderItem[];
};

type MaterialLink = ServiceOrderItemMaterial & { materials: Material };

interface ItemWithMeta extends ServiceOrderItem {
  linkedMaterials: MaterialLink[];
  consumedQty: number;
}

export default function ProductionPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemWithMeta[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const [linkingItemId, setLinkingItemId] = useState<string | null>(null);
  const [linkingMaterialId, setLinkingMaterialId] = useState("");
  const [linkingQuantity, setLinkingQuantity] = useState<number>(0);
  const [linking, setLinking] = useState(false);

  const [consumptionValues, setConsumptionValues] = useState<Record<string, number>>({});

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  async function loadOrder() {
    try {
      const data = await getServiceOrder(params.id as string);
      setOrder(data as OrderData);

      const mats = await listMaterials();
      setMaterials(mats);

      const itemsWithMeta: ItemWithMeta[] = await Promise.all(
        data.items.map(async (item) => {
          const linked = await getServiceOrderItemMaterials(item.id);
          return {
            ...item,
            linkedMaterials: linked as MaterialLink[],
            consumedQty: 0,
          };
        })
      );

      setItems(itemsWithMeta);
    } catch {
      showToast("Erro ao carregar ordem de serviço", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleConsume(linkId: string, materialId: string, materialName: string, unit: string, maxQty: number) {
    const key = `consume-${linkId}`;
    const qty = consumptionValues[key];
    if (!qty || qty <= 0) {
      showToast("Informe uma quantidade válida", "error");
      return;
    }

    if (qty > maxQty) {
      showToast(`Quantidade excede o vinculado (${maxQty})`, "error");
      return;
    }

    try {
      setSubmitting(linkId);

      const material = materials.find((m) => m.id === materialId);
      if (!material) {
        showToast("Material não encontrado no estoque", "error");
        return;
      }

      if (Number(material.current_stock) < qty) {
        showToast(`Estoque insuficiente. Disponível: ${material.current_stock} ${material.unit}`, "error");
        return;
      }

      await registerMovement({
        material_id: materialId,
        movement_type: "saida",
        quantity: qty,
        reason: `Consumo produção - OS ${order?.order_number}`,
        reference_type: "service_order",
        reference_id: order?.id,
      });

      setItems((prev) =>
        prev.map((it) => {
          const updatedLinked = it.linkedMaterials.map((lm) =>
            lm.id === linkId ? { ...lm, quantity: Number(lm.quantity) - qty } : lm
          );
          return { ...it, linkedMaterials: updatedLinked };
        })
      );

      setConsumptionValues((prev) => ({ ...prev, [key]: 0 }));

      const updatedMats = await listMaterials();
      setMaterials(updatedMats);

      showToast(`${qty} ${unit} de ${materialName} consumido`, "success");
    } catch {
      showToast("Erro ao registrar consumo", "error");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleLinkMaterial(itemId: string) {
    if (!linkingMaterialId) {
      showToast("Selecione um material", "error");
      return;
    }
    if (!linkingQuantity || linkingQuantity <= 0) {
      showToast("Informe uma quantidade válida", "error");
      return;
    }

    try {
      setLinking(true);
      await linkMaterialToOrderItem(itemId, linkingMaterialId, linkingQuantity);

      const mat = materials.find((m) => m.id === linkingMaterialId);

      await loadOrder();

      setLinkingItemId(null);
      setLinkingMaterialId("");
      setLinkingQuantity(0);

      showToast(`Material ${mat?.name || ""} vinculado com sucesso`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao vincular material";
      showToast(message, "error");
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlinkMaterial(linkId: string) {
    try {
      setSubmitting(linkId);
      await unlinkMaterialFromOrderItem(linkId);

      await loadOrder();

      showToast("Vínculo removido e estoque estornado", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover vínculo";
      showToast(message, "error");
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  if (!order) {
    return <p className="py-8 text-center text-red-500">Ordem de serviço não encontrada</p>;
  }

  const mobiliarioItems = items.filter((it) => it.item_type === "mobiliario");
  const serviceItems = items.filter((it) => it.item_type === "servico");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#3D2519]">
            Produção - {order.order_number}
          </h1>
          <p className="text-sm text-[#8B7A6B]">
            Cliente: {order.customers.full_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">{order.status === "pendente" ? "Pendente" : order.status === "em_producao" ? "Em Produção" : order.status}</Badge>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </div>

      {mobiliarioItems.map((item) => (
        <Card key={item.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{item.description}</CardTitle>
              <p className="text-xs text-[#8B7A6B] mt-1">
                {item.quantity} {item.unit} — {item.finish && `Acabamento: ${item.finish}`}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setLinkingItemId(linkingItemId === item.id ? null : item.id);
                setLinkingMaterialId("");
                setLinkingQuantity(0);
              }}
            >
              {linkingItemId === item.id ? "Cancelar" : "+ Material"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {item.linkedMaterials.length > 0 ? (
              item.linkedMaterials.map((lm) => {
                const mat = lm.materials;
                const remaining = Number(lm.quantity);
                const currentStock = mat ? Number(mat.current_stock) : 0;
                const consumeKey = `consume-${lm.id}`;

                return (
                  <div key={lm.id} className="rounded border border-[#D4C4B0] p-3 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#3D2519]">{mat?.name || "Material"}</p>
                        <div className="flex items-center gap-3 text-xs text-[#8B7A6B] mt-1">
                          <span>
                            Vinculado: <span className="font-semibold text-[#3D2519]">{remaining} {mat?.unit}</span>
                          </span>
                          <span>
                            Estoque: <span className={currentStock < remaining ? "text-red-600 font-semibold" : "text-[#3D2519]"}>{currentStock} {mat?.unit}</span>
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleUnlinkMaterial(lm.id)}
                        disabled={submitting === lm.id}
                      >
                        {submitting === lm.id ? "..." : "Remover"}
                      </Button>
                    </div>

                    {remaining > 0 && mat && (
                      <div className="flex items-end gap-3">
                        <div className="w-32">
                          <Input
                            id={consumeKey}
                            label="Qtd a consumir"
                            type="number"
                            step="0.001"
                            min="0"
                            max={remaining}
                            value={consumptionValues[consumeKey] || ""}
                            onChange={(e) =>
                              setConsumptionValues((prev) => ({
                                ...prev,
                                [consumeKey]: Number(e.target.value),
                              }))
                            }
                            placeholder="0"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleConsume(lm.id, lm.material_id, mat.name, mat.unit, remaining)}
                          disabled={submitting === lm.id || !consumptionValues[consumeKey]}
                        >
                          {submitting === lm.id ? "Registrando..." : "Consumir"}
                        </Button>
                      </div>
                    )}

                    {remaining <= 0 && (
                      <p className="text-sm text-green-700 bg-green-50 rounded px-3 py-2">
                        Totalmente consumido.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#8B7A6B] italic">Nenhum material vinculado a este item.</p>
            )}

            {linkingItemId === item.id && (
              <div className="rounded border border-dashed border-[#5B3A29] bg-[#FAF7F4] p-4 space-y-3">
                <p className="text-sm font-medium text-[#3D2519]">Vincular novo material</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#8B7A6B] mb-1 block">Material do estoque</label>
                    <select
                      value={linkingMaterialId}
                      onChange={(e) => setLinkingMaterialId(e.target.value)}
                      className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519]"
                    >
                      <option value="">Selecione...</option>
                      {materials.map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.name} — {mat.current_stock} {mat.unit} disponível
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      id={`link-qty-${item.id}`}
                      label="Quantidade"
                      type="number"
                      step="0.001"
                      min="0"
                      value={linkingQuantity || ""}
                      onChange={(e) => setLinkingQuantity(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleLinkMaterial(item.id)}
                    disabled={linking || !linkingMaterialId || !linkingQuantity}
                  >
                    {linking ? "Vinculando..." : "Confirmar Vínculo"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setLinkingItemId(null);
                      setLinkingMaterialId("");
                      setLinkingQuantity(0);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {serviceItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {serviceItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded border border-[#D4C4B0] p-3">
                  <div>
                    <p className="text-sm font-medium text-[#3D2519]">{item.description}</p>
                    <p className="text-xs text-[#8B7A6B]">{item.quantity} {item.unit}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#3D2519]">{formatCurrency(item.total_price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {mobiliarioItems.length === 0 && serviceItems.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-[#8B7A6B]">
            Nenhum item encontrado nesta OS.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
