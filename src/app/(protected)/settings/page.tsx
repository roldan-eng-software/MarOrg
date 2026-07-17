"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Roldan Marcenaria");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  function handleSave() {
    showToast("Configurações salvas com sucesso", "success");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="company_name"
            label="Nome da empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            id="company_phone"
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            id="company_email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="company_address"
            label="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar</Button>
      </div>
    </div>
  );
}
