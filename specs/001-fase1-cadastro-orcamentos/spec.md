# Especificação Funcional — Fase 1: Cadastro de Clientes e Orçamentos

**Versão:** 1.0.0
**Data:** 2026-07-17
**Autor:** Sistema

---

## 1. Contexto e Problema de Negócio

A marcenaria sob medida precisa de um sistema organizado para gerenciar o ciclo completo
de atendimento, desde o primeiro contato com o cliente até a aprovação do orçamento.
Atualmente, informações de clientes, orçamentos e comunicações podem estar dispersas
em planilhas, papéis ou memória do vendedor, gerando risco de perda de dados, erros
de cálculo e dificuldade de acompanhamento.

Esta primeira fase estabelece a base do sistema: cadastro de clientes, criação de
orçamentos com itens detalhados, cálculo automático de valores, controle de status,
geração de PDF e registro de comunicações com o cliente.

## 2. Usuários Envolvidos

| Perfil | Papel na funcionalidade |
|--------|------------------------|
| Administrador | Acesso total a todas as funcionalidades, configurações e relatórios |
| Comercial/Atendimento | Cadastra clientes, cria e envia orçamentos, acompanha aprovações |
| Produção | Consulta orçamentos aprovados para planejamento (somente leitura nesta fase) |
| Financeiro | Consulta orçamentos aprovados para controle de pagamentos (somente leitura nesta fase) |

## 3. Resultado Esperado

- Cadastro completo e organizado de clientes com dados essenciais para orçamento e contato
- Criação de orçamentos com itens de móveis e serviços, com cálculo automático de valores
- Controle do status do orçamento ao longo do ciclo de vida (rascunho → aprovação/rejeição)
- Geração de documento PDF profissional do orçamento para envio ao cliente
- Registro completo do histórico de comunicações (e-mail e WhatsApp) com rastreabilidade
- Interface simples e adequada à rotina diária da marcenaria

## 4. Regras de Negócio

### 4.1 Cadastro de Cliente

- O cadastro de cliente é a fonte principal dos dados cadastrais do sistema
- Dados obrigatórios: nome completo, telefone principal, e-mail (quando disponível)
- Dados opcionais mas recomendados: CPF/CNPJ, telefone secundário, endereço completo
  (rua, número, complemento, bairro, cidade, estado, CEP)
- Cada cliente possui identificador único gerado automaticamente
- O sistema deve manter histórico de alterações nos dados cadastrais
- Clientes devem ser listados com busca por nome, telefone ou CPF/CNPJ
- Não é permitido excluir fisicamente um cliente; sistemas devem utilizar cancelamento lógico

### 4.2 Criação de Orçamento

- Todo orçamento deve estar vinculado a um cliente cadastrado
- O orçamento possui identificador único, data de emissão e versão
- Status inicial: Rascunho
- Um orçamento pode conter múltiplos itens, sendo cada item um móvel ou serviço
- Para cada item devem ser informados: descrição, quantidade, unidade de medida,
  valor unitário e valores opcionais (desconto, observações)
- O sistema deve calcular automaticamente: valor total de cada item e valor total do orçamento
- O orçamento deve permitir inclusion de Observações gerais (instruções técnicas)
- O orçamento deve separar observações internas (não aparecem no PDF) das observações
  para o cliente (aparecem no PDF)

### 4.3 Itens de Orçamento — Móveis

- Cada item de móvel deve conter: descrição do móvel, material, dimensões (largura,
  profundidade, altura), acabamento, quantidade e valor unitário
- As dimensões devem ser informadas em centímetros
- O sistema deve calcular automaticamente o valor total do item (quantidade × valor unitário)

### 4.4 Itens de Orçamento — Serviços

- Cada item de serviço deve conter: descrição do serviço, unidade de medida (unidade,
  metro quadrado, hora, etc.), quantidade e valor unitário
- Exemplos de serviços: instalação, transporte, montagem, acabamento especial

### 4.5 Cálculo de Valores

- O valor total de cada item = quantidade × valor unitário - desconto (se houver)
- O valor total do orçamento = soma de todos os valores totais dos itens
- Todos os valores devem ser exibidos em formato brasileiro (R$ 1.234,56)
- Alterações em itens ou valores devem atualizar automaticamente os totais

### 4.6 Controle de Status do Orçamento

- Status válidos: Rascunho, Enviado, Em análise, Aprovado, Recusado, Vencido, Revisado
- Transições permitidas:
  - Rascunho → Enviado (quando o orçamento é enviado ao cliente)
  - Enviado → Em análise (quando o cliente demonstra interesse)
  - Em análise → Aprovado (quando o cliente aprova)
  - Em análise → Recusado (quando o cliente recusa)
  - Enviado → Vencido (quando o orçamento expira após período configurável)
  - Aprovado → Revisado (quando há necessidade de alteração pós-aprovação)
  - Revisado → Enviado (quando a revisão é reenviada ao cliente)
- Toda transição deve registrar: data, usuário responsável e motivo (quando aplicável)
- Aprovados e Recusados não podem sofrer alterações nos itens ou valores

### 4.7 Geração de PDF

- O sistema deve gerar PDF profissional do orçamento com layout padronizado
- Conteúdo obrigatório do PDF: identificador do orçamento, data de emissão, dados do cliente,
  lista de itens com descrição e valores, valor total, condições gerais, validade do orçamento
- O PDF deve conter logo da marcenaria (quando configurada) e dados de contato
- Observações internas NÃO devem aparecer no PDF
- O PDF gerado deve ser armazenado no sistema com referência ao orçamento de origem
- O sistema deve registrar quem gerou o PDF e quando

### 4.8 Histórico de Comunicação

- Todo envio de orçamento ao cliente deve gerar registro de comunicação
- O registro deve conter: canal (e-mail/WhatsApp), destinatário, data, usuário responsável,
  documento vinculado, tentativa de envio e resultado (sucesso/falha)
- Antes do envio, o usuário deve poder revisar: destinatário, assunto/mensagem e
  documentos anexados
- Falhas de envio NÃO devem marcar o orçamento como "enviado com sucesso"
- Reenvios devem ser registrados como novos eventos, sem substituir o histórico anterior
- Para e-mail: o sistema deve permitir enviar o PDF como anexo com mensagem personalizada
- Para WhatsApp: o sistema deve gerar mensagem pronta com link para download do PDF
- O histórico de comunicações deve ser consultável por cliente, período e canal

## 5. Estados e Transições

### 5.1 Status do Orçamento

- **Rascunho** → Enviado
- **Enviado** → Em análise, Vencido
- **Em análise** → Aprovado, Recusado
- **Aprovado** → Revisado
- **Revisado** → Enviado
- **Recusado** (status final)
- **Vencido** (status final)

### 5.2 Regras de Transição

- Apenas orçamentos em status Rascunho podem ser editados (itens e valores)
- A transição para Enviado só pode ser feita por perfil Comercial ou Administrador
- A aprovação e rejeição devem registrar o motivo
- Orçamentos Vencidos não podem ser reativados; um novo orçamento deve ser criado
- Toda transição deve registrar: data/hora, usuário e motivo (quando aplicável)

## 6. Validações

| Campo/Regra | Validação | Mensagem de erro |
|-------------|-----------|-----------------|
| Nome do cliente | Obrigatório, mínimo 2 caracteres | "Nome do cliente é obrigatório e deve ter pelo menos 2 caracteres" |
| Telefone do cliente | Obrigatório, formato válido | "Informe um telefone de contato válido" |
| Descrição do item | Obrigatório, mínimo 3 caracteres | "A descrição do item é obrigatória" |
| Quantidade | Obrigatório, valor maior que zero | "A quantidade deve ser maior que zero" |
| Valor unitário | Obrigatório, valor maior que zero | "O valor unitário deve ser maior que zero" |
| Orçamento sem itens | Não pode ser enviado | "Adicione pelo menos um item antes de enviar o orçamento" |
| Transição de status | Deve seguir regras de transição | "Transição de status não permitida" |
| Dados para PDF | Campos obrigatórios preenchidos | "Preencha todos os dados necessários para gerar o PDF" |

## 7. Critérios de Aceite

- [ ] Cliente pode ser cadastrado com dados completos e corretos
- [ ] Lista de clientes permite busca por nome, telefone e CPF/CNPJ
- [ ] Orçamento pode ser criado com múltiplos itens (móveis e serviços)
- [ ] Valores são calculados automaticamente corretamente
- [ ] Status do orçamento segue as transições definidas
- [ ] PDF é gerado com layout profissional e dados corretos
- [ ] PDF não inclui observações internas
- [ ] Envio por e-mail gera registro de comunicação completo
- [ ] Envio por WhatsApp gera registro de comunicação completo
- [ ] Falhas de envio são registradas e não marcam como enviado com sucesso
- [ ] Histórico de comunicações é consultável por cliente e período
- [ ] Usuário consegue revisar dados antes de enviar orçamento
- [ ] Interface é responsiva e funciona em computador e celular
- [ ] Valores monetários são exibidos em formato brasileiro (R$)
- [ ] Campos obrigatórios são validados antes de ações irreversíveis
- [ ] Orçamento aprovado não pode ser alterado
- [ ] Trilha de auditoria registra criação, alterações, envios e aprovações

## 8. Fora do Escopo (Fase 1)

- Ordens de serviço (serão implementadas na Fase 2)
- Contratos (serão implementados na Fase 2)
- Financeiro e recibos (serão implementados na Fase 3)
- Integração oficial com WhatsApp API (será implementada em fase futura)
- Checklists de produção, entrega e instalação
- Relatórios gerenciais avançados
- Controle de estoque de materiais
- Agenda de produção e entregas

## 9. Premissas

- A marcenaria possui pelo menos um usuário com perfil Comercial para operar o sistema
- Os usuários possuem acesso à internet para utilização do sistema
- A marcenaria possui dados de contato (e-mail e/ou WhatsApp) dos clientes para envio
- O sistema será acessado primariamente via computador, mas deve funcionar em celular
- A marcenaria não possui integração com outros sistemas nesta fase
- Os valores de orçamento são inseridos manualmente pelo usuário (não há integração com
  tabela de preços automática nesta fase)
