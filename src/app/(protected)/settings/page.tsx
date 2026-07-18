"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

interface CompanySettings {
  company_name: string;
  company_phone: string;
  company_address: string;
  company_cnpj: string;
  company_email: string;
}

interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

const defaultSettings: CompanySettings = {
  company_name: "Roldan Marcenaria",
  company_phone: "",
  company_address: "",
  company_cnpj: "",
  company_email: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile({
          full_name: profileData?.full_name || user.email?.split("@")[0] || "",
          email: user.email || "",
          role: profileData?.role || "admin",
        });

        if (profileData?.settings) {
          setSettings((prev) => ({ ...prev, ...profileData.settings }));
        }
      }
    } catch {
      showToast("Erro ao carregar configurações", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ settings })
        .eq("id", user.id);

      if (error) throw error;
      showToast("Configurações salvas com sucesso", "success");
    } catch {
      showToast("Erro ao salvar configurações", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">Configurações</h1>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="company_name"
            label="Nome da Empresa"
            value={settings.company_name}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, company_name: e.target.value }))
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="company_phone"
              label="Telefone"
              value={settings.company_phone}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, company_phone: e.target.value }))
              }
              placeholder="(11) 99999-9999"
            />
            <Input
              id="company_cnpj"
              label="CNPJ"
              value={settings.company_cnpj}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, company_cnpj: e.target.value }))
              }
              placeholder="00.000.000/0001-00"
            />
          </div>
          <Input
            id="company_email"
            label="E-mail"
            type="email"
            value={settings.company_email}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, company_email: e.target.value }))
            }
            placeholder="contato@roldan.com.br"
          />
          <Textarea
            id="company_address"
            label="Endereço"
            value={settings.company_address}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, company_address: e.target.value }))
            }
            placeholder="Rua da Marcenaria, 123 - Centro - São Paulo/SP"
          />
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="user_name"
            label="Nome"
            value={profile?.full_name || ""}
            disabled
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="user_email"
              label="E-mail"
              value={profile?.email || ""}
              disabled
            />
            <Input
              id="user_role"
              label="Perfil de Acesso"
              value={
                profile?.role === "admin"
                  ? "Administrador"
                  : profile?.role === "comercial"
                  ? "Comercial"
                  : profile?.role === "financeiro"
                  ? "Financeiro"
                  : "Produção"
              }
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
