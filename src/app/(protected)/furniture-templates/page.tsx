"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAllFurnitureTemplates, deleteFurnitureTemplate } from "@/modules/furniture-templates/services/furniture.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import type { FurnitureTemplate } from "@/types";

const categoryLabels: Record<string, string> = {
  Cozinha: "Cozinha",
  Banheiro: "Banheiro",
  Quarto: "Quarto",
  Sala: "Sala",
  Escritorio: "Escritório",
  Outro: "Outro",
};

export default function FurnitureTemplatesPage() {
  const [templates, setTemplates] = useState<FurnitureTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await listAllFurnitureTemplates();
      setTemplates(data);
    } catch {
      showToast("Erro ao carregar modelos", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este modelo?")) return;
    try {
      await deleteFurnitureTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showToast("Modelo removido com sucesso", "success");
    } catch {
      showToast("Erro ao remover modelo", "error");
    }
  }

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, FurnitureTemplate[]>>((acc, t) => {
    const cat = t.category || "Sem categoria";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Modelos de Móveis</h1>
        <Link href="/furniture-templates/new">
          <Button>+ Novo Modelo</Button>
        </Link>
      </div>

      <Input
        id="search"
        placeholder="Buscar por nome ou categoria..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-[#8B7A6B]">
            {search
              ? "Nenhum modelo encontrado para a busca."
              : "Nenhum modelo cadastrado. Crie o primeiro modelo de móvel."}
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase text-[#8B7A6B]">
              {category}
            </h2>
            {items.map((template) => (
              <Card key={template.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#3D2519]">
                        {template.name}
                      </span>
                      {template.default_material && (
                        <Badge variant="default">{template.default_material}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-[#8B7A6B]">
                      {template.default_unit} — {formatCurrency(template.default_price)}
                      {template.default_width_cm && template.default_height_cm && (
                        <span>
                          {" "}
                          — {template.default_width_cm}×{template.default_depth_cm}×{template.default_height_cm}cm
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-[#8B7A6B]">{template.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/furniture-templates/${template.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
