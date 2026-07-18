"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listSuppliers, deleteSupplier } from "@/modules/suppliers/services/suppliers.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";
import { formatPhone } from "@/lib/utils/format";
import type { Supplier } from "@/types";

export default function SuppliersListPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const data = await listSuppliers();
      setSuppliers(data);
    } catch {
      showToast("Erro ao carregar fornecedores", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir fornecedor "${name}"?`)) return;

    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      showToast("Fornecedor excluído", "success");
    } catch {
      showToast("Erro ao excluir fornecedor", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Fornecedores</h1>
        <Link href="/suppliers/new">
          <Button>Novo Fornecedor</Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
          ) : suppliers.length === 0 ? (
            <p className="py-8 text-center text-[#8B7A6B]">
              Nenhum fornecedor encontrado
            </p>
          ) : (
            <div className="divide-y divide-[#D4C4B0]">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium text-[#3D2519]">{supplier.name}</p>
                    <p className="text-sm text-[#8B7A6B]">
                      {supplier.cnpj && `${supplier.cnpj} · `}
                      {supplier.phone && formatPhone(supplier.phone)}
                      {supplier.email && ` · ${supplier.email}`}
                    </p>
                    {supplier.contact_person && (
                      <p className="text-xs text-[#8B7A6B]">
                        Contato: {supplier.contact_person}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/suppliers/${supplier.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(supplier.id, supplier.name)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
