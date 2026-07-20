import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
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
  success: "#059669",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 15,
    marginBottom: 25,
  },
  headerLeft: {
    flex: 1,
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  companyInfo: {
    fontSize: 8,
    color: COLORS.textLight,
    lineHeight: 1.4,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.success,
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: "right",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    textAlign: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    width: 120,
  },
  fieldValue: {
    fontSize: 11,
    color: COLORS.text,
    flex: 1,
  },
  amountBox: {
    backgroundColor: COLORS.background,
    border: `2 solid ${COLORS.primary}`,
    borderRadius: 6,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primaryDark,
  },
  paymentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentField: {
    width: "48%",
  },
  notesContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 4,
    marginBottom: 25,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.4,
  },
  declarationText: {
    fontSize: 10,
    color: COLORS.text,
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 40,
    marginTop: 20,
  },
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.text,
    width: "100%",
    marginBottom: 5,
    marginTop: 40,
  },
  signatureLabel: {
    fontSize: 9,
    color: COLORS.textLight,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 2,
  },
});

interface ReceiptData {
  id: string;
  description: string;
  amount: number;
  category: string;
  payment_method: string | null;
  paid_date: string | null;
  due_date: string;
  notes: string | null;
  customer: {
    full_name: string;
    phone: string;
    cpf_cnpj: string | null;
  } | null;
  order_number: string | null;
  budget_number: string | null;
  companySettings: CompanySettings;
}

function ReceiptPDF({ data }: { data: ReceiptData }) {
  const receiptNumber = `REC-${data.id.slice(0, 8).toUpperCase()}`;
  const paymentDate = data.paid_date ? formatDate(data.paid_date) : formatDate(new Date().toISOString());
  const dueDate = formatDate(data.due_date);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{data.companySettings.company_name}</Text>
            <Text style={styles.companyTagline}>Móveis Sob Medida</Text>
            <Text style={styles.companyInfo}>
              {[
                data.companySettings.company_phone && `Tel: ${data.companySettings.company_phone}`,
                data.companySettings.company_address,
                data.companySettings.company_cnpj && `CNPJ: ${data.companySettings.company_cnpj}`,
                data.companySettings.company_email,
              ].filter(Boolean).join("\n")}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.receiptLabel}>RECIBO</Text>
            <Text style={styles.receiptNumber}>{receiptNumber}</Text>
            <Text style={styles.receiptNumber}>Data: {paymentDate}</Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>RECIBO DE PAGAMENTO</Text>

        {/* CUSTOMER DATA */}
        {data.customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Nome</Text>
              <Text style={styles.fieldValue}>{data.customer.full_name}</Text>
            </View>
            {data.customer.phone && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Telefone</Text>
                <Text style={styles.fieldValue}>{data.customer.phone}</Text>
              </View>
            )}
            {data.customer.cpf_cnpj && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>CPF/CNPJ</Text>
                <Text style={styles.fieldValue}>{data.customer.cpf_cnpj}</Text>
              </View>
            )}
          </View>
        )}

        {/* PAYMENT DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Pagamento</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Descrição</Text>
            <Text style={styles.fieldValue}>{data.description}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Categoria</Text>
            <Text style={styles.fieldValue}>{data.category}</Text>
          </View>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentField}>
              <Text style={styles.fieldLabel}>Data de Vencimento</Text>
              <Text style={styles.fieldValue}>{dueDate}</Text>
            </View>
            <View style={styles.paymentField}>
              <Text style={styles.fieldLabel}>Data de Pagamento</Text>
              <Text style={styles.fieldValue}>{paymentDate}</Text>
            </View>
          </View>
          {data.payment_method && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Forma de Pagamento</Text>
              <Text style={styles.fieldValue}>{data.payment_method}</Text>
            </View>
          )}
          {(data.order_number || data.budget_number) && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Referência</Text>
              <Text style={styles.fieldValue}>
                {[data.order_number, data.budget_number].filter(Boolean).join(" / ")}
              </Text>
            </View>
          )}
        </View>

        {/* AMOUNT */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>VALOR PAGO</Text>
          <Text style={styles.amountValue}>{formatCurrency(data.amount)}</Text>
        </View>

        {/* NOTES */}
        {data.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Observações</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* DECLARATION */}
        <Text style={styles.declarationText}>
          Declaro que recebi o valor acima indicado, a título de pagamento referente ao serviço/produto descrito neste recibo, ficando quitada a obrigação pela quantia recebida.
        </Text>

        {/* SIGNATURES */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Assinatura do Responsável</Text>
            <Text style={styles.signatureName}>{data.companySettings.company_name}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Assinatura do Cliente</Text>
            <Text style={styles.signatureName}>{data.customer?.full_name || ""}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateReceiptPDF(data: Omit<ReceiptData, "companySettings">): Promise<Buffer> {
  const { getCompanySettings } = await import("./company-settings");
  const companySettings = await getCompanySettings();

  const pdf = ReceiptPDF({ data: { ...data, companySettings } });
  const buffer = await renderToBuffer(pdf);
  return buffer;
}
