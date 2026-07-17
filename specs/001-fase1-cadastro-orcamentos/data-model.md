# Modelo de Dados — Fase 1: Cadastro de Clientes e Orçamentos

**Data:** 2026-07-17

---

## Diagrama de Entidades

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│   profiles   │       │    customers     │       │     budgets      │
├─────────────┤       ├─────────────────┤       ├──────────────────┤
│ id (uuid)    │◄──┐   │ id (uuid)       │◄──────│ customer_id      │
│ full_name    │   │   │ full_name       │       │ budget_number    │
│ role (enum)  │   │   │ email           │       │ status (enum)    │
│ active       │   │   │ phone           │       │ version          │
│ created_at   │   │   │ phone_secondary │       │ validity_days    │
│ updated_at   │   │   │ cpf_cnpj        │       │ notes_internal   │
└─────────────┘   │   │ address_*       │       │ notes_client     │
                  │   │ notes           │       │ total_amount     │
                  │   │ active          │       │ created_by ──────│──┐
                  │   │ created_by ─────│──┐    │ created_at       │  │
                  │   │ created_at      │  │    │ updated_at       │  │
                  │   │ updated_at      │  │    │ sent_at          │  │
                  │   └─────────────────┘  │    │ approved_at      │  │
                  │          │             │    │ refused_at       │  │
                  │          │ 1:N         │    └──────────────────┘  │
                  │          ▼             │           │ 1:N          │
                  │   ┌─────────────────┐  │           ▼              │
                  │   │ budget_items    │  │    ┌──────────────────┐  │
                  │   ├─────────────────┤  │    │budget_status_hist│  │
                  │   │ id (uuid)       │  │    ├──────────────────┤  │
                  │   │ budget_id ──────│──┘    │ id (uuid)        │  │
                  │   │ item_type       │       │ budget_id        │  │
                  │   │ description     │       │ from_status      │  │
                  │   │ material        │       │ to_status        │  │
                  │   │ width_cm        │       │ reason           │  │
                  │   │ depth_cm        │       │ changed_by ──────│──┘
                  │   │ height_cm       │       │ created_at       │
                  │   │ finish          │       └──────────────────┘
                  │   │ unit            │
                  │   │ quantity        │
                  │   │ unit_price      │
                  │   │ discount        │
                  │   │ total_price     │
                  │   │ notes           │
                  │   │ sort_order      │
                  │   │ created_at      │
                  │   └─────────────────┘
                  │
                  │   ┌─────────────────┐       ┌──────────────────┐
                  │   │   documents     │       │  communications  │
                  │   ├─────────────────┤       ├──────────────────┤
                  │   │ id (uuid)       │◄──────│ document_id      │
                  │   │ document_type   │       │ channel          │
                  │   │ file_name       │       │ recipient        │
                  │   │ storage_path    │       │ subject          │
                  │   │ mime_type       │       │ message          │
                  │   │ version         │       │ entity_type      │
                  │   │ entity_type     │       │ entity_id        │
                  │   │ entity_id       │       │ status           │
                  │   │ customer_id     │       │ error_message    │
                  │   │ file_size       │       │ sent_by ─────────│──┐
                  │   │ generated_by ───│──┐    │ created_at       │  │
                  │   │ created_at      │  │    └──────────────────┘  │
                  │   └─────────────────┘  │                         │
                  │                        │    ┌──────────────────┐  │
                  │   ┌─────────────────┐  │    │   audit_logs     │  │
                  │   │   audit_logs    │  │    ├──────────────────┤  │
                  │   ├─────────────────┤  │    │ id (uuid)        │  │
                  └──►│ user_id         │  └───►│ user_id          │  │
                      │ action          │       │ action           │  │
                      │ entity_type     │       │ entity_type      │  │
                      │ entity_id       │       │ entity_id        │  │
                      │ old_values      │       │ old_values       │  │
                      │ new_values      │       │ new_values       │  │
                      │ ip_address      │       │ ip_address       │  │
                      │ created_at      │       │ created_at       │  │
                      └─────────────────┘       └──────────────────┘  │
                                                                     │
                              ┌──────────────────────────────────────┘
                              │
                              └── Todas as tabelas com created_by/sent_by/changed_by
                                  referenciam profiles.id
```

---

## Entidades Detalhadas

### profiles

**Descrição:** Perfis de usuário do sistema, vinculados ao auth.users do Supabase.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK, FK → auth.users.id | ID do Supabase Auth |
| full_name | text | NOT NULL | Nome completo do usuário |
| role | text | NOT NULL, CHECK IN ('admin', 'comercial', 'financeiro', 'producao') | Perfil de acesso |
| active | boolean | NOT NULL DEFAULT true | Usuário ativo no sistema |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de criação do perfil |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Última atualização |

**Regras:**
- Apenas administradores podem criar ou gerenciar perfis
- O primeiro administrador pode ser configurado manualmente no Supabase ou por migration
- Perfis inativos não conseguem fazer login

---

### customers

**Descrição:** Cadastro de clientes da marcenaria. Fonte principal dos dados cadastrais.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| full_name | text | NOT NULL, CHECK LENGTH >= 2 | Nome completo |
| email | text | | E-mail do cliente |
| phone | text | NOT NULL | Telefone principal |
| phone_secondary | text | | Telefone secundário |
| cpf_cnpj | text | | CPF ou CNPJ (apenas dígitos) |
| address_street | text | | Rua/Logradouro |
| address_number | text | | Número |
| address_complement | text | | Complemento |
| address_neighborhood | text | | Bairro |
| address_city | text | | Cidade |
| address_state | text | CHECK LENGTH = 2 | Estado (UF, 2 caracteres) |
| address_zip | text | | CEP (apenas dígitos) |
| notes | text | | Observações gerais |
| active | boolean | NOT NULL DEFAULT true | Cancelamento lógico (nunca DELETE) |
| created_by | uuid | NOT NULL, FK → profiles.id | Usuário que realizou o cadastro |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data do cadastro |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Última atualização |

**Regras:**
- Nunca remover fisicamente (soft delete via `active = false`)
- Busca por nome, telefone e CPF/CNPJ
- Apenas Admin e Comercial podem criar/editar
- Todos os autenticados podem listar/visualizar

---

### budgets

**Descrição:** Orçamentos de serviços/móveis para clientes.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| budget_number | text | NOT NULL, UNIQUE | Número sequencial (ORC-YYYY-NNNN) |
| customer_id | uuid | NOT NULL, FK → customers.id | Cliente vinculado |
| status | text | NOT NULL DEFAULT 'rascunho', CHECK IN ('rascunho', 'enviado', 'em_analise', 'aprovado', 'recusado', 'vencido', 'revisado') | Status atual |
| version | integer | NOT NULL DEFAULT 1 | Versão do orçamento |
| validity_days | integer | NOT NULL DEFAULT 30 | Dias de validade do orçamento |
| notes_internal | text | | Observações internas (não aparece no PDF) |
| notes_client | text | | Observações para o cliente (aparece no PDF) |
| total_amount | numeric(12,2) | NOT NULL DEFAULT 0 | Valor total (calculado por trigger) |
| created_by | uuid | NOT NULL, FK → profiles.id | Usuário que criou |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de criação |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Última atualização |
| sent_at | timestamptz | | Data do primeiro envio |
| approved_at | timestamptz | | Data da aprovação |
| refused_at | timestamptz | | Data da recusa |

**Regras:**
- Status inicial: `rascunho`
- Transições controladas (ver seção de Status)
- Apenas `rascunho` permite edição de itens e valores
- `aprovado`, `recusado` e `vencido` são finais (não editing)
- `total_amount` é calculado automaticamente por trigger

---

### budget_items

**Descrição:** Itens (móveis e serviços) de um orçamento.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| budget_id | uuid | NOT NULL, FK → budgets.id ON DELETE CASCADE | Orçamento pai |
| item_type | text | NOT NULL, CHECK IN ('mobiliario', 'servico') | Tipo do item |
| description | text | NOT NULL, CHECK LENGTH >= 3 | Descrição do item |
| material | text | | Material (obrigatório se mobiliario) |
| width_cm | numeric(8,2) | | Largura em cm (obrigatório se mobiliario) |
| depth_cm | numeric(8,2) | | Profundidade em cm (obrigatório se mobiliario) |
| height_cm | numeric(8,2) | | Altura em cm (obrigatório se mobiliario) |
| finish | text | | Acabamento |
| unit | text | NOT NULL DEFAULT 'un' | Unidade de medida |
| quantity | numeric(10,3) | NOT NULL, CHECK > 0 | Quantidade |
| unit_price | numeric(12,2) | NOT NULL, CHECK > 0 | Valor unitário |
| discount | numeric(12,2) | NOT NULL DEFAULT 0 | Desconto (>= 0) |
| total_price | numeric(12,2) | NOT NULL | Total do item (calculado: qty × price - discount) |
| notes | text | | Observações do item |
| sort_order | integer | NOT NULL DEFAULT 0 | Ordem de exibição |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de criação |

**Regras:**
- `total_price` é calculado automaticamente por trigger antes de INSERT/UPDATE
- Itens de mobiliário devem preencher material, largura, profundidade e altura
- Itens só podem ser editados quando o orçamento está em `rascunho`
- Itens só podem ser removidos quando o orçamento está em `rascunho`

---

### budget_status_history

**Descrição:** Histórico de todas as transições de status de um orçamento.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| budget_id | uuid | NOT NULL, FK → budgets.id ON DELETE CASCADE | Orçamento |
| from_status | text | | Status anterior (NULL no primeiro registro) |
| to_status | text | NOT NULL | Novo status |
| reason | text | | Motivo (obrigatório para aprovação e recusa) |
| changed_by | uuid | NOT NULL, FK → profiles.id | Usuário que realizou a mudança |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data e hora da transição |

**Regras:**
- Registro automático a cada transição de status
- Usado para rastreabilidade e auditoria

---

### documents

**Descrição:** Registro de todos os documentos gerados (PDFs de orçamentos, futuros contratos, recibos, etc.).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| document_type | text | NOT NULL, CHECK IN ('orcamento', 'ordem_servico', 'contrato', 'recibo') | Tipo do documento |
| file_name | text | NOT NULL | Nome do arquivo (ex: ORC-0001_v1.pdf) |
| storage_path | text | NOT NULL | Caminho no Supabase Storage |
| mime_type | text | NOT NULL DEFAULT 'application/pdf' | Tipo MIME |
| version | integer | NOT NULL DEFAULT 1 | Versão do documento |
| entity_type | text | NOT NULL | Tipo da entidade origem (ex: 'budget') |
| entity_id | uuid | NOT NULL | ID da entidade origem |
| customer_id | uuid | NOT NULL, FK → customers.id | Cliente vinculado |
| file_size | integer | | Tamanho do arquivo em bytes |
| generated_by | uuid | NOT NULL, FK → profiles.id | Usuário que gerou o documento |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data de geração |

**Regras:**
- Documentos emitidos são IMUTÁVEIS — nunca sobrescrever
- Alterações geram nova versão com novo registro
- Acesso via URLs assinadas temporárias (nunca links públicos permanentes)
- Cada PDF mantém referência à entidade de origem e ao cliente

---

### communications

**Descrição:** Histórico de todas as comunicações enviadas aos clientes.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| channel | text | NOT NULL, CHECK IN ('email', 'whatsapp') | Canal de envio |
| recipient | text | NOT NULL | E-mail ou telefone do destinatário |
| subject | text | | Assunto do e-mail (NULL para WhatsApp) |
| message | text | NOT NULL | Mensagem enviada |
| document_id | uuid | FK → documents.id | Documento vinculado (PDF) |
| entity_type | text | | Tipo da entidade origem |
| entity_id | uuid | | ID da entidade origem |
| status | text | NOT NULL, CHECK IN ('pending', 'success', 'failed') | Resultado do envio |
| error_message | text | | Mensagem de erro (quando status = failed) |
| sent_by | uuid | NOT NULL, FK → profiles.id | Usuário responsável pelo envio |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data e hora do envio |

**Regras:**
- Todo envio gera um registro (sucesso ou falha)
- Falhas NÃO marcam o orçamento como enviado
- Reenvios criam novos registros (histórico acumulativo)
- Consultável por cliente, período e canal

---

### audit_logs

**Descrição:** Trilha de auditoria para todas as ações sensíveis do sistema.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | Identificador único |
| user_id | uuid | FK → profiles.id | Usuário que realizou a ação |
| action | text | NOT NULL | Tipo da ação (create, update, status_change, generate_pdf, send_email, etc.) |
| entity_type | text | NOT NULL | Tipo da entidade afetada |
| entity_id | uuid | NOT NULL | ID da entidade afetada |
| old_values | jsonb | | Valores anteriores (para updates e status_change) |
| new_values | jsonb | | Valores novos |
| ip_address | text | | Endereço IP do cliente |
| created_at | timestamptz | NOT NULL DEFAULT now() | Data e hora da ação |

**Regras:**
- Apenas Administradores podem visualizar logs
- Inserção é feita exclusivamente por Server Actions (nunca pelo browser)
- Logs nunca são removidos ou alterados

---

## Triggers

### update_updated_at
- Aplica-se a: `profiles`, `customers`, `budgets`
- Atualiza automaticamente o campo `updated_at` antes de cada UPDATE

### calculate_item_total
- Aplica-se a: `budget_items` (BEFORE INSERT OR UPDATE)
- Calcula: `total_price = (quantity × unit_price) - discount`

### calculate_budget_total
- Aplica-se a: `budget_items` (AFTER INSERT OR UPDATE OR DELETE)
- Recalcula: `total_amount = SUM(total_price) de todos os items do orçamento`

### prevent_budget_edit_after_decision
- Aplica-se a: `budgets` (BEFORE UPDATE)
- Bloqueia alterações quando status IN ('aprovado', 'recusado', 'vencido')

---

## Políticas RLS (Resumo)

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | Próprio + admin | admin | Próprio + admin | — |
| customers | Todos autenticados | admin, comercial | admin, comercial | — (soft delete) |
| budgets | Todos autenticados | admin, comercial | admin, comercial | — |
| budget_items | Via budget pai | Via budget pai | Via budget pai | Apenas rascunho |
| budget_status_history | Todos autenticados | Server only | — | — |
| documents | Todos autenticados | admin, comercial | — | — |
| communications | Todos autenticados | admin, comercial | — | — |
| audit_logs | admin | Server only | — | — |

---

## Storage

### Bucket: `documents`

- **Acesso:** Privado (nenhum acesso público)
- **Upload:** Apenas perfis admin e comercial
- **Download:** Todos os autenticados (via URL assinada temporária)
- **Estrutura de paths:**
  - `budgets/{budget_id}/v{version}.pdf`
  - (futuro) `contracts/{contract_id}/v{version}.pdf`
  - (futuro) `receipts/{receipt_id}/v{version}.pdf`

### URLs Assinadas

- Expiração padrão: 1 hora
- Geradas sob demanda para download/envio
- Nunca são links permanentes
