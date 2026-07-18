"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";
import { listAllMovements } from "@/modules/inventory/services/inventory.actions";

const movementLabels: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
  reserva: "Reserva",
  liberacao: "Liberação",
};

const movementColors: Record<string, string> = {
  entrada: "bg-green-100 text-green-700",
  saida: "bg-red-100 text-red-700",
  ajuste: "bg-yellow-100 text-yellow-700",
  reserva: "bg-blue-100 text-blue-700",
  liberacao: "bg-purple-100 text-purple-700",
};

export default function StockMovementsPage() {
  const router = useRouter();
  const [movements, setMovements] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  async function loadMovements() {
    try {
      const data = await listAllMovements(100);
      setMovements(data);
    } catch {
      showToast("Erro ao carregar movimentações", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Movimentações de Estoque</h1>
        <Button variant="ghost" onClick={() => router.push("/inventory")}>
          Voltar
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
      ) : movements.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-[#8B7A6B]">
            Nenhuma movimentação registrada
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {movements.map((mov) => {
            const mat = mov.materials as { name: string; unit: string } | null;
            const movType = mov.movement_type as string;
            const qty = Number(mov.quantity);
            const isSaida = movType === "saida" || movType === "reserva";
            const reason = mov.reason ? String(mov.reason) : null;
            return (
              <Card key={mov.id as string}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] px-2 py-1 rounded font-medium ${movementColors[movType] || "bg-gray-100 text-gray-700"}`}>
                      {movementLabels[movType] || movType}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#3D2519]">
                        {mat?.name || "Material removido"}
                      </p>
                      {reason && (
                        <p className="text-xs text-[#8B7A6B]">{reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`text-lg font-bold ${isSaida ? "text-red-600" : "text-green-600"}`}>
                      {isSaida ? "-" : "+"}{qty} {mat?.unit || ""}
                    </span>
                    <span className="text-xs text-[#8B7A6B] w-32 text-right">
                      {formatDate(mov.created_at as string)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
