import { createAdminClient } from "@/lib/supabase/admin";

interface AuditParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  ipAddress,
}: AuditParams) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
    ip_address: ipAddress ?? null,
  });

  if (error) {
    console.error("Failed to create audit log:", error);
  }
}
