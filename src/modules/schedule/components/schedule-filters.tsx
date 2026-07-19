"use client";

interface ScheduleFiltersProps {
  showOrders: boolean;
  showFinancial: boolean;
  showEvents: boolean;
  onToggleOrders: () => void;
  onToggleFinancial: () => void;
  onToggleEvents: () => void;
}

export function ScheduleFilters({
  showOrders,
  showFinancial,
  showEvents,
  onToggleOrders,
  onToggleFinancial,
  onToggleEvents,
}: ScheduleFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium text-[#8B7A6B]">Filtrar:</span>

      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={showOrders}
          onChange={onToggleOrders}
          className="rounded border-[#D4C4B0] text-[#5B3A29] focus:ring-[#5B3A29]"
        />
        <span className="text-xs text-[#3D2519] flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#3B82F6]" />
          Ordens de Serviço
        </span>
      </label>

      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={showFinancial}
          onChange={onToggleFinancial}
          className="rounded border-[#D4C4B0] text-[#5B3A29] focus:ring-[#5B3A29]"
        />
        <span className="text-xs text-[#3D2519] flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10B981]" />
          Financeiro
        </span>
      </label>

      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={showEvents}
          onChange={onToggleEvents}
          className="rounded border-[#D4C4B0] text-[#5B3A29] focus:ring-[#5B3A29]"
        />
        <span className="text-xs text-[#3D2519] flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6]" />
          Eventos
        </span>
      </label>
    </div>
  );
}
