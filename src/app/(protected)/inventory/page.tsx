"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import {
  listMaterials,
  createMaterial,
  deleteMaterial,
  registerMovement,
  getInventoryStats,
} from "@/modules/inventory/services/inventory.actions";
import type { Material } from "@/types";

const categoryLabels: Record<string, string> = {
  madeira: "Madeira",
  ferragem: "Ferragem",
  acabamento: "Acabamento",
  colante: "Colante",
  vidro: "Vidro",
  fixacao: "Fixação",
  geral: "Geral",
};

const categoryColors: Record<string, string> = {
  madeira: "bg-amber-100 text-amber-700",
  ferragem: "bg-gray-100 text-gray-700",
  acabamento: "bg-purple-100 text-purple-700",
  colante: "bg-blue-100 text-blue-700",
  vidro: "bg-cyan-100 text-cyan-700",
  fixacao: "bg-orange-100 text-orange-700",
  geral: "bg-green-100 text-green-700",
};

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [stats, setStats] = useState({ totalMaterials: 0, totalValue: 0, lowStockCount: 0, categories: 0 });

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<string>("geral");
  const [newUnit, setNewUnit] = useState("un");
  const [newStock, setNewStock] = useState(0);
  const [newMinStock, setNewMinStock] = useState(0);
  const [newCost, setNewCost] = useState(0);
  const [newSupplier, setNewSupplier] = useState("");
  const [saving, setSaving] = useState(false);

  const [movementModal, setMovementModal] = useState<Material | null>(null);
  const [movType, setMovType] = useState<"entrada" | "saida" | "ajuste">("entrada");
  const [movQty, setMovQty] = useState(0);
  const [movReason, setMovReason] = useState("");

  useEffect(() => {
    loadData();
  }, [filterCategory, search]);

  async function loadData() {
    try {
      setLoading(true);
      const [mats, statsData] = await Promise.all([
        listMaterials(filterCategory || undefined, search || undefined),
        getInventoryStats(),
      ]);
      setMaterials(mats);
      setStats(statsData);
    } catch {
      showToast("Erro ao carregar estoque", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      showToast("Informe o nome do material", "error");
      return;
    }
    try {
      setSaving(true);
      await createMaterial({
        name: newName,
        description: newDesc || undefined,
        category: newCategory as Material["category"],
        unit: newUnit,
        current_stock: newStock,
        min_stock: newMinStock,
        cost: newCost,
        supplier: newSupplier || undefined,
      });
      showToast("Material criado com sucesso", "success");
      setShowNewForm(false);
      setNewName(""); setNewDesc(""); setNewCategory("geral"); setNewUnit("un");
      setNewStock(0); setNewMinStock(0); setNewCost(0); setNewSupplier("");
      await loadData();
    } catch {
      showToast("Erro ao criar material", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movementModal || movQty <= 0) {
      showToast("Informe uma quantidade válida", "error");
      return;
    }
    try {
      setSaving(true);
      await registerMovement({
        material_id: movementModal.id,
        movement_type: movType,
        quantity: movQty,
        reason: movReason || undefined,
      });
      showToast("Movimentação registrada", "success");
      setMovementModal(null);
      setMovQty(0); setMovReason("");
      await loadData();
    } catch {
      showToast("Erro ao registrar movimentação", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este material?")) return;
    try {
      await deleteMaterial(id);
      showToast("Material excluído", "success");
      await loadData();
    } catch {
      showToast("Erro ao excluir", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-[#3D2519]">Estoque</h1>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          {showNewForm ? "Cancelar" : "+ Novo Material"}
        </Button>
      </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[#8B7A6B]">Materiais</p>
            <p className="text-2xl font-bold text-[#3D2519]">{stats.totalMaterials}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[#8B7A6B]">Valor em Estoque</p>
            <p className="text-2xl font-bold text-[#3D2519]">{formatCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[#8B7A6B]">Estoque Baixo</p>
            <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {stats.lowStockCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[#8B7A6B]">Categorias</p>
            <p className="text-2xl font-bold text-[#3D2519]">{stats.categories}</p>
          </CardContent>
        </Card>
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Material</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input id="name" label="Nome *" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: MDF Branco" />
                <div>
                  <label className="text-sm font-medium text-[#3D2519]">Categoria</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519]">
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <Input id="unit" label="Unidade" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="un, m², kg..." />
              </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input id="stock" label="Estoque Atual" type="number" step="0.001" value={newStock} onChange={(e) => setNewStock(Number(e.target.value))} />
                <Input id="min" label="Estoque Mínimo" type="number" step="0.001" value={newMinStock} onChange={(e) => setNewMinStock(Number(e.target.value))} />
                <Input id="cost" label="Custo Unitário" type="number" step="0.01" value={newCost} onChange={(e) => setNewCost(Number(e.target.value))} />
                <Input id="supplier" label="Fornecedor" value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} />
              </div>
              <Input id="desc" label="Descrição" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Input id="search" label="" placeholder="Buscar material..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex flex-wrap gap-2">
          {["", "madeira", "ferragem", "acabamento", "colante", "vidro", "fixacao", "geral"].map((cat) => (
            <Button key={cat} size="sm" variant={filterCategory === cat ? "primary" : "ghost"}
              onClick={() => setFilterCategory(cat)}>
              {cat ? categoryLabels[cat] : "Todos"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
      ) : materials.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-[#8B7A6B]">Nenhum material encontrado</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {materials.map((mat) => {
            const isLow = mat.min_stock > 0 && mat.current_stock <= mat.min_stock;
            return (
              <Card key={mat.id} className={isLow ? "border-red-300 bg-red-50" : ""}>
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#3D2519]">{mat.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${categoryColors[mat.category]}`}>
                          {categoryLabels[mat.category]}
                        </span>
                        {isLow && <Badge variant="danger">Estoque Baixo</Badge>}
                      </div>
                      {mat.description && <p className="text-xs text-[#8B7A6B]">{mat.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#3D2519]">{mat.current_stock} {mat.unit}</p>
                      <p className="text-[10px] text-[#8B7A6B]">Mín: {mat.min_stock} | Custo: {formatCurrency(mat.cost)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setMovementModal(mat); setMovType("entrada"); }}>+ Entrada</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setMovementModal(mat); setMovType("saida"); }}>- Saída</Button>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(mat.id)}>Excluir</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {movementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Movimentação - {movementModal.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMovement} className="space-y-4">
                <p className="text-sm text-[#8B7A6B]">Estoque atual: {movementModal.current_stock} {movementModal.unit}</p>
                <div>
                  <label className="text-sm font-medium text-[#3D2519]">Tipo</label>
                  <div className="flex gap-2 mt-1">
                    {(["entrada", "saida", "ajuste"] as const).map((t) => (
                      <Button key={t} type="button" size="sm" variant={movType === t ? "primary" : "ghost"}
                        onClick={() => setMovType(t)}>
                        {t === "entrada" ? "Entrada" : t === "saida" ? "Saída" : "Ajuste"}
                      </Button>
                    ))}
                  </div>
                </div>
                <Input id="qty" label="Quantidade" type="number" step="0.001" value={movQty}
                  onChange={(e) => setMovQty(Number(e.target.value))} />
                <Input id="reason" label="Motivo" value={movReason}
                  onChange={(e) => setMovReason(e.target.value)} placeholder="Ex: Compra, Uso em OS..." />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setMovementModal(null)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Confirmar"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
