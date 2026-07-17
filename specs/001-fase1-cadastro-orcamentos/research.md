# Pesquisa Técnica — Fase 1: Cadastro de Clientes e Orçamentos

**Data:** 2026-07-17

---

## 1. Geração de PDF no Ambiente Vercel

### Decisão
Usar `@react-pdf/renderer` para gerar PDFs de orçamentos diretamente no Node.js da Vercel.

### Racional
- Não requer binários pesados como Chromium, Puppeteer ou wkhtmltopdf
- Funciona no runtime serverless da Vercel sem configuração especial
- Permite montar PDFs com componentes React, aproveitando familiaridade da equipe
- Gera PDFs de qualidade profissional com suporte a tabelas, imagens e layout customizado
- Documentação ativa e comunidade razoável

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Puppeteer/Chromium | Exige binários pesados (~300MB), instável no serverless da Vercel |
| pdf-lib | Baixo nível, sem suporte a layout complexo com tabelas |
| jsPDF | Limitado para layouts profissionais com múltiplas páginas |
| HTML para PDF (outras) | Mesmo problema do Puppeteer — dependência de browser headless |

### Referências
- https://react-pdf.org/
- Documentação: https://react-pdf.org/fonts

---

## 2. Autenticação com Supabase no Next.js App Router

### Decisão
Usar `@supabase/ssr` para autenticação server-side baseada em cookies, com Server Components e Server Actions.

### Racional
- Suporte nativo para App Router e Server Components
- Cookies HttpOnly permitem acesso server-side sem expor tokens no browser
- Integra perfeitamente com middleware e Server Actions
- Não requer configuração de JWT customizado

### Padrão de Implementação
- `createBrowserClient()` para Client Components
- `createServerClient()` com cookies para Server Actions e Route Handlers
- Middleware para verificar sessão em rotas protegidas

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| JWT customizado | Complexo, requer refresh token management manual |
| NextAuth.js | Overkill para uso com Supabase Auth |
| Clerk | Provider externo desnecessário quando Supabase já provê Auth |

---

## 3. Validação Compartilhada Cliente/Servidor

### Decisão
Usar Zod para schemas de validação compartilhados entre Client Components e Server Actions.

### Racional
- Inferência automática de tipos TypeScript a partir dos schemas
- Mesmo schema roda no browser (React Hook Form) e no servidor (Server Actions)
- Reduz duplicação e risco de divergência entre validações
- Comunidade ativa, boa integração com React Hook Form via `@hookform/resolvers`

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Yup | Menos robusto para inferência de tipos |
| Valibot | Alternativa menor, menos documentação |
| Validação manual | Duplicação, propensa a erros |

---

## 4. Formulários com React Hook Form

### Decisão
Usar React Hook Form para gerenciamento de formulários com validação Zod.

### Racional
- Performance excelente (re-render mínimo)
- Integração nativa com Zod via `@hookform/resolvers`
- Suporte a validação assíncrona e campos dinâmicos (itens de orçamento)
- Comunidade ativa e documentação clara

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Formik | Mais pesado, mais re-renders |
| Server Components forms | Limitado para formulários complexos com estado local |

---

## 5. E-mails Transacionais com Resend

### Decisão
Usar Resend para envio de e-mails transacionais (orçamentos, notificações).

### Racional
- API simples e moderna
- Plano gratuito com 100 e-mails/dia (suficiente para MVP)
- Suporte a React Email para templates
- Boa reputação de entrega
- Sem configuração complexa de SMTP

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| SendGrid | Interface mais complexa, plano pago mais caro |
| Nodemailer + SMTP | Requer configuração de servidor SMTP |
| AWS SES | Overkill para uso interno de uma marcenaria |

---

## 11. Validade Padrão do Orçamento

### Decisão
Usar 30 dias como validade padrão dos orçamentos.

### Racional
- Permite ao cliente tempo suficiente para tomar decisão
- Alinhado com prática do mercado de marcenaria sob medida
- Configurável por orçamento quando necessário

---

## 12. Logo no PDF

### Decisão
Não incluir logo no PDF nesta fase.

### Racional
- Simplifica a geração do documento
- A marcenaria pode adicionar logo futuramente quando necessário
- Layout profissional pode ser alcançado sem logo usando dados de contato e formatação

---

## 6. WhatsApp MVP — Link wa.me

### Decisão
Gerar link `wa.me/{phone}?text={message}` com URL assinada temporária do PDF para envio manual via WhatsApp.

### Racional
- Não requer integração com WhatsApp Cloud API (que exige aprovação de Meta)
- Funciona imediatamente sem custo adicional
- Usuário pode enviar manualmente pelo WhatsApp Web ou app
- URL assinada do PDF garante acesso temporário e rastreável
- Interface/adaptador preparado para futura integração oficial

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| WhatsApp Cloud API | Requer aprovação de Meta, custo por mensagem, complexidade |
| Twilio WhatsApp | Custo por mensagem, complexidade para MVP |
| Bibliotecas não-oficiais | Violação dos termos de uso, risco de banimento |

---

## 7. Formato de Número do Orçamento

### Decisão
Usar número sequencial com ano: `ORC-YYYY-NNNN` (ex: ORC-2026-0001).

### Racional
- Identifica visualmente o ano de emissão do orçamento
- Fácil de referenciar em conversas com cliente
- Sequencial por ano (reinicia a cada ano)
- Formato profissional e organizado

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| ORC-0001 (sem ano) | Não identifica período de emissão |
| UUID | Não amigável para referência manual |
| hash | Não legível |

---

## 8. Estrutura de Módulos

### Decisão
Organizar o código por domínio de negócio (`modules/`) com separação interna de actions, queries, schemas, services e components.

### Racional
- Facilita localização de código relacionado
- Permite evolução independente de cada módulo
- Alinha com a estrutura mental do negócio (clientes, orçamentos, etc.)
- Evita o "utils gigante" sem responsabilidade clara

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Organização por tipo (components/, services/) | Difícil localizar código de um domínio |
| Arquitetura hexagonal | Overkill para aplicação monolítica interna |
| features/ | Válido, mas domínios são mais claros para este caso |

---

## 9. Gerenciador de Pacotes

### Decisão
Usar Bun como gerenciador de pacotes e runtime de desenvolvimento.

### Racional
- Mais rápido que npm/yarn para instalação e execução
- Compatível com deploy na Vercel (Vercel suporta Bun)
- Executa testes Vitest mais rapidamente
- Gerenciador de pacotes consistente entre desenvolvimento e CI

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| npm | Mais lento, já superado por Bun |
| yarn | Menos vantagens que Bun na atualidade |
| pnpm | Válido, mas Bun é mais completo |

---

## 10. Monitoramento de Erros

### Decisão
Usar Sentry para monitoramento de erros em produção.

### Racional
- Plano gratuito para projetos pequenos
- Integração nativa com Next.js
- Captura de erros server-side e client-side
- Alertas e dashboards úteis

### Alternativas Consideradas

| Alternativa | Motivo da rejeição |
|-------------|-------------------|
| Log customizado | Sem dashboards, sem alertas |
| Datadog | Caro para uso interno |
| BetterStack | Menos integração com Next.js |
