"use client";

import { useEffect, useState } from "react";
import { listMaterials } from "@/modules/inventory/services/inventory.actions";
import { Input } from "@/components/ui/input";
import type { Material } from "@/types";

interface MaterialPickerProps {
  value: string;
  materialId: string | null;
  onChange: (value: string) => void;
  onMaterialSelect: (material: Material) => void;
  onClear: () => void;
  error?: string;
  disabled?: boolean;
}

export function MaterialPicker({
  value,
  materialId,
  onChange,
  onMaterialSelect,
  onClear,
  error,
  disabled,
}: MaterialPickerProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    listMaterials()
      .then(setMaterials)
      .catch(() => setMaterials([]));
  }, []);

  const filtered = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Material[]>>((acc, m) => {
    const cat = m.category || "Geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  function handleSelect(material: Material) {
    onChange(material.name);
    onMaterialSelect(material);
    setShowDropdown(false);
    setSearchTerm("");
  }

  function handleClear() {
    onChange("");
    onClear();
    setSearchTerm("");
  }

  const categoryLabels: Record<string, string> = {
    madeira: "Madeira",
    ferragem: "Ferragem",
    acabamento: "Acabamento",
    colante: "Colante",
    vidro: "Vidro",
    fixacao: "Fixação",
    geral: "Geral",
  };

  return (
    <div className="relative">
      <Input
        id="material-search"
        label="Material"
        value={value || searchTerm}
        onChange={(e) => {
          onChange(e.target.value);
          onClear();
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Buscar material no estoque..."
        error={error}
        disabled={disabled}
      />
      {materialId && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-8 text-xs text-[#8B7A6B] hover:text-red-500"
        >
          Limpar
        </button>
      )}
      {showDropdown && !disabled && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[#D4C4B0] bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-[#8B7A6B]">
              Nenhum material encontrado. Digite para usar texto livre.
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="bg-[#F5F0EB] px-3 py-1 text-xs font-semibold uppercase text-[#8B7A6B]">
                  {categoryLabels[category] || category}
                </div>
                {items.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#F5F0EB] transition-colors"
                    onClick={() => handleSelect(material)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#3D2519]">{material.name}</span>
                      <span className={`text-xs ${Number(material.current_stock) <= Number(material.min_stock) && Number(material.min_stock) > 0 ? "text-red-500 font-semibold" : "text-[#8B7A6B]"}`}>
                        Estoque: {material.current_stock} {material.unit}
                      </span>
                    </div>
                    <div className="text-xs text-[#8B7A6B]">
                      {categoryLabels[material.category] || material.category}
                      {material.cost > 0 && ` · R$ ${Number(material.cost).toFixed(2)}/${material.unit}`}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
          <button
            type="button"
            className="w-full border-t border-[#D4C4B0] px-3 py-2 text-left text-sm text-[#8B7A6B] hover:bg-[#F5F0EB]"
            onClick={() => {
              setShowDropdown(false);
              setSearchTerm("");
            }}
          >
            Fechar
          </button>
        </div>
      )}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowDropdown(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
}
