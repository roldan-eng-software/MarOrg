"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSupplier, updateSupplier } from "@/modules/suppliers/services/suppliers.actions";
import { useCep } from "@/lib/utils/cep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

const supplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  contact_person: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_zip: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SupplierEditPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  const addressZip = watch("address_zip");

  const handleAddressFound = useCallback(
    (data: {
      address_street: string;
      address_neighborhood: string;
      address_city: string;
      address_state: string;
    }) => {
      setValue("address_street", data.address_street);
      setValue("address_neighborhood", data.address_neighborhood);
      setValue("address_city", data.address_city);
      setValue("address_state", data.address_state);
    },
    [setValue]
  );

  const { fetchCep } = useCep(handleAddressFound);

  function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    setValue("address_zip", digits);
    if (digits.length === 8) {
      fetchCep(digits);
    }
  }

  useEffect(() => {
    getSupplier(params.id as string)
      .then((supplier) => {
        reset({
          name: supplier.name,
          cnpj: supplier.cnpj ?? "",
          phone: supplier.phone ?? "",
          email: supplier.email ?? "",
          contact_person: supplier.contact_person ?? "",
          address_street: supplier.address_street ?? "",
          address_number: supplier.address_number ?? "",
          address_complement: supplier.address_complement ?? "",
          address_neighborhood: supplier.address_neighborhood ?? "",
          address_city: supplier.address_city ?? "",
          address_state: supplier.address_state ?? "",
          address_zip: supplier.address_zip ?? "",
          notes: supplier.notes ?? "",
        });
      })
      .catch(() => {
        showToast("Erro ao carregar fornecedor", "error");
        router.push("/suppliers");
      })
      .finally(() => setFetching(false));
  }, [params.id, reset, router]);

  async function onSubmit(data: SupplierFormData) {
    try {
      setLoading(true);
      await updateSupplier(params.id as string, {
        name: data.name,
        cnpj: data.cnpj || null,
        phone: data.phone || null,
        email: data.email || null,
        contact_person: data.contact_person || null,
        address_street: data.address_street || null,
        address_number: data.address_number || null,
        address_complement: data.address_complement || null,
        address_neighborhood: data.address_neighborhood || null,
        address_city: data.address_city || null,
        address_state: data.address_state || null,
        address_zip: data.address_zip || null,
        notes: data.notes || null,
      });
      showToast("Fornecedor atualizado com sucesso", "success");
      router.push("/suppliers");
    } catch {
      showToast("Erro ao atualizar fornecedor", "error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">Editar Fornecedor</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Nome / Razão Social *"
              {...register("name")}
              error={errors.name?.message}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="cnpj"
                label="CNPJ"
                {...register("cnpj")}
              />
              <Input
                id="contact_person"
                label="Pessoa de Contato"
                {...register("contact_person")}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="phone"
                label="Telefone"
                {...register("phone")}
                placeholder="(11) 99999-9999"
              />
              <Input
                id="email"
                label="E-mail"
                type="email"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                id="address_zip"
                label="CEP"
                {...register("address_zip")}
                onChange={(e) => handleCepChange(e.target.value)}
              />
              <Input
                id="address_street"
                label="Rua"
                {...register("address_street")}
              />
              <Input
                id="address_number"
                label="Número"
                {...register("address_number")}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                id="address_complement"
                label="Complemento"
                {...register("address_complement")}
              />
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
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="address_state"
                label="Estado"
                {...register("address_state")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              label="Observações"
              {...register("notes")}
              placeholder="Informações adicionais sobre o fornecedor..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
