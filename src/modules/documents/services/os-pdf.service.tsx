import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ServiceOrder, ServiceOrderItem, Customer } from "@/types";
import type { CompanySettings } from "./company-settings";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const COLORS = {
  primary: "#5B3A29",
  primaryDark: "#3D2519",
  background: "#F5F0EB",
  border: "#D4C4B0",
  text: "#3D2519",
  textLight: "#8B7A6B",
  white: "#FFFFFF",
  urgent: "#DC2626",
};

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
    paddingBottom: 12,
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  companySub: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  osNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryDark,
  },
  osDate: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.white,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 3,
    marginBottom: 6,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoField: {
    width: "33%",
    marginBottom: 6,
  },
  infoFieldHalf: {
    width: "50%",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 10,
    color: COLORS.text,
    marginTop: 1,
  },
  infoValueBold: {
    fontSize: 10,
    color: COLORS.text,
    marginTop: 1,
    fontWeight: "bold",
  },
  urgentBadge: {
    backgroundColor: COLORS.urgent,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    textAlign: "center",
    marginBottom: 10,
  },
  table: {
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 3,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.white,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    padding: 5,
    minHeight: 35,
  },
  tableRowAlt: {
    backgroundColor: "#FAFAF7",
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.text,
  },
  dimensionBox: {
    backgroundColor: COLORS.background,
    borderRadius: 3,
    padding: 4,
    marginTop: 2,
  },
  dimensionText: {
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  notesBox: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.4,
  },
  checklistContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 4,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: COLORS.text,
    borderRadius: 2,
    marginRight: 6,
  },
  checklistText: {
    fontSize: 9,
    color: COLORS.text,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signatureBox: {
    width: "40%",
    alignItems: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.text,
    width: "100%",
    marginTop: 35,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.textLight,
  },
});

const statusColors: Record<string, string> = {
  pendente: "#F59E0B",
  em_producao: "#3B82F6",
  acabamento: "#8B5CF6",
  pronto: "#10B981",
  entregue: "#059669",
  cancelada: "#DC2626",
};

const statusLabels: Record<string, string> = {
  pendente: "PENDENTE",
  em_producao: "EM PRODUÇÃO",
  acabamento: "ACABAMENTO",
  pronto: "PRONTO",
  entregue: "ENTREGUE",
  cancelada: "CANCELADA",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "URGENTE",
};

interface OSPDFData {
  order: ServiceOrder;
  items: ServiceOrderItem[];
  customer: Customer;
  budgetNotes?: string | null;
  companySettings: CompanySettings;
}

export function ServiceOrderPDF({ order, items, customer, budgetNotes, companySettings }: OSPDFData) {
  const statusColor = statusColors[order.status] || COLORS.primary;
  const isUrgent = order.priority === "urgente";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{companySettings.company_name}</Text>
            <Text style={styles.companySub}>Móveis Sob Medida</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.osNumber}>{order.order_number}</Text>
            <Text style={styles.osDate}>Data: {formatDate(order.created_at)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusLabels[order.status]}</Text>
            </View>
          </View>
        </View>

        {/* URGENT BANNER */}
        {isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: COLORS.white, textAlign: "center" }}>
              *** PRIORIDADE URGENTE ***
            </Text>
          </View>
        )}

        {/* OS INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da Ordem de Serviço</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValueBold}>{customer.full_name}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{customer.phone}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Orçamento</Text>
              <Text style={styles.infoValue}>{order.budget_id ? `Ref: ${order.budget_id.slice(0, 8)}` : "-"}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Responsável</Text>
              <Text style={styles.infoValueBold}>{order.responsible || "Não definido"}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Prioridade</Text>
              <Text style={styles.infoValue}>{priorityLabels[order.priority]}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Valor Total</Text>
              <Text style={styles.infoValueBold}>{formatCurrency(order.total_amount)}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Data Início</Text>
              <Text style={styles.infoValue}>{order.start_date ? formatDate(order.start_date) : "A definir"}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Previsão Entrega</Text>
              <Text style={styles.infoValueBold}>{order.estimated_delivery ? formatDate(order.estimated_delivery) : "A definir"}</Text>
            </View>
            {order.actual_delivery && (
              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>Entrega Real</Text>
                <Text style={styles.infoValueBold}>{formatDate(order.actual_delivery)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* PAYMENT INFO */}
        {((order.deposit_percentage ?? 0) > 0 || (order.installment_count ?? 1) > 1) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condições de Pagamento</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>Valor Total</Text>
                <Text style={styles.infoValueBold}>{formatCurrency(order.total_amount)}</Text>
              </View>
              {(order.deposit_percentage ?? 0) > 0 && (
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Sinal ({order.deposit_percentage}%)</Text>
                  <Text style={styles.infoValueBold}>{formatCurrency(order.deposit_value)}</Text>
                </View>
              )}
              {(order.installment_count ?? 1) > 1 && (
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Parcelas</Text>
                  <Text style={styles.infoValueBold}>{order.installment_count}x de {formatCurrency(order.installment_value)}</Text>
                </View>
              )}
              {(order.deposit_percentage ?? 0) > 0 && (order.installment_count ?? 1) > 1 && (
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Restante</Text>
                  <Text style={styles.infoValueBold}>{formatCurrency(order.total_amount - order.deposit_value)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ITEMS TABLE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens / Materiais</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Descrição</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Dimensões</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Material</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qtd</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Acabamento</Text>
            </View>
            {items.map((item, i) => (
              <View
                key={item.id}
                style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{i + 1}</Text>
                <View style={{ flex: 3 }}>
                  <Text style={styles.tableCell}>{item.description}</Text>
                  {item.notes && (
                    <Text style={{ fontSize: 7, color: COLORS.textLight, marginTop: 2 }}>
                      Obs: {item.notes}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 2 }}>
                  {item.width_cm && item.height_cm && item.depth_cm ? (
                    <View style={styles.dimensionBox}>
                      <Text style={styles.dimensionText}>
                        {item.width_cm} × {item.depth_cm} × {item.height_cm} cm
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.tableCell, { fontSize: 8 }]}>-</Text>
                  )}
                </View>
                <Text style={[styles.tableCell, { flex: 1.5, fontSize: 8 }]}>
                  {item.material || "-"}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5, fontSize: 8 }]}>
                  {item.finish || "-"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* PRODUCTION NOTES */}
        {order.notes_production && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Observações de Produção</Text>
            <Text style={styles.notesText}>{order.notes_production}</Text>
          </View>
        )}

        {/* CLIENT NOTES */}
        {budgetNotes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Observações do Cliente</Text>
            <Text style={styles.notesText}>{budgetNotes}</Text>
          </View>
        )}

        {/* INTERNAL NOTES */}
        {order.notes_internal && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Observações Internas</Text>
            <Text style={styles.notesText}>{order.notes_internal}</Text>
          </View>
        )}

        {/* CHECKLIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist de Produção</Text>
          <View style={styles.checklistContainer}>
            {[
              "Material cortado",
              "Furações realizadas",
              "Montagem",
              "Acabamento aplicado",
              "Hardware instalado",
              "Limpeza final",
              "Conferência dimensional",
              "Embalagem",
            ].map((item, i) => (
              <View key={i} style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SIGNATURES */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Responsável pela Produção</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Conferência / Aprovação</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {order.order_number} | {companySettings.company_name}
          </Text>
          <Text style={styles.footerText}>
            Emitido em: {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateServiceOrderPDF(data: OSPDFData): Promise<Buffer> {
  const pdf = ServiceOrderPDF(data);
  const buffer = await renderToBuffer(pdf);
  return buffer;
}
