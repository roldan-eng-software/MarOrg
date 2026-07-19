import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Image,
} from "@react-pdf/renderer";
import type {
  Budget,
  BudgetItem,
  Customer,
  PaymentInstallment,
  BudgetImage,
} from "@/types";
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
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.text,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 15,
    marginBottom: 20,
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
  budgetNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "right",
  },
  budgetDate: {
    fontSize: 9,
    color: COLORS.textLight,
    textAlign: "right",
    marginTop: 2,
  },
  validityBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginTop: 6,
    textAlign: "center",
  },

  // Section
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
    marginBottom: 8,
  },

  // Customer info
  customerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  customerField: {
    width: "50%",
    marginBottom: 6,
  },
  customerLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 1,
  },
  customerValue: {
    fontSize: 10,
    color: COLORS.text,
  },

  // Items table
  table: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 6,
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
    padding: 6,
  },
  tableRowAlt: {
    backgroundColor: COLORS.background,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.text,
  },
  tableCellDesc: {
    fontSize: 9,
    color: COLORS.text,
    flex: 4,
  },
  tableCellDim: {
    fontSize: 8,
    color: COLORS.textLight,
    flex: 2,
  },
  tableCellQty: {
    fontSize: 9,
    color: COLORS.text,
    flex: 1,
    textAlign: "center",
  },
  tableCellPrice: {
    fontSize: 9,
    color: COLORS.text,
    flex: 2,
    textAlign: "right",
  },
  itemDetails: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // Totals
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
  },
  totalsBox: {
    width: 250,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalRowFinal: {
    backgroundColor: COLORS.primary,
    padding: 10,
    marginTop: 4,
    borderRadius: 3,
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  totalValue: {
    fontSize: 10,
    color: COLORS.text,
  },
  totalLabelFinal: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
  },
  totalValueFinal: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.white,
  },

  // Payment
  paymentTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  paymentTypeBadge: {
    backgroundColor: COLORS.background,
    color: COLORS.primary,
    fontSize: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
    fontWeight: "bold",
  },
  paymentTable: {
    marginTop: 8,
  },
  paymentTableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    padding: 6,
    borderRadius: 3,
  },
  paymentTableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    padding: 6,
  },
  paymentConditions: {
    marginTop: 8,
    fontSize: 9,
    color: COLORS.textLight,
    fontStyle: "italic",
  },

  // Notes
  notesContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
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

  // Images
  imagesSection: {
    marginBottom: 15,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageContainer: {
    width: "30%",
    marginBottom: 10,
  },
  imageBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginBottom: 4,
    overflow: "hidden",
  },
  imagePlaceholder: {
    fontSize: 8,
    color: COLORS.textLight,
    textAlign: "center",
  },
  imageDescription: {
    fontSize: 8,
    color: COLORS.textLight,
    textAlign: "center",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  // Signature
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
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
  signatureCompanyName: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 2,
  },

  // Delivery info
  deliveryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  deliveryField: {
    alignItems: "center",
  },
  deliveryLabel: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  deliveryValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 2,
  },
});

interface BudgetPDFData {
  budget: Budget;
  items: BudgetItem[];
  customer: Customer;
  images?: BudgetImage[];
  companySettings: CompanySettings;
}

function renderPaymentInstallments(
  installments: PaymentInstallment[],
  totalAmount: number
) {
  if (!installments || installments.length === 0) return null;

  return (
    <View style={styles.paymentTable}>
      <View style={styles.paymentTableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Parcela</Text>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Descrição</Text>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Vencimento</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>%</Text>
        <Text
          style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}
        >
          Valor
        </Text>
      </View>
      {installments.map((p, i) => (
        <View
          key={i}
          style={[
            styles.paymentTableRow,
            i % 2 === 0 ? {} : styles.tableRowAlt,
          ]}
        >
          <Text style={[styles.tableCell, { flex: 1 }]}>{p.installment}ª</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{p.description}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>
            {p.due_date ? formatDate(p.due_date) : "A definir"}
          </Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{p.percentage}%</Text>
          <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>
            {formatCurrency(totalAmount * (p.percentage / 100))}
          </Text>
        </View>
      ))}
    </View>
  );
}

function renderImages(images?: BudgetImage[]) {
  if (!images || images.length === 0) {
    return (
      <View style={styles.imagesSection}>
        <Text style={styles.sectionTitle}>Imagens / Desenhos Técnicos</Text>
        <View style={styles.imagesGrid}>
          {[1, 2, 3].map((slot) => (
            <View key={slot} style={styles.imageContainer}>
              <View style={styles.imageBox}>
                <Text style={styles.imagePlaceholder}>
                  Área reservada para{"\n"}imagem ou desenho técnico
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.imagesSection}>
      <Text style={styles.sectionTitle}>Imagens / Desenhos Técnicos</Text>
      <View style={styles.imagesGrid}>
        {images.map((img) => (
          <View key={img.id} style={styles.imageContainer}>
            <View style={styles.imageBox}>
              <Image src={img.image_url} style={styles.uploadedImage} />
            </View>
            {img.description && (
              <Text style={styles.imageDescription}>{img.description}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export function BudgetPDF({
  budget,
  items,
  customer,
  images,
  companySettings,
}: BudgetPDFData) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);
  const installments = budget.payment_installments || [];
  const paymentTypes = budget.payment_types || [];
  const depositPct = Number(budget.deposit_percentage ?? 0);
  const instCount = budget.installment_count ?? 1;
  const totalAmount = Number(budget.total_amount);
  const depositVal = totalAmount * (depositPct / 100);
  const remaining = totalAmount - depositVal;
  const perInstallment = instCount > 0 ? remaining / instCount : remaining;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{companySettings.company_name}</Text>
            <Text style={styles.companyTagline}>Móveis Sob Medida</Text>
            <Text style={styles.companyInfo}>
              {[
                companySettings.company_phone && `Tel: ${companySettings.company_phone}`,
                companySettings.company_address,
                companySettings.company_cnpj && `CNPJ: ${companySettings.company_cnpj}`,
              ].filter(Boolean).join("\n")}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.budgetNumber}>{budget.budget_number}</Text>
            <Text style={styles.budgetDate}>
              Data: {formatDate(budget.created_at)}
            </Text>
            <Text style={styles.validityBadge}>
              Válido por {budget.validity_days} dias
            </Text>
          </View>
        </View>

        {/* CUSTOMER INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          <View style={styles.customerGrid}>
            <View style={styles.customerField}>
              <Text style={styles.customerLabel}>Nome</Text>
              <Text style={styles.customerValue}>{customer.full_name}</Text>
            </View>
            <View style={styles.customerField}>
              <Text style={styles.customerLabel}>Telefone</Text>
              <Text style={styles.customerValue}>{customer.phone}</Text>
            </View>
            {customer.email && (
              <View style={styles.customerField}>
                <Text style={styles.customerLabel}>E-mail</Text>
                <Text style={styles.customerValue}>{customer.email}</Text>
              </View>
            )}
            {customer.cpf_cnpj && (
              <View style={styles.customerField}>
                <Text style={styles.customerLabel}>CPF/CNPJ</Text>
                <Text style={styles.customerValue}>{customer.cpf_cnpj}</Text>
              </View>
            )}
            {(customer.address_street || customer.address_neighborhood || customer.address_city) && (
              <View style={[styles.customerField, { width: "100%" }]}>
                <Text style={styles.customerLabel}>Endereço</Text>
                <Text style={styles.customerValue}>
                  {[
                    customer.address_street,
                    customer.address_number,
                    customer.address_complement,
                    customer.address_neighborhood,
                    customer.address_city && customer.address_state
                      ? `${customer.address_city}/${customer.address_state}`
                      : customer.address_city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {customer.address_zip && ` - CEP: ${customer.address_zip}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* DELIVERY INFO */}
        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryField}>
            <Text style={styles.deliveryLabel}>Data do Orçamento</Text>
            <Text style={styles.deliveryValue}>
              {formatDate(budget.created_at)}
            </Text>
          </View>
          <View style={styles.deliveryField}>
            <Text style={styles.deliveryLabel}>Validade</Text>
            <Text style={styles.deliveryValue}>
              {budget.validity_days} dias
            </Text>
          </View>
          {budget.delivery_days && (
            <View style={styles.deliveryField}>
              <Text style={styles.deliveryLabel}>Prazo de Entrega</Text>
              <Text style={styles.deliveryValue}>
                {budget.delivery_days} dias
              </Text>
            </View>
          )}
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos e Serviços</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 4 }]}>
                Descrição
              </Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                Dimensões
              </Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qtd</Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 2, textAlign: "right" },
                ]}
              >
                Unitário
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 2, textAlign: "right" },
                ]}
              >
                Total
              </Text>
            </View>
            {items.map((item, i) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  i % 2 !== 0 ? styles.tableRowAlt : {},
                ]}
              >
                <View style={styles.tableCellDesc}>
                  <Text style={styles.tableCell}>{item.description}</Text>
                  {item.material && (
                    <Text style={styles.itemDetails}>
                      Material: {item.material}
                    </Text>
                  )}
                  {item.finish && (
                    <Text style={styles.itemDetails}>
                      Acabamento: {item.finish}
                    </Text>
                  )}
                </View>
                <Text style={styles.tableCellDim}>
                  {item.width_cm && item.height_cm && item.depth_cm
                    ? `${item.width_cm}×${item.depth_cm}×${item.height_cm}cm`
                    : "-"}
                </Text>
                <Text style={styles.tableCellQty}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={styles.tableCellPrice}>
                  {formatCurrency(item.unit_price)}
                </Text>
                <Text style={styles.tableCellPrice}>
                  {formatCurrency(item.total_price)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* TOTALS */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>TOTAL</Text>
              <Text style={styles.totalValueFinal}>
                {formatCurrency(budget.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* PAYMENT CONDITIONS */}
        {(paymentTypes.length > 0 || installments.length > 0 || depositPct > 0 || instCount > 1) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condições de Pagamento</Text>
            {paymentTypes.length > 0 && (
              <View style={styles.paymentTypes}>
                {paymentTypes.map((type, i) => (
                  <Text key={i} style={styles.paymentTypeBadge}>
                    {type}
                  </Text>
                ))}
              </View>
            )}
            {depositPct > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, color: COLORS.text }}>
                  Sinal de Entrada ({depositPct}%): {formatCurrency(depositVal)}
                </Text>
                {instCount > 1 ? (
                  <Text style={{ fontSize: 10, color: COLORS.text }}>
                    Restante: {instCount}x de {formatCurrency(perInstallment)} = {formatCurrency(remaining)}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 10, color: COLORS.text }}>
                    Restante: {formatCurrency(remaining)} (pagamento único)
                  </Text>
                )}
                <Text style={{ fontSize: 11, fontWeight: "bold", color: COLORS.primaryDark, marginTop: 4 }}>
                  Total: {formatCurrency(totalAmount)}
                </Text>
              </View>
            )}
            {renderPaymentInstallments(installments, totalAmount)}
            {budget.payment_conditions && (
              <Text style={styles.paymentConditions}>
                {budget.payment_conditions}
              </Text>
            )}
          </View>
        )}

        {/* NOTES */}
        {budget.notes_client && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Observações</Text>
            <Text style={styles.notesText}>{budget.notes_client}</Text>
          </View>
        )}

        {/* IMAGES */}
        {renderImages(images)}

        {/* SIGNATURE */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Carimbo e Assinatura</Text>
            <Text style={styles.signatureCompanyName}>{companySettings.company_name}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Assinatura do Cliente</Text>
            <Text style={styles.signatureCompanyName}>{customer.full_name}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateBudgetPDF(data: BudgetPDFData): Promise<Buffer> {
  const pdf = BudgetPDF(data);
  const buffer = await renderToBuffer(pdf);
  return buffer;
}
