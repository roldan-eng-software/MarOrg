import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

function normalizeSettings(settings: Record<string, unknown> | null | undefined): CompanySettings {
  if (!settings) return DEFAULT_SETTINGS;

  return {
    company_name: (settings.company_name as string) || DEFAULT_SETTINGS.company_name,
    company_phone: (settings.company_phone as string) || DEFAULT_SETTINGS.company_phone,
    company_address: (settings.company_address as string) || DEFAULT_SETTINGS.company_address,
    company_cnpj: (settings.company_cnpj as string) || DEFAULT_SETTINGS.company_cnpj,
    company_email: (settings.company_email as string) || DEFAULT_SETTINGS.company_email,
  };
}

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

    return normalizeSettings(data?.settings);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getPublicCompanySettings(): Promise<CompanySettings> {
  try {
    const supabase = createAdminClient();

    const { data } = await supabase
      .from("profiles")
      .select("settings")
      .eq("role", "admin")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    return normalizeSettings(data?.settings);
  } catch {
    return DEFAULT_SETTINGS;
  }
}
