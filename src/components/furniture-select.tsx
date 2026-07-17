"use client";

import { useEffect, useState } from "react";
import { listFurnitureTemplates } from "@/modules/furniture-templates/services/furniture.actions";
import { Input } from "@/components/ui/input";
import type { FurnitureTemplate } from "@/types";

interface FurnitureSelectProps {
  value: string;
  onChange: (value: string) => void;
  onSelectTemplate: (template: FurnitureTemplate) => void;
  error?: string;
  disabled?: boolean;
}

export function FurnitureSelect({
  value,
  onChange,
  onSelectTemplate,
  error,
  disabled,
}: FurnitureSelectProps) {
  const [templates, setTemplates] = useState<FurnitureTemplate[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    listFurnitureTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, FurnitureTemplate[]>>((acc, t) => {
    const cat = t.category || "Outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  function handleSelect(template: FurnitureTemplate) {
    onChange(template.name);
    onSelectTemplate(template);
    setShowDropdown(false);
    setSearchTerm("");
  }

  return (
    <div className="relative">
      <Input
        id="furniture-search"
        label="Descrição *"
        value={value || searchTerm}
        onChange={(e) => {
          onChange(e.target.value);
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Digite para buscar ou selecionar um modelo..."
        error={error}
        disabled={disabled}
      />
      {showDropdown && !disabled && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[#D4C4B0] bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-[#8B7A6B]">
              Nenhum modelo encontrado. Digite para usar texto livre.
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="bg-[#F5F0EB] px-3 py-1 text-xs font-semibold uppercase text-[#8B7A6B]">
                  {category}
                </div>
                {items.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#F5F0EB] transition-colors"
                    onClick={() => handleSelect(template)}
                  >
                    <div className="font-medium text-[#3D2519]">{template.name}</div>
                    <div className="text-xs text-[#8B7A6B]">
                      {template.default_material && `${template.default_material} · `}
                      {template.default_unit}
                      {template.default_price > 0 && ` · R$ ${template.default_price.toFixed(2)}`}
                      {template.default_width_cm && template.default_height_cm && (
                        <> · {template.default_width_cm}×{template.default_depth_cm}×{template.default_height_cm}cm</>
                      )}
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
