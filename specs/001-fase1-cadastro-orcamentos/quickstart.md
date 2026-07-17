# Quickstart — Validação da Fase 1

**Data:** 2026-07-17

---

## Pré-requisitos

- Conta no Supabase (projeto criado)
- Conta na Vercel (projetos vinculados ao repositório)
- Conta no Resend (API key obtida)
- Node.js 18+ ou Bun instalado
- Git configurado

---

## 1. Setup do Projeto

```bash
# Clonar o repositório
git clone <repo-url>
cd marcenaria

# Instalar dependências com Bun
bun install

# Copiar variáveis de ambiente
cp .env.local.example .env.local
# Preencher valores no .env.local

# Rodar migrations no Supabase
# (via Supabase Dashboard > SQL Editor ou CLI)
# Executar: 001_create_profiles.sql → 008_rls_policies.sql + seed.sql
```

---

## 2. Validação: Cadastro de Cliente

### Cenário: Criar um novo cliente

1. Fazer login como usuário Comercial
2. Navegar para `/customers/new`
3. Preencher: nome ("João da Silva"), telefone ("11999998888"), e-mail ("joao@email.com")
4. Clicar em "Salvar"
5. **Esperado:** Mensagem de sucesso, redirecionamento para lista de clientes
6. **Esperado:** Cliente aparece na lista com todos os dados

### Cenário: Validação de campos obrigatórios

1. Navegar para `/customers/new`
2. Deixar nome em branco e tentar salvar
3. **Esperado:** Mensagem "Nome do cliente é obrigatório e deve ter pelo menos 2 caracteres"

### Cenário: Buscar cliente

1. Na lista de clientes, digitar "João" no campo de busca
2. **Esperado:** Lista filtra e mostra apenas clientes com "João" no nome
3. Limpar busca
4. Digitar "1199999" no campo de busca
5. **Esperado:** Lista mostra clientes com esse telefone

---

## 3. Validação: Criação de Orçamento

### Cenário: Criar orçamento com itens de mobiliário

1. Navegar para `/budgets/new`
2. Selecionar cliente "João da Silva"
3. Adicionar item: tipo "Mobiliário", descrição "Armário 3 portas", material "MDF", largura 120cm, profundidade 50cm, altura 200cm, acabamento "Lacado branco", quantidade 1, valor unitário R$ 2.500,00
4. **Esperado:** Total do item = R$ 2.500,00
5. Adicionar item: tipo "Serviço", descrição "Instalação", quantidade 1, valor unitário R$ 300,00
6. **Esperado:** Total do orçamento = R$ 2.800,00
7. Clicar em "Salvar"
8. **Esperado:** Orçamento criado com status "Rascunho" e número ORC-0001

### Cenário: Validação de cálculos com desconto

1. Editar o item "Armário 3 portas"
2. Adicionar desconto de R$ 200,00
3. **Esperado:** Total do item = R$ 2.300,00
4. **Esperado:** Total do orçamento = R$ 2.600,00

### Cenário: Validação de transição de status

1. No orçamento ORC-0001, tentar alterar status para "Aprovado" direto do "Rascunho"
2. **Esperado:** Erro "Transição de status não permitida"
3. Alterar status para "Enviado"
4. **Esperado:** Transição aceita, status agora é "Enviado"

---

## 4. Validação: Geração de PDF

### Cenário: Gerar PDF do orçamento

1. No orçamento ORC-0001, clicar em "Gerar PDF"
2. **Esperado:** PDF é gerado e exibido para preview
3. **Esperado:** PDF contém: número do orçamento, data, dados do cliente, lista de itens com valores, valor total
4. **Esperado:** Observações internas NÃO aparecem no PDF
5. **Esperado:** Observações para o cliente APARECEM no PDF

### Cenário: Verificar imutabilidade

1. Gerar PDF do orçamento ORC-0001
2. Alterar um item do orçamento (ainda em rascunho)
3. Gerar novo PDF
4. **Esperado:** Dois registros na tabela `documents` com versões diferentes
5. **Esperado:** Primeiro PDF permanece inalterado

---

## 5. Validação: Envio de Comunicação

### Cenário: Enviar orçamento por e-mail

1. No orçamento ORC-0001 (status "Enviado"), clicar em "Enviar por E-mail"
2. Revisar formulário: destinatário, assunto, mensagem
3. Confirmar envio
4. **Esperado:** Registro na tabela `communications` com status "success"
5. **Esperado:** E-mail chega ao destinatário com PDF anexo

### Cenário: Enviar orçamento por WhatsApp

1. No orçamento ORC-0001, clicar em "Enviar por WhatsApp"
2. **Esperado:** Aba do navegador abre com link wa.me pré-preenchido
3. **Esperado:** Registro na tabela `communications` com status "success"

### Cenário: Falha de envio

1. Simular falha no envio (e.g., e-mail inválido)
2. **Esperado:** Mensagem de erro amigável para o usuário
3. **Esperado:** Registro na tabela `communications` com status "failed" e error_message
4. **Esperado:** Orçamento NÃO é marcado como enviado

---

## 6. Validação: Controle de Acesso

### Cenário: Perfil Comercial

1. Login como Comercial
2. **Esperado:** Pode criar/editar clientes e orçamentos
3. **Esperado:** Pode gerar PDF e enviar comunicações
4. **Esperado:** NÃO pode ver logs de auditoria

### Cenário: Perfil Produção

1. Login como Produção
2. **Esperado:** Pode listar clientes e orçamentos
3. **Esperado:** NÃO pode criar/editar clientes ou orçamentos
4. **Esperado:** NÃO pode gerar PDF ou enviar comunicações

### Cenário: Orçamento aprovado não editável

1. Alterar status de orçamento para "Aprovado"
2. Tentar editar um item
3. **Esperado:** Erro "Não é possível editar orçamento com status aprovado"

---

## 7. Validação: Interface Responsiva

### Cenário: Desktop

1. Acessar em resolução 1920x1080
2. **Esperado:** Layout completo, sidebar visível, formulários bem distribuídos

### Cenário: Celular

1. Acessar em resolução 375x667
2. **Esperado:** Layout responsivo, sidebar colapsada, formulários utilizáveis
3. **Esperado:** Todos os campos acessíveis sem scroll horizontal

---

## 8. Validação: Testes

```bash
# Testes unitários
bun run test:unit

# Testes de componentes
bun run test:components

# Testes ponta a ponta
bun run test:e2e

# Build
bun run build

# Lint
bun run lint

# Type check
bun run typecheck
```

**Esperado:** Todos os comandos passam sem erros.

---

## Checklist de Validação

| # | Cenário | Status |
|---|---------|--------|
| 1 | Cadastro de cliente funciona | ⬜ |
| 2 | Validação de campos obrigatórios funciona | ⬜ |
| 3 | Busca de clientes funciona | ⬜ |
| 4 | Criação de orçamento com itens funciona | ⬜ |
| 5 | Cálculos (total item, total orçamento, desconto) estão corretos | ⬜ |
| 6 | Transições de status válidas funcionam | ⬜ |
| 7 | Transições de status inválidas são bloqueadas | ⬜ |
| 8 | PDF é gerado com dados corretos | ⬜ |
| 9 | PDF não inclui observações internas | ⬜ |
| 10 | Envio por e-mail funciona | ⬜ |
| 11 | Envio por WhatsApp funciona | ⬜ |
| 12 | Falhas de envio são registradas | ⬜ |
| 13 | Perfil Comercial tem permissões corretas | ⬜ |
| 14 | Perfil Produção tem permissões corretas | ⬜ |
| 15 | Orçamento aprovado não é editável | ⬜ |
| 16 | Interface funciona em desktop | ⬜ |
| 17 | Interface funciona em celular | ⬜ |
| 18 | Testes unitários passam | ⬜ |
| 19 | Testes de componentes passam | ⬜ |
| 20 | Testes E2E passam | ⬜ |
| 21 | Build funciona | ⬜ |
| 22 | Lint passa | ⬜ |
| 23 | Type check passa | ⬜ |
