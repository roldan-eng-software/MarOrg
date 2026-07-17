import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Budget, BudgetItem, Customer } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#5B3A29",
    paddingBottom: 15,
  },
  company: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5B3A29",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#8B7A6B",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3D2519",
    marginTop: 20,
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 9,
    color: "#8B7A6B",
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    color: "#3D2519",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F0EB",
    borderBottomWidth: 1,
    borderBottomColor: "#D4C4B0",
    padding: 8,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#3D2519",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#D4C4B0",
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
    color: "#3D2519",
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#5B3A29",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  footer: {
    marginTop: 30,
    fontSize: 9,
    color: "#8B7A6B",
    textAlign: "center",
  },
  notes: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#F5F0EB",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#3D2519",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: "#3D2519",
  },
});

interface BudgetPDFData {
  budget: Budget;
  items: BudgetItem[];
  customer: Customer;
}

export function BudgetPDF({ budget, items, customer }: BudgetPDFData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.company}>Roldan Marcenaria</Text>
          <Text style={styles.subtitle}>Móveis Sob Medida</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>
            Orçamento {budget.budget_number}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Cliente</Text>
              <Text style={styles.value}>{customer.full_name}</Text>
            </View>
            <View>
              <Text style={styles.label}>Data</Text>
              <Text style={styles.value}>{formatDate(budget.created_at)}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Telefone</Text>
              <Text style={styles.value}>{customer.phone}</Text>
            </View>
            <View>
              <Text style={styles.label}>Validade</Text>
              <Text style={styles.value}>
                {budget.validity_days} dias
              </Text>
            </View>
          </View>
          {customer.email && (
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>E-mail</Text>
                <Text style={styles.value}>{customer.email}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>
              Descrição
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qtd</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>
              Unitário
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>
              Total
            </Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {item.description}
                {item.material ? ` (${item.material})` : ""}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {formatCurrency(item.total_price)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(budget.total_amount)}
          </Text>
        </View>

        {budget.notes_client && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Observações</Text>
            <Text style={styles.notesText}>{budget.notes_client}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Orçamento válido por {budget.validity_days} dias
        </Text>
      </Page>
    </Document>
  );
}

export async function generateBudgetPDF(data: BudgetPDFData): Promise<Buffer> {
  const pdf = BudgetPDF(data);
  const buffer = await renderToBuffer(pdf);
  return buffer;
}
