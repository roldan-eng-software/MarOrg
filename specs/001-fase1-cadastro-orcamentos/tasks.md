# Tarefas — Fase 1: Cadastro de Clientes e Orçamentos

**Versão:** 1.0.0
**Data:** 2026-07-17
**Autor:** Sistema

---

## Pré-requisitos

- [ ] Especificação funcional aprovada
- [ ] Plano técnico com Constitution Check aprovado

---

## Phase 1: Setup

- [ ] T001 Initialize Next.js 15 project with App Router, TypeScript strict, Tailwind CSS in `marcenaria/`
- [ ] T002 Configure ESLint 9 flat config and Prettier 3 in `marcenaria/eslint.config.mjs`, `marcenaria/.prettierrc`
- [ ] T003 Configure Vitest and React Testing Library in `marcenaria/vitest.config.ts`
- [ ] T004 Configure Playwright in `marcenaria/playwright.config.ts`
- [ ] T005 Install Supabase packages: `@supabase/supabase-js`, `@supabase/ssr` in `marcenaria/package.json`
- [ ] T006 Install form/validation packages: `react-hook-form`, `@hookform/resolvers`, `zod` in `marcenaria/package.json`
- [ ] T007 Install PDF package: `@react-pdf/renderer` in `marcenaria/package.json`
- [ ] T008 Install email package: `resend` in `marcenaria/package.json`
- [ ] T009 Create `.env.local.example` with all required variables in `marcenaria/.env.local.example`
- [ ] T010 Create directory structure per plan: `src/app/`, `src/lib/`, `src/modules/`, `src/components/`, `src/types/`, `supabase/migrations/`, `tests/` in `marcenaria/`
- [ ] T011 Configure `tsconfig.json` with strict mode and path aliases in `marcenaria/tsconfig.json`
- [ ] T012 Create root layout with HTML lang="pt-BR" in `marcenaria/src/app/layout.tsx`
- [ ] T013 Create root page redirect to dashboard/login in `marcenaria/src/app/page.tsx`

---

## Phase 2: Foundational

### Database & Auth Infrastructure

- [ ] T014 Create Supabase browser client in `marcenaria/src/lib/supabase/client.ts`
- [ ] T015 Create Supabase server client with cookies in `marcenaria/src/lib/supabase/server.ts`
- [ ] T016 Create Supabase admin client (server-only) in `marcenaria/src/lib/supabase/admin.ts`
- [ ] T017 Create migration `001_create_profiles.sql` with profiles table, constraints, trigger in `marcenaria/supabase/migrations/001_create_profiles.sql`
- [ ] T018 Create migration `002_create_customers.sql` with customers table, constraints, indices in `marcenaria/supabase/migrations/002_create_customers.sql`
- [ ] T019 Create migration `003_create_budgets.sql` with budgets table, constraints, indices in `marcenaria/supabase/migrations/003_create_budgets.sql`
- [ ] T020 Create migration `004_create_budget_items.sql` with budget_items table, constraints, indices in `marcenaria/supabase/migrations/004_create_budget_items.sql`
- [ ] T021 Create migration `005_create_documents.sql` with documents table, constraints, indices in `marcenaria/supabase/migrations/005_create_documents.sql`
- [ ] T022 Create migration `006_create_communications.sql` with communications table, constraints, indices in `marcenaria/supabase/migrations/006_create_communications.sql`
- [ ] T023 Create migration `007_create_audit_logs.sql` with audit_logs table, constraints, indices in `marcenaria/supabase/migrations/007_create_audit_logs.sql`
- [ ] T024 Create migration `008_rls_policies.sql` with all RLS policies in `marcenaria/supabase/migrations/008_rls_policies.sql`
- [ ] T025 Create `seed.sql` with initial admin profile in `marcenaria/supabase/seed.sql`

### Shared UI Components

- [ ] T026 [P] Create Button component in `marcenaria/src/components/ui/button.tsx`
- [ ] T027 [P] Create Input component in `marcenaria/src/components/ui/input.tsx`
- [ ] T028 [P] Create Select component in `marcenaria/src/components/ui/select.tsx`
- [ ] T029 [P] Create Table component in `marcenaria/src/components/ui/table.tsx`
- [ ] T030 [P] Create Dialog component in `marcenaria/src/components/ui/dialog.tsx`
- [ ] T031 [P] Create Badge component in `marcenaria/src/components/ui/badge.tsx`
- [ ] T032 [P] Create Card component in `marcenaria/src/components/ui/card.tsx`
- [ ] T033 [P] Create Form wrapper component in `marcenaria/src/components/ui/form.tsx`
- [ ] T034 [P] Create Loading component in `marcenaria/src/components/ui/loading.tsx`
- [ ] T035 [P] Create Sidebar layout component in `marcenaria/src/components/layout/sidebar.tsx`
- [ ] T036 [P] Create Header layout component in `marcenaria/src/components/layout/header.tsx`
- [ ] T037 [P] Create PageHeader component in `marcenaria/src/components/layout/page-header.tsx`
- [ ] T038 [P] Create ConfirmDialog component in `marcenaria/src/components/shared/confirm-dialog.tsx`
- [ ] T039 [P] Create EmptyState component in `marcenaria/src/components/shared/empty-state.tsx`
- [ ] T040 [P] Create ErrorBoundary component in `marcenaria/src/components/shared/error-boundary.tsx`

### Shared Utilities & Types

- [ ] T041 [P] Create format utilities (currency, date, CPF/CNPJ) in `marcenaria/src/lib/utils/format.ts`
- [ ] T042 [P] Create PDF helpers in `marcenaria/src/lib/utils/pdf.ts`
- [ ] T043 [P] Create shared TypeScript types in `marcenaria/src/types/index.ts`
- [ ] T044 Generate Supabase database types in `marcenaria/src/types/database.ts`

### Auth Module

- [ ] T045 Create auth login/logout Server Actions in `marcenaria/src/modules/auth/actions.ts`
- [ ] T046 Create auth session queries in `marcenaria/src/modules/auth/queries.ts`
- [ ] T047 Create auth Zod schemas (login) in `marcenaria/src/modules/auth/schemas.ts`
- [ ] T048 Create login page in `marcenaria/src/app/(auth)/login/page.tsx`
- [ ] T049 Create auth layout (public routes) in `marcenaria/src/app/(auth)/layout.tsx`
- [ ] T050 Create protected layout with sidebar and auth check in `marcenaria/src/app/(protected)/layout.tsx`
- [ ] T051 Create dashboard page (placeholder) in `marcenaria/src/app/(protected)/dashboard/page.tsx`

### Audit Module

- [ ] T052 Create audit logger service in `marcenaria/src/modules/audit/services/logger.ts`
- [ ] T053 Create audit queries in `marcenaria/src/modules/audit/queries.ts`

### Validation Schemas

- [ ] T054 Create customer Zod schemas in `marcenaria/src/lib/validations/customer.ts`
- [ ] T055 Create budget Zod schemas in `marcenaria/src/lib/validations/budget.ts`

---

## Phase 3: US1 — Cadastro de Clientes

**Goal:** Users can create, list, search, view, edit, and soft-delete customers.

**Independent Test Criteria:**
- Customer created with all required fields persists correctly
- Customer list shows all customers with search by name, phone, CPF/CNPJ
- Customer detail view shows all data
- Customer edit updates data correctly
- Soft delete sets active=false, customer no longer appears in list
- Only Admin/Comercial profiles can create/edit

- [ ] T056 [US1] Create customers Server Actions (create, update, deactivate) in `marcenaria/src/modules/customers/actions.ts`
- [ ] T057 [US1] Create customers queries (list, search, getById) in `marcenaria/src/modules/customers/queries.ts`
- [ ] T058 [US1] Create customers Zod schemas in `marcenaria/src/modules/customers/schemas.ts`
- [ ] T059 [US1] Create CustomerForm component in `marcenaria/src/modules/customers/components/customer-form.tsx`
- [ ] T060 [US1] Create CustomerList component in `marcenaria/src/modules/customers/components/customer-list.tsx`
- [ ] T061 [US1] Create CustomerSearch component in `marcenaria/src/modules/customers/components/customer-search.tsx`
- [ ] T062 [US1] Create customers list page in `marcenaria/src/app/(protected)/customers/page.tsx`
- [ ] T063 [US1] Create new customer page in `marcenaria/src/app/(protected)/customers/new/page.tsx`
- [ ] T064 [US1] Create customer detail page in `marcenaria/src/app/(protected)/customers/[id]/page.tsx`
- [ ] T065 [US1] Create customer edit page in `marcenaria/src/app/(protected)/customers/[id]/edit/page.tsx`
- [ ] T066 [US1] Write unit tests for customer schemas in `marcenaria/tests/unit/customers/schemas.test.ts`
- [ ] T067 [US1] Write component tests for CustomerForm in `marcenaria/tests/components/customers/customer-form.test.tsx`
- [ ] T068 [US1] Write E2E tests for customer flows in `marcenaria/tests/e2e/customers.spec.ts`

---

## Phase 4: US2 — Criação de Orçamentos com Itens

**Goal:** Users can create budgets, add furniture/service items, and see automatic calculations.

**Independent Test Criteria:**
- Budget created with customer linked correctly
- Furniture item with dimensions and material calculates total correctly
- Service item calculates total correctly
- Discount applied correctly (quantity × unit_price - discount)
- Budget total = sum of all item totals
- Items can be added, edited, removed while status is Rascunho
- Budget cannot be sent without at least one item

- [ ] T069 [US2] Create budgets Server Actions (create, update, addItem, updateItem, removeItem) in `marcenaria/src/modules/budgets/actions.ts`
- [ ] T070 [US2] Create budgets queries (list, getById) in `marcenaria/src/modules/budgets/queries.ts`
- [ ] T071 [US2] Create budgets Zod schemas in `marcenaria/src/modules/budgets/schemas.ts`
- [ ] T072 [US2] Create calculate service (item total, budget total) in `marcenaria/src/modules/budgets/services/calculate.ts`
- [ ] T073 [US2] Create BudgetForm component in `marcenaria/src/modules/budgets/components/budget-form.tsx`
- [ ] T074 [US2] Create BudgetItemForm component in `marcenaria/src/modules/budgets/components/budget-item-form.tsx`
- [ ] T075 [US2] Create BudgetSummary component in `marcenaria/src/modules/budgets/components/budget-summary.tsx`
- [ ] T076 [US2] Create BudgetList component in `marcenaria/src/modules/budgets/components/budget-list.tsx`
- [ ] T077 [US2] Create budgets list page in `marcenaria/src/app/(protected)/budgets/page.tsx`
- [ ] T078 [US2] Create new budget page in `marcenaria/src/app/(protected)/budgets/new/page.tsx`
- [ ] T079 [US2] Create budget detail page in `marcenaria/src/app/(protected)/budgets/[id]/page.tsx`
- [ ] T080 [US2] Create budget edit page (rascunho only) in `marcenaria/src/app/(protected)/budgets/[id]/edit/page.tsx`
- [ ] T081 [US2] Write unit tests for calculate service in `marcenaria/tests/unit/budgets/calculate.test.ts`
- [ ] T082 [US2] Write component tests for BudgetForm in `marcenaria/tests/components/budgets/budget-form.test.tsx`
- [ ] T083 [US2] Write E2E tests for budget creation flows in `marcenaria/tests/e2e/budgets.spec.ts`

---

## Phase 5: US3 — Controle de Status do Orçamento

**Goal:** Budget status transitions follow defined rules with audit trail.

**Independent Test Criteria:**
- Rascunho → Enviado works
- Enviado → Em análise works
- Em análise → Aprovado/Recusado works (with reason required)
- Aprovado → Revisado → Enviado works
- Invalid transitions rejected with clear error message
- Each transition logged in budget_status_history
- Each transition logged in audit_logs
- Approved/Refused budgets cannot have items edited

- [ ] T084 [US3] Create status transition service (validate + execute) in `marcenaria/src/modules/budgets/services/status.ts`
- [ ] T085 [US3] Add changeBudgetStatus Server Action in `marcenaria/src/modules/budgets/actions.ts`
- [ ] T086 [US3] Create BudgetStatusBadge component in `marcenaria/src/modules/budgets/components/budget-status-badge.tsx`
- [ ] T087 [US3] Add status transition UI to budget detail page in `marcenaria/src/app/(protected)/budgets/[id]/page.tsx`
- [ ] T088 [US3] Write unit tests for status transitions in `marcenaria/tests/unit/budgets/status.test.ts`

---

## Phase 6: US4 — Geração de PDF

**Goal:** Users can generate professional PDF of budget and download it via signed URL.

**Independent Test Criteria:**
- PDF generated contains: budget number, date, customer data, items, total, conditions, validity
- Internal notes NOT included in PDF
- Client notes included in PDF
- PDF saved to Supabase Storage (private bucket)
- Document record created in documents table
- Signed URL returned for preview/download
- PDF is immutable (new version on re-generation)
- Only Admin/Comercial can generate

- [ ] T089 [US4] Create documents Server Actions (generateBudgetPdf) in `marcenaria/src/modules/documents/actions.ts`
- [ ] T090 [US4] Create documents queries in `marcenaria/src/modules/documents/queries.ts`
- [ ] T091 [US4] Create PDF generator service with @react-pdf/renderer in `marcenaria/src/modules/documents/services/pdf-generator.ts`
- [ ] T092 [US4] Create Storage upload/download service in `marcenaria/src/modules/documents/services/storage.ts`
- [ ] T093 [US4] Create PDF preview component in `marcenaria/src/modules/documents/components/pdf-preview.tsx`
- [ ] T094 [US4] Create API route for protected PDF download in `marcenaria/src/app/api/pdf/[id]/route.ts`
- [ ] T095 [US4] Add "Gerar PDF" button to budget detail page in `marcenaria/src/app/(protected)/budgets/[id]/page.tsx`

---

## Phase 7: US5 — Histórico de Comunicações

**Goal:** Users can send budgets via email/WhatsApp with full communication tracking.

**Independent Test Criteria:**
- Email sent with PDF attachment and custom message
- WhatsApp generates wa.me link with signed URL
- Communication record created for each attempt (success or failure)
- Failed sends do NOT mark budget as sent
- Re-sends create new records (history preserved)
- Communication history viewable by customer, period, channel
- Before send, user can review recipient, subject, message

- [ ] T096 [US5] Create communications Server Actions (sendBudgetEmail, sendBudgetWhatsApp) in `marcenaria/src/modules/communications/actions.ts`
- [ ] T097 [US5] Create communications queries in `marcenaria/src/modules/communications/queries.ts`
- [ ] T098 [US5] Create communications Zod schemas in `marcenaria/src/modules/communications/schemas.ts`
- [ ] T099 [US5] Create email service (Resend integration) in `marcenaria/src/modules/communications/services/email.ts`
- [ ] T100 [US5] Create WhatsApp service (link wa.me generation) in `marcenaria/src/modules/communications/services/whatsapp.ts`
- [ ] T101 [US5] Create SendEmailForm component in `marcenaria/src/modules/communications/components/send-email-form.tsx`
- [ ] T102 [US5] Create SendWhatsAppForm component in `marcenaria/src/modules/communications/components/send-whatsapp-form.tsx`
- [ ] T103 [US5] Create CommunicationHistory component in `marcenaria/src/modules/communications/components/communication-history.tsx`
- [ ] T104 [US5] Create send page (email/WhatsApp options) in `marcenaria/src/app/(protected)/budgets/[id]/send/page.tsx`
- [ ] T105 [US5] Write unit tests for format utilities in `marcenaria/tests/unit/lib/format.test.ts`

---

## Phase 8: Polish & Cross-Cutting

- [ ] T106 Write E2E test for auth flows in `marcenaria/tests/e2e/auth.spec.ts`
- [ ] T107 Create health check API route in `marcenaria/src/app/api/health/route.ts`
- [ ] T108 Verify all Server Actions validate authentication and role before processing
- [ ] T109 Verify RLS policies match plan (all tables have correct policies)
- [ ] T110 Verify all sensitive modules are server-only (no accidental client imports)
- [ ] T111 Verify Brazilian format for currency, dates, document numbers throughout UI
- [ ] T112 Verify responsive layout works on desktop (1920x1080) and mobile (375x667)
- [ ] T113 Run full build: `bun run build` passes without errors
- [ ] T114 Run lint: `bun run lint` passes without errors
- [ ] T115 Run type check: `bun run typecheck` passes without errors
- [ ] T116 Run all tests: `bun run test` passes without errors

---

## Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├──► Phase 3 (US1: Customers)
    │         │
    │         ▼
    ├──► Phase 4 (US2: Budgets) ◄── depends on US1 (customer_id FK)
    │         │
    │         ▼
    ├──► Phase 5 (US3: Status) ◄── depends on US2 (budget must exist)
    │         │
    │         ▼
    ├──► Phase 6 (US4: PDF) ◄── depends on US2 (budget data needed)
    │         │
    │         ▼
    └──► Phase 7 (US5: Communications) ◄── depends on US4 (PDF needed for send)
              │
              ▼
         Phase 8 (Polish)
```

## Parallel Execution Opportunities

| Phase | Parallel Tasks | Description |
|-------|---------------|-------------|
| Phase 2 | T026–T040 | All UI components can be built in parallel |
| Phase 2 | T041–T044 | All utilities and types can be built in parallel |
| Phase 3 | T056–T058 | Actions, queries, schemas can be built in parallel |
| Phase 4 | T069–T072 | Actions, queries, schemas, calculate can be built in parallel |
| Phase 4 | T073–T076 | All budget components can be built in parallel |
| Phase 6 | T089–T092 | Documents actions, queries, PDF generator, storage can be built in parallel |
| Phase 7 | T096–T100 | Communications actions, queries, email, WhatsApp can be built in parallel |

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**US1 + US2** form the MVP — customers and budgets with calculations. These can be delivered independently and provide immediate value.

### Incremental Delivery Order

1. **Sprint 1:** Phase 1 + Phase 2 → Project setup, database, auth, shared components
2. **Sprint 2:** Phase 3 → Customer CRUD (testable independently)
3. **Sprint 3:** Phase 4 → Budget creation with items (testable independently)
4. **Sprint 4:** Phase 5 + Phase 6 → Status control + PDF generation
5. **Sprint 5:** Phase 7 → Communication (email/WhatsApp)
6. **Sprint 6:** Phase 8 → Polish, cross-cutting, final validation

### Validation at Each Phase

Each phase ends with independently testable criteria. After completing a phase:
1. Run relevant tests
2. Verify the independent test criteria for that story
3. Deploy to preview environment on Vercel
4. Manual smoke test of the new functionality

---

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 116 |
| Phase 1 (Setup) | 13 |
| Phase 2 (Foundational) | 41 |
| Phase 3 (US1: Customers) | 13 |
| Phase 4 (US2: Budgets) | 15 |
| Phase 5 (US3: Status) | 5 |
| Phase 6 (US4: PDF) | 7 |
| Phase 7 (US5: Communications) | 10 |
| Phase 8 (Polish) | 12 |
| Parallelizable tasks | 35+ |
