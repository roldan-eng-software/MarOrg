"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import { getServiceOrder, linkMaterialToOrderItem } from "@/modules/service-orders/services/service-orders.actions";
import { registerMovement, listMaterials } from "@/modules/inventory/services/inventory.actions";
import type { ServiceOrder, ServiceOrderItem, Customer, Material } from "@/types";

type OrderData = ServiceOrder & {
  customers: Customer;
  budgets: { budget_number: string; notes_client: string | null };
  items: ServiceOrderItem[];
};

interface ItemWithMaterial extends ServiceOrderItem {
  materialData?: Material;
  reservedQty: number;
  consumedQty: number;
}

export default function ProductionPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemWithMaterial[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [consumptionValues, setConsumptionValues] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [linkingItemId, setLinkingItemId] = useState<string | null>(null);
  const [linkingMaterialId, setLinkingMaterialId] = useState<string>("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  async function loadOrder() {
    try {
      const data = await getServiceOrder(params.id as string);
      setOrder(data as OrderData);

      const mats = await listMaterials();
      setMaterials(mats);

      const matsMap = new Map(mats.map((m) => [m.id, m]));

      const itemsWithMaterial: ItemWithMaterial[] = data.items.map((item) => ({
        ...item,
        materialData: item.material_id ? matsMap.get(item.material_id) : undefined,
        reservedQty: item.quantity,
        consumedQty: 0,
      }));

      setItems(itemsWithMaterial);
    } catch {
      showToast("Erro ao carregar ordem de serviço", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleConsume(itemId: string, materialId: string, materialName: string) {
    const qty = consumptionValues[itemId];
    if (!qty || qty <= 0) {
      showToast("Informe uma quantidade válida", "error");
      return;
    }

    const item = items.find((it) => it.id === itemId);
    if (!item) return;

    const remaining = item.reservedQty - item.consumedQty;
    if (qty > remaining) {
      showToast(`Quantidade excede o reservado (${remaining})`, "error");
      return;
    }

    try {
      setSubmitting(itemId);

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
        reason: `Consumo produção - OS ${order?.order_number} - ${item.description}`,
        reference_type: "service_order",
        reference_id: order?.id,
      });

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, consumedQty: it.consumedQty + qty } : it
        )
      );

      setConsumptionValues((prev) => ({ ...prev, [itemId]: 0 }));

      const updatedMats = await listMaterials();
      setMaterials(updatedMats);

      showToast(`${qty} ${material.unit} de ${materialName} registrado`, "success");
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

    try {
      setLinking(true);
      await linkMaterialToOrderItem(itemId, linkingMaterialId);

      const mat = materials.find((m) => m.id === linkingMaterialId);

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, material_id: linkingMaterialId, materialData: mat }
            : it
        )
      );

      setLinkingItemId(null);
      setLinkingMaterialId("");

      const updatedMats = await listMaterials();
      setMaterials(updatedMats);

      showToast(`Material ${mat?.name || ""} vinculado com sucesso`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao vincular material";
      showToast(message, "error");
    } finally {
      setLinking(false);
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  if (!order) {
    return <p className="py-8 text-center text-red-500">Ordem de serviço não encontrada</p>;
  }

  const itemsWithMaterial = items.filter((it) => it.material_id && it.item_type === "mobiliario");
  const itemsWithoutMaterial = items.filter((it) => !it.material_id && it.item_type === "mobiliario");
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

      {itemsWithMaterial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Materiais para Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {itemsWithMaterial.map((item) => {
                const mat = item.materialData;
                const remaining = item.reservedQty - item.consumedQty;
                const currentStock = mat ? Number(mat.current_stock) : 0;

                return (
                  <div
                    key={item.id}
                    className="rounded border border-[#D4C4B0] p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-[#3D2519]">{item.description}</p>
                        <p className="text-xs text-[#8B7A6B]">
                          Material: {mat?.name || item.material || "-"} | Qtd reservada: {item.reservedQty} {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-[#8B7A6B]">
                          Estoque: <span className={currentStock < remaining ? "text-red-600 font-semibold" : "text-[#3D2519]"}>{currentStock} {mat?.unit}</span>
                        </span>
                        <span className="text-[#8B7A6B]">
                          Restante: <span className="text-[#3D2519] font-semibold">{remaining} {item.unit}</span>
                        </span>
                        {item.consumedQty > 0 && (
                          <Badge variant="success">Consumido: {item.consumedQty}</Badge>
                        )}
                      </div>
                    </div>

                    {remaining > 0 && mat && (
                      <div className="flex items-end gap-3">
                        <div className="w-32">
                          <Input
                            id={`consume-${item.id}`}
                            label="Quantidade"
                            type="number"
                            step="0.001"
                            min="0"
                            max={remaining}
                            value={consumptionValues[item.id] || ""}
                            onChange={(e) =>
                              setConsumptionValues((prev) => ({
                                ...prev,
                                [item.id]: Number(e.target.value),
                              }))
                            }
                            placeholder="0"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleConsume(item.id, item.material_id!, mat.name)}
                          disabled={submitting === item.id || !consumptionValues[item.id]}
                        >
                          {submitting === item.id ? "Registrando..." : "Registrar Consumo"}
                        </Button>
                      </div>
                    )}

                    {remaining <= 0 && (
                      <p className="text-sm text-green-700 bg-green-50 rounded px-3 py-2">
                        Material totalmente consumido.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {itemsWithoutMaterial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mobiliário sem Material Vinculado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itemsWithoutMaterial.map((item) => (
                <div key={item.id} className="rounded border border-[#D4C4B0] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#3D2519]">{item.description}</p>
                      <p className="text-xs text-[#8B7A6B]">
                        {item.material ? `Material texto: ${item.material}` : "Sem material definido"} | {item.quantity} {item.unit}
                      </p>
                    </div>
                    {linkingItemId !== item.id && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setLinkingItemId(item.id);
                          setLinkingMaterialId("");
                        }}
                      >
                        Vincular Material
                      </Button>
                    )}
                  </div>

                  {linkingItemId === item.id && (
                    <div className="flex items-end gap-3">
                      <div className="flex-1 max-w-sm">
                        <label className="text-xs text-[#8B7A6B] mb-1 block">Selecionar material do estoque</label>
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
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleLinkMaterial(item.id)}
                        disabled={linking || !linkingMaterialId}
                      >
                        {linking ? "Vinculando..." : "Confirmar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setLinkingItemId(null);
                          setLinkingMaterialId("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {itemsWithMaterial.length === 0 && itemsWithoutMaterial.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-[#8B7A6B]">
            Nenhum item de mobiliário encontrado nesta OS.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
