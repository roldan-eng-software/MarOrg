import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type {
  RevenueReport,
  BudgetReport,
  ServiceOrderReport,
  InventoryReport,
  CustomerReport,
} from "@/modules/reports/services/reports.actions";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const COLORS = {
  primary: "#5B3A29",
  primaryDark: "#3D2519",
  background: "#F5F0EB",
  border: "#D4C4B0",
  text: "#3D2519",
  textLight: "#8B7A6B",
  white: "#FFFFFF",
  green: "#16A34A",
  red: "#DC2626",
  blue: "#2563EB",
  yellow: "#CA8A04",
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 15,
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
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
  headerRight: { alignItems: "flex-end" },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "right",
  },
  reportPeriod: {
    fontSize: 9,
    color: COLORS.textLight,
    textAlign: "right",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    border: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statSubtitle: {
    fontSize: 7,
    color: COLORS.textLight,
    marginTop: 2,
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.white,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  tableCell: {
    fontSize: 8,
    color: COLORS.text,
  },
  tableCellBold: {
    fontSize: 8,
    color: COLORS.text,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    textAlign: "center",
    fontSize: 8,
    color: COLORS.textLight,
  },
});

const COMPANY = {
  name: "Roldan Marcenaria",
  tagline: "Móveis Planejados sob Medida",
  phone: "(11) 99999-9999",
  address: "Rua da Marcenaria, 123 - Centro - São Paulo/SP",
  cnpj: "00.000.000/0001-00",
};

function Header({ title, period }: { title: string; period: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.companyName}>{COMPANY.name}</Text>
        <Text style={styles.companyTagline}>{COMPANY.tagline}</Text>
        <Text style={styles.companyInfo}>
          Tel: {COMPANY.phone}{"\n"}
          {COMPANY.address}{"\n"}
          CNPJ: {COMPANY.cnpj}
        </Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.reportTitle}>{title}</Text>
        <Text style={styles.reportPeriod}>{period}</Text>
      </View>
    </View>
  );
}

function StatBox({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function TableHeader({ columns }: { columns: { label: string; width?: number; align?: "left" | "right" }[] }) {
  return (
    <View style={styles.tableHeader}>
      {columns.map((col, i) => (
        <Text
          key={i}
          style={[
            styles.tableHeaderCell,
            { width: col.width || 100, textAlign: col.align || "left" },
          ]}
        >
          {col.label}
        </Text>
      ))}
    </View>
  );
}

function TableRow({
  columns,
  isAlt,
}: {
  columns: { value: string; width?: number; align?: "left" | "right"; bold?: boolean }[];
  isAlt: boolean;
}) {
  return (
    <View style={isAlt ? styles.tableRowAlt : styles.tableRow}>
      {columns.map((col, i) => (
        <Text
          key={i}
          style={[
            col.bold ? styles.tableCellBold : styles.tableCell,
            { width: col.width || 100, textAlign: col.align || "left" },
          ]}
        >
          {col.value}
        </Text>
      ))}
    </View>
  );
}

function RevenuePDF({ data }: { data: RevenueReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header title="Relatório de Faturamento" period={data.period} />

        <View style={styles.statRow}>
          <StatBox label="Faturamento Total" value={formatCurrency(data.totalRevenue)} />
          <StatBox label="Orçamentos Aprovados" value={String(data.approvedCount)} />
          <StatBox label="Ticket Médio" value={formatCurrency(data.averageBudget)} />
          <StatBox label="Período" value={data.period} />
        </View>

        <Text style={styles.sectionTitle}>Detalhamento</Text>
        <View style={styles.table}>
          <TableHeader columns={[
            { label: "Orçamento", width: 80 },
            { label: "Cliente", width: 160 },
            { label: "Valor", width: 80, align: "right" },
            { label: "Data", width: 80, align: "right" },
          ]} />
          {data.items.map((item, i) => (
            <TableRow
              key={i}
              isAlt={i % 2 === 1}
              columns={[
                { value: item.budget_number, width: 80, bold: true },
                { value: item.customer_name, width: 160 },
                { value: formatCurrency(item.total_amount), width: 80, align: "right", bold: true },
                { value: formatDate(item.created_at), width: 80, align: "right" },
              ]}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")} - {COMPANY.name}</Text>
        </View>
      </Page>
    </Document>
  );
}

function BudgetPDF({ data }: { data: BudgetReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header title="Relatório de Orçamentos" period="Todos os períodos" />

        <View style={styles.statRow}>
          <StatBox label="Total de Orçamentos" value={String(data.total)} />
          <StatBox label="Taxa de Conversão" value={`${data.conversionRate}%`} />
          <StatBox label="Valor Médio" value={formatCurrency(data.averageValue)} />
        </View>

        <Text style={styles.subtitle}>Por Status</Text>
        <View style={styles.statRow}>
          {data.byStatus.slice(0, 4).map((s, i) => (
            <StatBox
              key={i}
              label={s.status.replace("_", " ")}
              value={String(s.count)}
              subtitle={formatCurrency(s.total)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Lista</Text>
        <View style={styles.table}>
          <TableHeader columns={[
            { label: "Orçamento", width: 80 },
            { label: "Cliente", width: 140 },
            { label: "Status", width: 80 },
            { label: "Valor", width: 80, align: "right" },
          ]} />
          {data.items.slice(0, 30).map((item, i) => (
            <TableRow
              key={i}
              isAlt={i % 2 === 1}
              columns={[
                { value: item.budget_number, width: 80, bold: true },
                { value: item.customer_name, width: 140 },
                { value: item.status.replace("_", " "), width: 80 },
                { value: formatCurrency(item.total_amount), width: 80, align: "right", bold: true },
              ]}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")} - {COMPANY.name}</Text>
        </View>
      </Page>
    </Document>
  );
}

function ServiceOrderPDF({ data }: { data: ServiceOrderReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header title="Relatório de Ordens de Serviço" period="Todos os períodos" />

        <View style={styles.statRow}>
          <StatBox label="Total de OS" value={String(data.total)} />
          <StatBox label="Prazo Médio" value={`${data.averageDeliveryDays} dias`} />
          <StatBox label="Entregas no Prazo" value={`${data.onTimeRate}%`} />
        </View>

        <Text style={styles.subtitle}>Por Status</Text>
        <View style={styles.statRow}>
          {data.byStatus.slice(0, 4).map((s, i) => (
            <StatBox
              key={i}
              label={s.status.replace("_", " ")}
              value={String(s.count)}
              subtitle={formatCurrency(s.total)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Lista</Text>
        <View style={styles.table}>
          <TableHeader columns={[
            { label: "OS", width: 80 },
            { label: "Cliente", width: 130 },
            { label: "Status", width: 80 },
            { label: "Valor", width: 70, align: "right" },
            { label: "Entrega", width: 70, align: "right" },
          ]} />
          {data.items.slice(0, 30).map((item, i) => (
            <TableRow
              key={i}
              isAlt={i % 2 === 1}
              columns={[
                { value: item.order_number, width: 80, bold: true },
                { value: item.customer_name, width: 130 },
                { value: item.status.replace("_", " "), width: 80 },
                { value: formatCurrency(item.total_amount), width: 70, align: "right", bold: true },
                { value: item.estimated_delivery ? formatDate(item.estimated_delivery) : "-", width: 70, align: "right" },
              ]}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")} - {COMPANY.name}</Text>
        </View>
      </Page>
    </Document>
  );
}

function InventoryPDF({ data }: { data: InventoryReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header title="Relatório de Estoque" period="Todos os períodos" />

        <View style={styles.statRow}>
          <StatBox label="Materiais" value={String(data.totalMaterials)} />
          <StatBox label="Valor em Estoque" value={formatCurrency(data.totalValue)} />
          <StatBox
            label="Estoque Baixo"
            value={String(data.lowStockCount)}
            subtitle={data.lowStockCount > 0 ? "Atenção!" : "Tudo ok"}
          />
        </View>

        {data.byCategory.length > 0 && (
          <>
            <Text style={styles.subtitle}>Por Categoria</Text>
            <View style={styles.table}>
              <TableHeader columns={[
                { label: "Categoria", width: 150 },
                { label: "Itens", width: 80, align: "right" },
                { label: "Valor", width: 100, align: "right" },
              ]} />
              {data.byCategory.map((c, i) => (
                <TableRow
                  key={i}
                  isAlt={i % 2 === 1}
                  columns={[
                    { value: c.category, width: 150, bold: true },
                    { value: String(c.count), width: 80, align: "right" },
                    { value: formatCurrency(c.value), width: 100, align: "right" },
                  ]}
                />
              ))}
            </View>
          </>
        )}

        {data.materials.filter((m) => m.min_stock > 0 && m.current_stock <= m.min_stock).length > 0 && (
          <>
            <Text style={styles.subtitle}>Estoque Baixo</Text>
            <View style={styles.table}>
              <TableHeader columns={[
                { label: "Material", width: 150 },
                { label: "Categoria", width: 100 },
                { label: "Estoque", width: 80, align: "right" },
                { label: "Mínimo", width: 80, align: "right" },
              ]} />
              {data.materials
                .filter((m) => m.min_stock > 0 && m.current_stock <= m.min_stock)
                .map((m, i) => (
                  <TableRow
                    key={i}
                    isAlt={i % 2 === 1}
                    columns={[
                      { value: m.name, width: 150, bold: true },
                      { value: m.category, width: 100 },
                      { value: `${m.current_stock} ${m.unit}`, width: 80, align: "right" },
                      { value: `${m.min_stock} ${m.unit}`, width: 80, align: "right" },
                    ]}
                  />
                ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")} - {COMPANY.name}</Text>
        </View>
      </Page>
    </Document>
  );
}

function CustomerPDF({ data }: { data: CustomerReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header title="Relatório de Clientes" period="Todos os períodos" />

        <View style={styles.statRow}>
          <StatBox label="Total de Clientes" value={String(data.totalCustomers)} />
          <StatBox label="Clientes Compradores" value={String(data.topCustomers.length)} />
          <StatBox
            label="Top Cliente"
            value={data.topCustomers[0]?.name || "-"}
            subtitle={data.topCustomers[0] ? formatCurrency(data.topCustomers[0].total_spent) : ""}
          />
        </View>

        <Text style={styles.sectionTitle}>Top Clientes por Faturamento</Text>
        <View style={styles.table}>
          <TableHeader columns={[
            { label: "#", width: 30 },
            { label: "Cliente", width: 140 },
            { label: "Telefone", width: 90 },
            { label: "Orçamentos", width: 70, align: "right" },
            { label: "Total Gasto", width: 80, align: "right" },
          ]} />
          {data.topCustomers.map((c, i) => (
            <TableRow
              key={i}
              isAlt={i % 2 === 1}
              columns={[
                { value: String(i + 1), width: 30 },
                { value: c.name, width: 140, bold: true },
                { value: c.phone, width: 90 },
                { value: String(c.budget_count), width: 70, align: "right" },
                { value: formatCurrency(c.total_spent), width: 80, align: "right", bold: true },
              ]}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")} - {COMPANY.name}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateReportPDF(
  type: "revenue" | "budgets" | "orders" | "inventory" | "customers",
  data: RevenueReport | BudgetReport | ServiceOrderReport | InventoryReport | CustomerReport
): Promise<Buffer> {
  let doc;

  switch (type) {
    case "revenue":
      doc = <RevenuePDF data={data as RevenueReport} />;
      break;
    case "budgets":
      doc = <BudgetPDF data={data as BudgetReport} />;
      break;
    case "orders":
      doc = <ServiceOrderPDF data={data as ServiceOrderReport} />;
      break;
    case "inventory":
      doc = <InventoryPDF data={data as InventoryReport} />;
      break;
    case "customers":
      doc = <CustomerPDF data={data as CustomerReport} />;
      break;
  }

  const buffer = await renderToBuffer(doc);
  return buffer;
}
