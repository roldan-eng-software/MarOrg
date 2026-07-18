"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listCustomersServer, deleteCustomerServer } from "@/modules/customers/services/customers.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";
import type { Customer } from "@/types";

export default function CustomersListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await listCustomersServer(search || undefined);
      setCustomers(data);
    } catch {
      showToast("Erro ao carregar clientes", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deseja excluir o cliente "${name}"?`)) return;
    try {
      await deleteCustomerServer(id);
      showToast("Cliente excluído com sucesso", "success");
      loadCustomers();
    } catch {
      showToast("Erro ao excluir cliente", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-[#3D2519]">Clientes</h1>
        <Link href="/customers/new">
          <Button>Novo Cliente</Button>
        </Link>
      </div>

      <Input
        id="search"
        placeholder="Buscar por nome, telefone ou e-mail..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
          ) : customers.length === 0 ? (
            <p className="py-8 text-center text-[#8B7A6B]">
              Nenhum cliente encontrado
            </p>
          ) : (
            <div className="divide-y divide-[#D4C4B0]">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex flex-col sm:flex-row items-center justify-between py-3 gap-2"
                >
                  <div>
                    <p className="font-medium text-[#3D2519]">
                      {customer.full_name}
                    </p>
                    <p className="text-sm text-[#8B7A6B]">
                      {customer.phone}
                      {customer.email && ` · ${customer.email}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/customers/${customer.id}/edit`)
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(customer.id, customer.full_name)}
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
