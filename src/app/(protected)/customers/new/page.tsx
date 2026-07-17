"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  customerSchema,
  type CustomerFormData,
} from "@/lib/validations/customer";
import { createCustomerServer } from "@/modules/customers/services/customers.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

export default function CustomerNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  async function onSubmit(data: CustomerFormData) {
    try {
      setLoading(true);
      await createCustomerServer({
        ...data,
        email: data.email || null,
        phone_secondary: data.phone_secondary || null,
        cpf_cnpj: data.cpf_cnpj || null,
        address_street: data.address_street || null,
        address_number: data.address_number || null,
        address_complement: data.address_complement || null,
        address_neighborhood: data.address_neighborhood || null,
        address_city: data.address_city || null,
        address_state: data.address_state || null,
        address_zip: data.address_zip || null,
        notes: data.notes || null,
        active: true,
        created_by: "",
      });
      showToast("Cliente criado com sucesso", "success");
      router.push("/customers");
    } catch {
      showToast("Erro ao salvar cliente", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">Novo Cliente</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="full_name"
              label="Nome completo *"
              {...register("full_name")}
              error={errors.full_name?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="phone"
                label="Telefone *"
                {...register("phone")}
                error={errors.phone?.message}
              />
              <Input
                id="phone_secondary"
                label="Telefone secundário"
                {...register("phone_secondary")}
              />
            </div>
            <Input
              id="email"
              label="E-mail"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              id="cpf_cnpj"
              label="CPF/CNPJ"
              {...register("cpf_cnpj")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <Input
                id="address_street"
                label="Rua"
                {...register("address_street")}
              />
              <Input
                id="address_number"
                label="Número"
                {...register("address_number")}
                className="w-24"
              />
            </div>
            <Input
              id="address_complement"
              label="Complemento"
              {...register("address_complement")}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                id="address_neighborhood"
                label="Bairro"
                {...register("address_neighborhood")}
              />
              <Input
                id="address_city"
                label="Cidade"
                {...register("address_city")}
              />
              <Input
                id="address_state"
                label="UF"
                maxLength={2}
                {...register("address_state")}
              />
            </div>
            <Input
              id="address_zip"
              label="CEP"
              {...register("address_zip")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Observações sobre o cliente..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/customers")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Criar Cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
