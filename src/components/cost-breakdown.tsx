"use client";

import { formatCurrency } from "@/lib/utils/format";
import type { TemplateCostBreakdown } from "@/types";

interface Props {
  breakdown: TemplateCostBreakdown | null;
  loading?: boolean;
}

export function CostBreakdown({ breakdown, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-md bg-[#F5F0EB] border border-[#D4C4B0] p-4">
        <p className="text-sm text-[#8B7A6B]">Calculando custos...</p>
      </div>
    );
  }

  if (!breakdown || breakdown.totalCost === 0) {
    return null;
  }

  return (
    <div className="rounded-md bg-[#F5F0EB] border border-[#D4C4B0] p-4 space-y-2">
      <p className="text-sm font-medium text-[#3D2519]">Cálculo Automático</p>

      <div className="space-y-1 text-sm text-[#8B7A6B]">
        {breakdown.mdfCost > 0 && (
          <div className="flex justify-between">
            <span>
              MDF ({breakdown.details.mdfAreaLiquida.toFixed(2)} m² líq. →{" "}
              {breakdown.details.mdfAreaComPerda.toFixed(2)} m² c/ perda)
            </span>
            <span className="font-medium text-[#3D2519]">{formatCurrency(breakdown.mdfCost)}</span>
          </div>
        )}

        {breakdown.edgebandCost > 0 && (
          <div className="flex justify-between">
            <span>
              Fita de Borda ({breakdown.details.edgebandPerimeter.toFixed(2)} m)
            </span>
            <span className="font-medium text-[#3D2519]">{formatCurrency(breakdown.edgebandCost)}</span>
          </div>
        )}

        {breakdown.hardwareCost > 0 && (
          <div className="flex justify-between">
            <span>Ferragens</span>
            <span className="font-medium text-[#3D2519]">{formatCurrency(breakdown.hardwareCost)}</span>
          </div>
        )}

        {breakdown.details.hardwareItems.length > 0 && (
          <div className="pl-4 space-y-0.5 text-xs">
            {breakdown.details.hardwareItems.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatCurrency(item.cost)}</span>
              </div>
            ))}
          </div>
        )}

        {breakdown.laborCost > 0 && (
          <div className="flex justify-between">
            <span>Mão de Obra</span>
            <span className="font-medium text-[#3D2519]">{formatCurrency(breakdown.laborCost)}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#D4C4B0] flex justify-between font-bold text-[#3D2519]">
        <span>Custo Total de Materiais</span>
        <span>{formatCurrency(breakdown.totalCost)}</span>
      </div>
    </div>
  );
}