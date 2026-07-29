"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { getServiceOrder } from '@/modules/service-orders/services/service-orders.actions';
import { getBudget } from '@/modules/budgets/services/budgets.actions';
import { getCustomerServer } from '@/modules/customers/services/customers.actions';
import { getProfile } from '@/modules/profiles/services/profiles.actions';
import type { BudgetItem } from "@/types";
import { formatCurrency, formatDate } from '@/lib/utils/format';

type Placeholders = {
  'cliente.nome': string;
  'cliente.nacionalidade': string;
  'cliente.estado_civil': string;
  'cliente.profissao': string;
  'cliente.rg': string;
  'cliente.cpf': string;
  'cliente.endereco': string;
  'empresa.nome': string;
  'empresa.cnpj': string;
  'empresa.endereco': string;
  'orcamento.valor_total': string;
  'orcamento.entrada_percentual'?: string;
  'orcamento.prazo_entrega_dias'?: string;
  'orcamento.condicoes_pagamento'?: string;
  'orcamento.garantia_meses'?: string;
  'data_assinatura': string;
};

async function getContractTemplate(serviceOrderId: string): Promise<{ templatePath: string, placeholders: Partial<Placeholders> }> {
  const serviceOrder = await getServiceOrder(serviceOrderId);
  if (!serviceOrder) throw new Error("Ordem de serviço não encontrada");

  const budget = await getBudget(serviceOrder.budget_id);
  if (!budget) throw new Error("Orçamento não encontrado");

  // Decide o template com base nos itens
  const hasMobiliario = budget.items.some((item: BudgetItem) => item.item_type === 'mobiliario');
  const hasServico = budget.items.some((item: BudgetItem) => item.item_type === 'servico');

  let templateName = '';
  // Regra: se tiver apenas serviço, é contrato 3. Se tiver mobiliario (com ou sem serviço junto), é contrato 1 ou 2.
  if (hasMobiliario) {
    // TODO: Precisamos de uma forma de diferenciar se a instalação está inclusa ou não.
    // Por enquanto, vamos assumir que se tem mobiliário, tem instalação.
    templateName = 'contrato1.md';
  } else if (hasServico) {
    templateName = 'contrato3.md';
  } else {
    // Fallback para o contrato 1 se não houver uma regra clara.
    templateName = 'contrato1.md';
  }

  const templatePath = path.join(process.cwd(), 'modelos', 'contratos', templateName);

  const placeholders = {
    'orcamento.valor_total': formatCurrency(budget.total_amount),
    'orcamento.entrada_percentual': budget.deposit_percentage?.toString(),
    'orcamento.prazo_entrega_dias': budget.delivery_days?.toString(),
    'orcamento.condicoes_pagamento': budget.payment_conditions || '',
    'orcamento.garantia_meses': budget.warranty_months?.toString()
  };

  return { templatePath, placeholders };
}

async function fillPlaceholders(templateContent: string, serviceOrderId: string, customPlaceholders: Partial<Placeholders>): Promise<string> {
  const serviceOrder = await getServiceOrder(serviceOrderId);
  const customer = await getCustomerServer(serviceOrder.customer_id);
  const profile = await getProfile(); // Assumindo que getProfile() busca o perfil do usuário/empresa logado

  const fullAddress = [
    customer.address_street,
    customer.address_number,
    customer.address_complement,
    customer.address_neighborhood,
    customer.address_city,
    customer.address_state,
    customer.address_zip,
  ].filter(Boolean).join(', ');

  const allPlaceholders = {
    'cliente.nome': customer.full_name || '',
    'cliente.nacionalidade': customer.nationality || '',
    'cliente.estado_civil': customer.marital_status || '',
    'cliente.profissao': customer.profession || '',
    'cliente.rg': customer.rg || '',
    'cliente.cpf': customer.cpf_cnpj || '',
    'cliente.endereco': fullAddress,
    'empresa.nome': profile?.settings?.company_name || 'Roldan Marcenaria',
    'empresa.cnpj': profile?.settings?.company_cnpj || '',
    'empresa.endereco': profile?.settings?.company_address || '',
    'data_assinatura': formatDate(new Date()),
    ...customPlaceholders,
  } as Placeholders;

  let finalContent = templateContent;
  for (const [key, value] of Object.entries(allPlaceholders)) {
    if (value !== undefined) {
      finalContent = finalContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  }

  return finalContent;
}

export async function generateContractForServiceOrder(serviceOrderId: string) {
  const supabase = await createClient();

  const { templatePath, placeholders } = await getContractTemplate(serviceOrderId);
  
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const finalContent = await fillPlaceholders(templateContent, serviceOrderId, placeholders);

  const serviceOrder = await getServiceOrder(serviceOrderId);

  // Salva no banco de dados
  const { data: contract, error } = await supabase
    .from('contracts')
    .insert({
      service_order_id: serviceOrderId,
      customer_id: serviceOrder.customer_id,
      template_path: templatePath,
      content_final: finalContent,
      status: 'generated',
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar contrato:", error);
    throw new Error("Não foi possível salvar o contrato no banco de dados.");
  }

  return contract;
}

export async function getContractForServiceOrder(serviceOrderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('service_order_id', serviceOrderId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar contrato:", error);
    return null;
  }

  return data;
}
