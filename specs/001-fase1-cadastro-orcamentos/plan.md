# Plano Técnico — Fase 1: Cadastro de Clientes e Orçamentos

**Versão:** 1.0.0
**Data:** 2026-07-17
**Autor:** Sistema

---

## 1. Visão Geral

Implementação da primeira fase do Sistema de Gestão para Marcenaria Sob Medida:
cadastro de clientes, criação de orçamentos com itens de móveis e serviços, cálculo
automático de valores, controle de status, geração de PDF e registro de comunicações
com o cliente. Sistema monolítico Next.js, uso exclusivo da Roldan Marcenaria.

## 2. Constitution Check

| Princípio | Conforme? | Justificativa |
|-----------|-----------|---------------|
| I — Regras de negócio antes da tecnologia | ✅ | Especificação definiu regras, estados, validações e critérios antes deste plano técnico. Decisões de stack estão nesta seção. |
| II — Integridade documental e rastreabilidade | ✅ | Orçamentos possuem ID único, versão, data de emissão. PDFs gerados são imutáveis com referência ao registro de origem. Toda alteração gera novo registro com justificativa. |
| III — Fonte única e congelamento de dados | ✅ | Clientes são fonte principal. PDFs armazenam snapshot dos dados no momento da emissão. Orçamento aprovado congela dados para futura conversão em OS. |
| IV — Financeiro baseado em lançamentos | ⚠ | Fase 1 não inclui financeiro. Lançamentos serão implementados na Fase 3 conforme Princípio IV. Estrutura preparada para recebimentos futuros. |
| V — Segurança, privacidade e controle de acesso | ✅ | Supabase Auth com 4 perfis. RLS em todas as tabelas com dados sensíveis. URLs assinadas para PDFs. Trilha de auditoria. Variáveis privadas somente no servidor. |
| VI — Comunicação verificável com o cliente | ✅ | Toda geração de PDF gera registro de comunicação. Envios por e-mail (Resend) e WhatsApp (link wa.me) são registrados com canal, destinatário, data, status e responsável. |
| VII — Operação orientada a status e prazos | ✅ | Status mínimos do orçamento definidos: rascunho, enviado, em análise, aprovado, recusado, vencido, revisado. Transições validadas com registro de data, usuário e motivo. |
| VIII — Qualidade, validação e evolução incremental | ✅ | Testes unitários (Vitest), componentes (RTL), ponta a ponta (Playwright). Cobertura obrigatória de regras críticas. Migrations versionadas reversíveis. |
| IX — Experiência simples e adequada à rotina | ✅ | Interface responsiva desktop-first com Tailwind. Formulários com React Hook Form + Zod. Valores em formato brasileiro. Campos obrigatórios visíveis. |

## 3. Stack e Tecnologias

### Aplicação

| Tecnologia | Versão (estável) | Justificativa |
|------------|-------------------|---------------|
| Next.js | 15.x (App Router) | Full-stack monolítico, Server Components, Server Actions, deploy nativo na Vercel |
| TypeScript | 5.x (strict) | Type safety, refactoring seguro, documentação via tipos |
| React | 19.x | Server Components nativos, hooks modernos |
| Tailwind CSS | 4.x | Utility-first responsivo, sem CSS extra |
| React Hook Form | 7.x | Formulários performáticos com re-render mínimo |
| Zod | 3.x | Validação compartilhada cliente/servidor com inferência de tipos |
| Vitest | 3.x | Testes unitários rápidos, compatível com ESM |
| React Testing Library | 16.x | Testes de componentes orientados ao usuário |
| Playwright | 1.x | Testes ponta a ponta multi-browser |
| ESLint | 9.x | Linting com flat config |
| Prettier | 3.x | Formatação consistente |
| Bun | 1.x | Runtime e gerenciador de pacotes em desenvolvimento |

### Dados e Autenticação

| Tecnologia | Justificativa |
|------------|---------------|
| Supabase PostgreSQL | Banco principal, hospedado, com Auth e Storage integrados |
| Supabase Auth | Login por e-mail/senha, perfis via user_metadata ou tabela profiles |
| @supabase/ssr | Autenticação server-side baseada em cookies |
| Supabase Storage | Bucket privado para PDFs e anexos com URLs assinadas |
| Row Level Security | Segunda camada de defesa em todas as tabelas sensíveis |

### Comunicação e Documentos

| Tecnologia | Justificativa |
|------------|---------------|
| @react-pdf/renderer | Geração de PDFs no Node.js da Vercel sem binários pesados |
| Resend | E-mails transacionais com templates simples |
| wa.me link | WhatsApp MVP com mensagem pré-preenchida |

## 4. Arquitetura

### Visão Geral

Aplicação monolítica Next.js 15 (App Router) com Server Components e Server Actions.
Deploy na Vercel. Banco Supabase hospedado. Sem backend separado, microserviços,
filas ou Redis.

### Estrutura de Diretórios

```
marcenaria/
├── src/
│   ├── app/                          # App Router pages
│   │   ├── (auth)/                   # Grupo de rotas públicas
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (protected)/              # Grupo de rotas autenticadas
│   │   │   ├── layout.tsx            # Sidebar + verificação de auth
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx          # Lista de clientes
│   │   │   │   ├── new/page.tsx      # Cadastro
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalhes do cliente
│   │   │   │       └── edit/page.tsx # Edição
│   │   │   ├── budgets/
│   │   │   │   ├── page.tsx          # Lista de orçamentos
│   │   │   │   ├── new/page.tsx      # Novo orçamento
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalhes do orçamento
│   │   │   │       ├── edit/page.tsx # Edição (rascunho)
│   │   │   │       └── send/page.tsx # Envio de orçamento
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── pdf/[id]/route.ts     # Download protegido de PDF
│   │   │   └── health/route.ts       # Health check
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Redirect para dashboard/login
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client (cookies)
│   │   │   └── admin.ts              # Service role client (server-only)
│   │   ├── validations/
│   │   │   ├── customer.ts           # Schemas Zod de cliente
│   │   │   └── budget.ts             # Schemas Zod de orçamento
│   │   └── utils/
│   │       ├── format.ts             # Formatação brasileira (moeda, data)
│   │       └── pdf.ts                # Helpers de PDF
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── actions.ts            # Server Actions de login/logout
│   │   │   ├── queries.ts            # Consultas de sessão
│   │   │   └── schemas.ts            # Validações de login
│   │   ├── customers/
│   │   │   ├── actions.ts            # CRUD de clientes
│   │   │   ├── queries.ts            # Listagem, busca, detalhes
│   │   │   ├── schemas.ts            # Validações Zod
│   │   │   └── components/           # Componentes específicos
│   │   │       ├── customer-form.tsx
│   │   │       ├── customer-list.tsx
│   │   │       └── customer-search.tsx
│   │   ├── budgets/
│   │   │   ├── actions.ts            # CRUD, status, envio
│   │   │   ├── queries.ts            # Listagem, detalhes
│   │   │   ├── schemas.ts            # Validações Zod
│   │   │   ├── services/
│   │   │   │   ├── calculate.ts      # Cálculo de valores
│   │   │   │   └── status.ts         # Transições de status
│   │   │   └── components/
│   │   │       ├── budget-form.tsx
│   │   │       ├── budget-list.tsx
│   │   │       ├── budget-item-form.tsx
│   │   │       ├── budget-summary.tsx
│   │   │       └── budget-status-badge.tsx
│   │   ├── documents/
│   │   │   ├── actions.ts            # Geração de PDF
│   │   │   ├── queries.ts            # Listagem de documentos
│   │   │   ├── schemas.ts
│   │   │   ├── services/
│   │   │   │   ├── pdf-generator.ts  # Lógica de geração PDF
│   │   │   │   └── storage.ts        # Upload/download do Storage
│   │   │   └── components/
│   │   │       └── pdf-preview.tsx
│   │   ├── communications/
│   │   │   ├── actions.ts            # Envio de e-mail/WhatsApp
│   │   │   ├── queries.ts            # Histórico de comunicações
│   │   │   ├── schemas.ts
│   │   │   ├── services/
│   │   │   │   ├── email.ts          # Integração Resend
│   │   │   │   └── whatsapp.ts       # Geração de link wa.me
│   │   │   └── components/
│   │   │       ├── send-email-form.tsx
│   │   │       ├── send-whatsapp-form.tsx
│   │   │       └── communication-history.tsx
│   │   └── audit/
│   │       ├── queries.ts            # Consulta de logs
│   │       └── services/
│   │           └── logger.ts         # Registro de auditoria
│   ├── components/
│   │   ├── ui/                       # Componentes genéricos
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   └── loading.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── page-header.tsx
│   │   └── shared/
│   │       ├── confirm-dialog.tsx
│   │       ├── empty-state.tsx
│   │       └── error-boundary.tsx
│   └── types/
│       ├── database.ts               # Tipos gerados do Supabase
│       └── index.ts                  # Tipos compartilhados
├── supabase/
│   ├── migrations/                   # Migrations SQL versionadas
│   │   ├── 001_create_profiles.sql
│   │   ├── 002_create_customers.sql
│   │   ├── 003_create_budgets.sql
│   │   ├── 004_create_budget_items.sql
│   │   ├── 005_create_documents.sql
│   │   ├── 006_create_communications.sql
│   │   ├── 007_create_audit_logs.sql
│   │   └── 008_rls_policies.sql
│   ├── seed.sql                      # Dados iniciais (perfis, admin)
│   └── config.toml                   # Configuração do Supabase local
├── tests/
│   ├── unit/
│   │   ├── budgets/
│   │   │   ├── calculate.test.ts
│   │   │   └── status.test.ts
│   │   ├── customers/
│   │   │   └── schemas.test.ts
│   │   └── lib/
│   │       └── format.test.ts
│   ├── components/
│   │   ├── budgets/
│   │   │   └── budget-form.test.tsx
│   │   └── customers/
│   │       └── customer-form.test.tsx
│   └── e2e/
│       ├── auth.spec.ts
│       ├── customers.spec.ts
│       └── budgets.spec.ts
├── public/
│   └── logo.png                      # Logo da marcenaria (opcional)
├── .env.local.example                # Variáveis de ambiente exemplo
├── .env.local                        # Variáveis de ambiente (não versionado)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.mjs
├── .prettierrc
├── package.json
└── bun.lockb
```

### Fluxo de Requisição (Server Actions)

```
Browser → Server Action (validação Zod) → Service (regra de negócio)
  → Repository (queries Supabase) → Supabase PostgreSQL
  → revalidatePath → Atualização da UI
```

### Fluxo de PDF

```
Server Action "generate PDF" → Valida dados no Supabase
  → @react-pdf/renderer monta documento
  → Upload para Supabase Storage (bucket privado)
  → Registro na tabela documents
  → Retorno de URL assinada temporária
```

### Fluxo de Comunicação

```
Server Action "send email/WhatsApp" → Valida dados
  → Gera registro em communications (status: pending)
  → Envia via Resend ou gera link wa.me
  → Atualiza registro com status (success/failed)
  → Se falhou, NÃO marca orçamento como enviado
```

## 5. Modelo de Dados

### Entidades Principais

#### profiles (perfis de usuário)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK, FK → auth.users.id | Mesmo ID do auth |
| full_name | text | NOT NULL | Nome completo |
| role | text | NOT NULL, CHECK (admin, comercial, financeiro, producao) | Perfil de acesso |
| active | boolean | NOT NULL DEFAULT true | Usuário ativo |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de criação |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Última atualização |

#### customers (clientes)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| full_name | text | NOT NULL, CHECK LENGTH >= 2 | Nome completo |
| email | text | | E-mail (opcional) |
| phone | text | NOT NULL | Telefone principal |
| phone_secondary | text | | Telefone secundário |
| cpf_cnpj | text | | CPF ou CNPJ |
| address_street | text | | Rua |
| address_number | text | | Número |
| address_complement | text | | Complemento |
| address_neighborhood | text | | Bairro |
| address_city | text | | Cidade |
| address_state | text | | Estado (2 caracteres) |
| address_zip | text | | CEP |
| notes | text | | Observações |
| active | boolean | NOT NULL DEFAULT true | Cancelamento lógico |
| created_by | uuid | NOT NULL, FK → profiles.id | Usuário que criou |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de criação |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Última atualização |

#### budgets (orçamentos)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| budget_number | text | NOT NULL, UNIQUE | Número sequencial (ex: ORC-2026-0001) |
| customer_id | uuid | NOT NULL, FK → customers.id | Cliente vinculado |
| status | text | NOT NULL DEFAULT 'rascunho', CHECK | Status atual |
| version | integer | NOT NULL DEFAULT 1 | Versão do orçamento |
| validity_days | integer | NOT NULL DEFAULT 30 | Dias de validade |
| notes_internal | text | | Observações internas (não aparece no PDF) |
| notes_client | text | | Observações para o cliente (aparece no PDF) |
| total_amount | numeric(12,2) | NOT NULL DEFAULT 0 | Valor total calculado |
| created_by | uuid | NOT NULL, FK → profiles.id | Usuário que criou |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de criação |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Última atualização |
| sent_at | timestamptz | | Data do primeiro envio |
| approved_at | timestamptz | | Data da aprovação |
| refused_at | timestamptz | | Data da recusa |

#### budget_items (itens do orçamento)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| budget_id | uuid | NOT NULL, FK → budgets.id ON DELETE CASCADE | Orçamento pai |
| item_type | text | NOT NULL, CHECK (mobiliario, servico) | Tipo do item |
| description | text | NOT NULL, CHECK LENGTH >= 3 | Descrição do item |
| material | text | | Material (para móveis) |
| width_cm | numeric(8,2) | | Largura em cm (para móveis) |
| depth_cm | numeric(8,2) | | Profundidade em cm (para móveis) |
| height_cm | numeric(8,2) | | Altura em cm (para móveis) |
| finish | text | | Acabamento (para móveis) |
| unit | text | NOT NULL DEFAULT 'un' | Unidade de medida |
| quantity | numeric(10,3) | NOT NULL, CHECK > 0 | Quantidade |
| unit_price | numeric(12,2) | NOT NULL, CHECK > 0 | Valor unitário |
| discount | numeric(12,2) | NOT NULL DEFAULT 0 | Desconto (opcional) |
| total_price | numeric(12,2) | NOT NULL | Total do item (calculado) |
| notes | text | | Observações do item |
| sort_order | integer | NOT NULL DEFAULT 0 | Ordem de exibição |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de criação |

#### budget_status_history (histórico de status)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| budget_id | uuid | NOT NULL, FK → budgets.id ON DELETE CASCADE | Orçamento |
| from_status | text | | Status anterior (NULL no primeiro) |
| to_status | text | NOT NULL | Novo status |
| reason | text | | Motivo (obrigatório para aprovação/recusa) |
| changed_by | uuid | NOT NULL, FK → profiles.id | Usuário responsável |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data da transição |

#### documents (documentos)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| document_type | text | NOT NULL, CHECK (orcamento, ordem_servico, contrato, recibo) | Tipo |
| file_name | text | NOT NULL | Nome do arquivo |
| storage_path | text | NOT NULL | Caminho no Storage |
| mime_type | text | NOT NULL DEFAULT 'application/pdf' | Tipo MIME |
| version | integer | NOT NULL DEFAULT 1 | Versão do documento |
| entity_type | text | NOT NULL | Tipo da entidade origem |
| entity_id | uuid | NOT NULL | ID da entidade origem |
| customer_id | uuid | NOT NULL, FK → customers.id | Cliente |
| file_size | integer | | Tamanho em bytes |
| generated_by | uuid | NOT NULL, FK → profiles.id | Usuário que gerou |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de geração |

#### communications (comunicações)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| channel | text | NOT NULL, CHECK (email, whatsapp) | Canal de envio |
| recipient | text | NOT NULL | E-mail ou telefone do destinatário |
| subject | text | | Assunto (para e-mail) |
| message | text | NOT NULL | Mensagem enviada |
| document_id | uuid | FK → documents.id | Documento vinculado |
| entity_type | text | | Tipo da entidade origem |
| entity_id | uuid | | ID da entidade origem |
| status | text | NOT NULL, CHECK (pending, success, failed) | Resultado do envio |
| error_message | text | | Mensagem de erro (se falhou) |
| sent_by | uuid | NOT NULL, FK → profiles.id | Usuário responsável |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data do envio |

#### audit_logs (logs de auditoria)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| user_id | uuid | FK → profiles.id | Usuário que realizou a ação |
| action | text | NOT NULL | Tipo da ação (create, update, delete, approve, send, generate_pdf, etc.) |
| entity_type | text | NOT NULL | Tipo da entidade afetada |
| entity_id | uuid | NOT NULL | ID da entidade afetada |
| old_values | jsonb | | Valores anteriores (para updates) |
| new_values | jsonb | | Valores novos |
| ip_address | text | | Endereço IP |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data da ação |

### Índices

```sql
-- customers
CREATE INDEX idx_customers_full_name ON customers (full_name);
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_customers_cpf_cnpj ON customers (cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;
CREATE INDEX idx_customers_active ON customers (active) WHERE active = true;

-- budgets
CREATE INDEX idx_budgets_customer_id ON budgets (customer_id);
CREATE INDEX idx_budgets_status ON budgets (status);
CREATE INDEX idx_budgets_created_at ON budgets (created_at DESC);
CREATE INDEX idx_budgets_budget_number ON budgets (budget_number);

-- budget_items
CREATE INDEX idx_budget_items_budget_id ON budget_items (budget_id);

-- budget_status_history
CREATE INDEX idx_budget_status_history_budget_id ON budget_status_history (budget_id);

-- documents
CREATE INDEX idx_documents_entity ON documents (entity_type, entity_id);
CREATE INDEX idx_documents_customer_id ON documents (customer_id);
CREATE INDEX idx_documents_created_at ON documents (created_at DESC);

-- communications
CREATE INDEX idx_communications_entity ON communications (entity_type, entity_id);
CREATE INDEX idx_communications_customer_id ON communications (customer_id);
CREATE INDEX idx_communications_created_at ON communications (created_at DESC);

-- audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
```

### Constraints e Triggers

```sql
-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: calcular total_amount do orçamento
CREATE OR REPLACE FUNCTION calculate_budget_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE budgets
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM budget_items
    WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
  )
  WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_budget_items_total
  AFTER INSERT OR UPDATE OR DELETE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION calculate_budget_total();

-- Trigger: calcular total_price do item
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_price := (NEW.quantity * NEW.unit_price) - NEW.discount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_budget_item_calculate_total
  BEFORE INSERT OR UPDATE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION calculate_item_total();

-- Trigger: impedir alteração de orçamento aprovado/recusado
CREATE OR REPLACE FUNCTION prevent_budget_edit_after_decision()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('aprovado', 'recusado', 'vencido') THEN
    RAISE EXCEPTION 'Não é possível editar orçamento com status %', OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_prevent_budget_edit
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION prevent_budget_edit_after_decision();
```

### Políticas RLS

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles: usuários veem apenas seu próprio perfil; admin vê todos
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- customers: todos os autenticados podem listar; apenas admin e comercial podem criar/editar
CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

-- customers: impedir DELETE físico (apenas soft delete via update)

-- budgets: todos os autenticados podem listar; apenas admin e comercial podem criar/editar
CREATE POLICY "budgets_select" ON budgets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "budgets_insert" ON budgets
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "budgets_update" ON budgets
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

-- budget_items: herda permissões do orçamento pai
CREATE POLICY "budget_items_select" ON budget_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND auth.role() = 'authenticated'
    )
  );

CREATE POLICY "budget_items_insert" ON budget_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
    )
  );

CREATE POLICY "budget_items_update" ON budget_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
    )
  );

CREATE POLICY "budget_items_delete" ON budget_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND budgets.status = 'rascunho'
      AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
    )
  );

-- documents: apenas admin e comercial podem visualizar;Storage path controla acesso
CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

-- communications: apenas admin e comercial podem criar; todos autenticados podem listar
CREATE POLICY "communications_select" ON communications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "communications_insert" ON communications
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

-- audit_logs: apenas admin pode visualizar; inserção via server-only
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Supabase Storage: bucket "documents" privado
-- Policies do Storage:
-- authenticated: upload (apenas admin/comercial)
-- authenticated: download (todos autenticados)
-- NENHUMA política pública para selects ou downloads
```

## 6. Server Actions e Route Handlers

### Server Actions

#### auth/actions.ts

| Ação | Descrição | Perfil |
|------|-----------|--------|
| login(email, password) | Autentica usuário | Público |
| logout() | Encerra sessão | Autenticado |

#### customers/actions.ts

| Ação | Descrição | Perfil |
|------|-----------|--------|
| createCustomer(data) | Cadastra novo cliente | Admin, Comercial |
| updateCustomer(id, data) | Atualiza dados do cliente | Admin, Comercial |
| deactivateCustomer(id) | Soft delete do cliente | Admin |

#### budgets/actions.ts

| Ação | Descrição | Perfil |
|------|-----------|--------|
| createBudget(customerId) | Cria orçamento em rascunho | Admin, Comercial |
| updateBudget(id, data) | Atualiza dados gerais do orçamento | Admin, Comercial |
| addBudgetItem(budgetId, item) | Adiciona item ao orçamento | Admin, Comercial |
| updateBudgetItem(id, item) | Atualiza item do orçamento | Admin, Comercial |
| removeBudgetItem(id) | Remove item do orçamento | Admin, Comercial |
| changeBudgetStatus(id, status, reason?) | Transição de status | Admin, Comercial |

#### documents/actions.ts

| Ação | Descrição | Perfil |
|------|-----------|--------|
| generateBudgetPdf(budgetId) | Gera PDF do orçamento | Admin, Comercial |

#### communications/actions.ts

| Ação | Descrição | Perfil |
|------|-----------|--------|
| sendBudgetEmail(budgetId, emailData) | Envia orçamento por e-mail | Admin, Comercial |
| sendBudgetWhatsApp(budgetId, phone) | Gera link wa.me para envio | Admin, Comercial |

### Route Handlers

#### api/pdf/[id]/route.ts

| Método | Descrição | Autenticação |
|--------|-----------|--------------|
| GET | Download do PDF com URL assinada temporária | Cookie auth |

#### api/health/route.ts

| Método | Descrição | Autenticação |
|--------|-----------|--------------|
| GET | Health check do sistema | Não |

## 7. Validações Zod

### schemas/customer.ts

```typescript
// Validação de criação/edição de cliente
// - full_name: string, min 2, required
// - email: email | null
// - phone: string, min 8, required
// - phone_secondary: string | null
// - cpf_cnpj: string | null (validação de formato CPF/CNPJ)
// - address_street, address_number, etc.: string | null
// - address_state: string, length 2 | null
// - address_zip: string | null
```

### schemas/budget.ts

```typescript
// Validação de orçamento
// - customer_id: uuid, required
// - validity_days: number, min 1, default 30
// - notes_internal: string | null
// - notes_client: string | null
// - items: array de BudgetItemSchema (min 1 para envio)

// BudgetItemSchema
// - item_type: 'mobiliario' | 'servico'
// - description: string, min 3, required
// - material: string | null (obrigatório se mobiliario)
// - width_cm, depth_cm, height_cm: number | null (obrigatório se mobiliario)
// - finish: string | null
// - unit: string, default 'un'
// - quantity: number, min 0.001, required
// - unit_price: number, min 0.01, required
// - discount: number, min 0, default 0
```

## 8. Segurança e Controle de Acesso

### Perfis e Permissões

| Ação | Admin | Comercial | Produção | Financeiro |
|------|-------|-----------|----------|------------|
| Criar/editar clientes | ✅ | ✅ | ❌ | ❌ |
| Listar clientes | ✅ | ✅ | ✅ | ✅ |
| Criar/editar orçamentos | ✅ | ✅ | ❌ | ❌ |
| Alterar status do orçamento | ✅ | ✅ | ❌ | ❌ |
| Gerar PDF | ✅ | ✅ | ❌ | ❌ |
| Enviar e-mail/WhatsApp | ✅ | ✅ | ❌ | ❌ |
| Visualizar PDFs | ✅ | ✅ | ✅ | ✅ |
| Visualizar logs de auditoria | ✅ | ❌ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ |

### Variáveis de Ambiente (Servidor Only)

| Variável | Descrição | Exposta no browser? |
|----------|-----------|---------------------|
| NEXT_PUBLIC_SUPABASE_URL | URL do Supabase | ✅ (necessário para cliente) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Chave pública do Supabase | ✅ (necessário para cliente) |
| SUPABASE_SERVICE_ROLE_KEY | Chave de serviço (admin) | ❌ |
| RESEND_API_KEY | Chave da API Resend | ❌ |
| PDF_SIGNING_SECRET | Segredo para URLs assinadas | ❌ |

### Regras de Segurança

- Todas as Server Actions validam autenticação via cookies antes de processar
- RLS é a segunda camada de defesa; permissões no servidor são a primeira
- Supabase Service Role Key nunca é exposta ao browser
- PDFs são acessados via URLs assinadas temporárias (expiração configurável)
- Nenhum link público permanente para documentos
- Logs de auditoria para: criação, edição, aprovação, envio, geração de PDF

## 9. Fluxo de Geração, Armazenamento e Compartilhamento de PDF

1. **Geração**: Server Action `generateBudgetPdf` recebe `budgetId`
2. **Validação**: Verifica que orçamento existe, tem itens, e dados do cliente estão completos
3. **Montagem**: `@react-pdf/renderer` monta o documento com layout padronizado
4. **Upload**: PDF é salvo no Supabase Storage bucket `documents` em path `budgets/{budget_id}/v{version}.pdf`
5. **Registro**: Entrada na tabela `documents` com metadados (tipo, versão, entidade, responsável)
6. **Retorno**: Server Action retorna URL assinada temporária para visualização/download
7. **Compartilhamento**: Usuário pode enviar via e-mail (anexo) ou WhatsApp (link wa.me com URL assinada)

### Regras de Imutabilidade

- PDF gerado NUNCA é sobrescrito
- Alterações no orçamento geram nova versão do PDF com novo registro em `documents`
- Orçamentos aprovados ou recusados não podem gerar novas versões de PDF (apenas consulta)

## 10. Fluxo de E-mail e WhatsApp (MVP)

### E-mail (Resend)

1. Usuário clica em "Enviar por e-mail"
2. Sistema exibe formulário de revisão: destinatário (preenchido com e-mail do cliente), assunto, mensagem
3. Usuário revisa e confirma envio
4. Server Action:
   a. Gera registro em `communications` (status: pending)
   b. Chama API Resend com PDF como anexo
   c. Atualiza registro com status (success/failed) e error_message se aplicável
   d. Se falhou, NÃO marca orçamento como enviado

### WhatsApp (MVP)

1. Usuário clica em "Enviar por WhatsApp"
2. Sistema gera link `wa.me/{phone}?text={mensagem pré-preenchida}` com URL assinada do PDF
3. Abre link em nova aba do navegador
4. Server Action registra em `communications` o evento de geração do link

### Template de E-mail

```
Assunto: Orçamento {budget_number} — Roldan Marcenaria

Olá {customer_name},

Segue em anexo o orçamento {budget_number} no valor de {total_amount}.

Este orçamento é válido por 30 dias.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Roldan Marcenaria
```

## 11. Estratégia de Auditoria e Histórico

### O que registrar

| Ação | Tabela | Evento |
|------|--------|--------|
| Criar cliente | audit_logs | create |
| Editar cliente | audit_logs | update |
| Criar orçamento | audit_logs + budget_status_history | create |
| Adicionar/editar/remover item | audit_logs | update |
| Alterar status do orçamento | audit_logs + budget_status_history | status_change |
| Gerar PDF | audit_logs | generate_pdf |
| Enviar e-mail | communications | email_sent |
| Enviar WhatsApp | communications | whatsapp_sent |

### Dados registrados em cada evento

- user_id: quem realizou a ação
- action: tipo da ação
- entity_type + entity_id: o que foi afetado
- old_values (para updates): dados anteriores
- new_values: dados novos
- created_at: data/hora do evento

## 12. Testes

### Testes Unitários (Vitest)

| Módulo | Arquivo | O que testar |
|--------|---------|--------------|
| budgets | calculate.test.ts | Cálculo de total de item, cálculo de total do orçamento, desconto |
| budgets | status.test.ts | Transições de status válidas e inválidas |
| customers | schemas.test.ts | Validações Zod de cliente (obrigatoriedades, formatos) |
| lib | format.test.ts | Formatação de moeda brasileira, datas, CPF/CNPJ |

### Testes de Componentes (React Testing Library)

| Componente | Arquivo | O que testar |
|------------|---------|--------------|
| budget-form | budget-form.test.tsx | Validação de campos, submissão, erros |
| customer-form | customer-form.test.tsx | Validação de campos, submissão |

### Testes Ponta a Ponto (Playwright)

| Fluxo | Arquivo | O que testar |
|-------|---------|--------------|
| Auth | auth.spec.ts | Login/logout, proteção de rotas |
| Customers | customers.spec.ts | Criar, listar, editar, buscar cliente |
| Budgets | budgets.spec.ts | Criar orçamento, adicionar itens, enviar, alterar status, gerar PDF |

### Cobertura Obrigatória

1. ✅ Cálculo de valores (quantidade × valor unitário - desconto)
2. ✅ Transições de status do orçamento
3. ✅ Validação de dados de entrada
4. ✅ Proteção de orçamento aprovado/recusado contra edição
5. ✅ Geração de PDF com dados corretos
6. ✅ Registro de comunicação (e-mail/WhatsApp)
7. ✅ Permissões por perfil
8. ✅ Soft delete de clientes

## 13. Migração de Dados

### Estratégia de Migrations

- Migrations SQL versionadas numeradas sequencialmente (001, 002, ...)
- Cada migration deve ser reversível ou ter plano de recuperação
- Dados iniciais via `seed.sql`: perfil admin padrão
- Schema, índices, constraints e triggers em migrations separadas para clareza
- RLS policies em migration dedicada (008)

### Ordem de Execução

1. 001_create_profiles.sql
2. 002_create_customers.sql
3. 003_create_budgets.sql
4. 004_create_budget_items.sql
5. 005_create_documents.sql
6. 006_create_communications.sql
7. 007_create_audit_logs.sql
8. 008_rls_policies.sql
9. seed.sql (dados iniciais)

## 14. Decisões Tomadas

| # | Decisão | Decisão Final |
|---|---------|---------------|
| 1 | Formato do número do orçamento | ORC-2026-0001 (ano + sequencial) |
| 2 | Configuração do validade padrão | 30 dias |
| 3 | Necessidade de logo no PDF | Sem logo (não necessário) |
| 4 | Formato do link wa.me | URL assinada temporária do PDF |

## 15. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Limites do Vercel na geração de PDF | Baixa | Médio | @react-pdf/renderer é leve; monitorar memória |
| Limites do Resend (e-mails/dia) | Baixa | Baixa | Plano gratuito suficiente para MVP; monitorar uso |
| Performance de listagens grandes | Média | Baixa | Paginação server-side; índices no banco |
| Complexidade de RLS | Média | Alta | Testar políticas extensivamente; documentar |
| Mudanças de schema futuras | Alta | Média | Migrations versionadas; compatibilidade com dados existentes |

## 16. Critérios de Aceite Mensuráveis

| # | Critério | Métrica |
|---|----------|---------|
| 1 | Cadastro de cliente funciona | Criar cliente com todos os campos obrigatórios em < 30s |
| 2 | Busca de clientes funciona | Buscar cliente por nome retorna resultado em < 2s |
| 3 | Criação de orçamento funciona | Criar orçamento com 5 itens em < 1min |
| 4 | Cálculo está correto | Totais calculados batem com cálculo manual em 100% dos casos |
| 5 | PDF é gerado com sucesso | PDF gerado contém todos os dados obrigatórios |
| 6 | Envio por e-mail funciona | E-mail chega ao destinatário com PDF anexo |
| 7 | Envio por WhatsApp funciona | Link wa.me abre com mensagem pré-preenchida |
| 8 | Status é controlado | Transições inválidas são rejeitadas com mensagem clara |
| 9 | Orçamento aprovado não é editado | Tentativa de edição retorna erro |
| 10 | Interface é responsiva | Funciona em desktop (1920x1080) e celular (375x667) |
| 11 | Testes passam | 100% dos testes unitários passam |
| 12 | Build funciona | `bun run build` não retorna erros |
| 13 | Lint passa | `bun run lint` não retorna erros |
| 14 | Tipos estão corretos | `bun run typecheck` não retorna erros |
