import { createClient } from "@/lib/supabase/server";

export interface CompanySettings {
  company_name: string;
  company_phone: string;
  company_address: string;
  company_cnpj: string;
  company_email: string;
}

const DEFAULT_SETTINGS: CompanySettings = {
  company_name: "Roldan Marcenaria",
  company_phone: "",
  company_address: "",
  company_cnpj: "",
  company_email: "",
};

export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return DEFAULT_SETTINGS;

    const { data } = await supabase
      .from("profiles")
      .select("settings")
      .eq("id", user.id)
      .single();

    if (!data?.settings) return DEFAULT_SETTINGS;

    return {
      company_name: data.settings.company_name || DEFAULT_SETTINGS.company_name,
      company_phone: data.settings.company_phone || DEFAULT_SETTINGS.company_phone,
      company_address: data.settings.company_address || DEFAULT_SETTINGS.company_address,
      company_cnpj: data.settings.company_cnpj || DEFAULT_SETTINGS.company_cnpj,
      company_email: data.settings.company_email || DEFAULT_SETTINGS.company_email,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
