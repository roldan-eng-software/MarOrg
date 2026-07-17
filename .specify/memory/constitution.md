<!--
  Sync Impact Report
  ==================
  Version change: N/A (initial creation) → 1.0.0
  Modified principles: N/A (initial creation)
  Added sections: All 9 principles + Governance
  Removed sections: N/A
  Templates requiring updates: ⚠ pending (no templates exist yet)
  Follow-up TODOs: None
-->

# Constituição do Projeto — Sistema de Gestão para Marcenaria Sob Medida

**Versão:** 1.0.0
**Data de ratificação:** 2026-07-17
**Data da última emenda:** 2026-07-17

---

## Princípio I — Regras de negócio antes da tecnologia

- Toda funcionalidade deve começar com uma especificação clara do problema de negócio,
  do usuário envolvido, do resultado esperado e dos critérios de aceite.
- A especificação funcional deve descrever somente O QUE será entregue e POR QUE isso
  importa, sem definir linguagem, framework, banco de dados, API ou fornecedor.
- Decisões sobre COMO implementar pertencem exclusivamente ao plano técnico.
- Nenhuma funcionalidade deve ser implementada sem regras de negócio, estados válidos,
  validações, permissões e critérios de aceite definidos.
- Em caso de conflito, a integridade do processo comercial, financeiro e documental
  tem prioridade sobre conveniência técnica.

**Racional:** Um erro em orçamento, contrato, ordem de serviço ou recibo pode gerar
prejuízo, retrabalho e conflito com o cliente. O sistema deve preservar o processo
de negócio.

---

## Princípio II — Integridade documental e rastreabilidade

- Orçamentos, ordens de serviço, contratos e recibos emitidos DEVEM possuir identificador
  único, data de emissão, versão e vínculo com os registros de origem.
- Documentos emitidos NÃO DEVEM ser alterados silenciosamente nem excluídos fisicamente.
- Alterações em documentos comerciais devem criar uma nova versão, revisão, aditivo ou
  cancelamento com justificativa, preservando o documento original.
- Todo documento final deve ser armazenado como PDF e manter referência ao seu registro
  de origem, ao cliente, ao usuário responsável e à data de geração.
- O sistema DEVE registrar quem criou, editou, aprovou, cancelou, gerou ou enviou cada
  documento relevante.
- Recibos emitidos são imutáveis. Caso exista erro, o recibo deve ser cancelado com motivo
  registrado e um novo recibo deve ser emitido, se necessário.

**Racional:** A marcenaria precisa consultar exatamente o que foi proposto, contratado,
recebido e enviado ao cliente em qualquer momento.

---

## Princípio III — Fonte única e congelamento de dados aprovados

- O cadastro de cliente deve ser a fonte principal dos dados cadastrais, mas documentos
  emitidos devem manter uma cópia dos dados existentes no momento da emissão.
- Um orçamento aprovado deve gerar uma ordem de serviço por conversão controlada, sem
  redigitação manual dos itens, valores, condições e dados essenciais.
- A ordem de serviço deve preservar uma cópia congelada dos dados aprovados.
- Alterar posteriormente um orçamento não pode modificar uma ordem de serviço, contrato
  ou recibo já emitido.
- Cada ordem de serviço deve estar vinculada ao orçamento e à versão aprovada que lhe deu
  origem.
- Contratos devem ser gerados a partir de um modelo versionado e preenchidos com dados da
  ordem de serviço aprovada.

**Racional:** Dados aprovados pelo cliente não podem mudar por acidente após o início
da produção ou após a formalização comercial.

---

## Princípio IV — Financeiro baseado em lançamentos

- O financeiro deve registrar cada recebimento individualmente; é proibido representar
  pagamentos apenas com um campo genérico de status "pago".
- Cada recebimento deve possuir cliente, ordem de serviço, data, valor, forma de pagamento,
  tipo de recebimento, responsável pelo lançamento e comprovante quando disponível.
- Tipos mínimos de recebimento: sinal, parcela, pagamento final, pagamento complementar
  e devolução.
- O saldo em aberto deve ser calculado a partir do valor contratado menos os recebimentos
  líquidos válidos.
- Um recibo só pode ser emitido para um recebimento financeiro existente e confirmado.
- O sistema deve impedir dois recibos ativos para o mesmo lançamento financeiro.
- Cancelamentos, estornos e devoluções devem manter vínculo com os registros originais e
  exigir justificativa.
- A liberação da produção deve respeitar uma política configurável, como pagamento do
  sinal ou confirmação expressa do responsável.

**Racional:** O sistema deve demonstrar com clareza quanto foi contratado, recebido,
devolvido e ainda está em aberto para cada serviço.

---

## Princípio V — Segurança, privacidade e controle de acesso

- O sistema deve adotar segurança desde a primeira entrega.
- Cada usuário deve possuir acesso individual; senhas compartilhadas são proibidas.
- Permissões devem seguir o menor privilégio necessário para a função do usuário.
- Perfis mínimos: administrador, comercial/atendimento, produção e financeiro.
- Dados financeiros, documentos internos, comprovantes e informações pessoais de clientes
  devem ser acessados somente por perfis autorizados.
- Arquivos e documentos privados não podem possuir links públicos permanentes.
- Todo acesso externo a documento deve utilizar mecanismo controlado, com expiração,
  autorização ou validação adequada.
- Dados pessoais devem ser coletados e tratados somente quando necessários para orçamento,
  contratação, produção, cobrança, entrega, instalação ou obrigações legais.
- O sistema deve manter trilha de auditoria para ações sensíveis, incluindo alterações,
  cancelamentos, aprovações, pagamentos e envios.
- Backups, recuperação de dados e proteção contra exclusão acidental devem ser previstos
  no plano técnico antes da produção.

**Racional:** O sistema trata nome, telefone, endereço, CPF/CNPJ, valores, contratos,
comprovantes e dados comerciais confidenciais.

---

## Princípio VI — Comunicação verificável com o cliente

- Todo envio de orçamento, ordem de serviço, contrato, recibo ou cobrança deve gerar um
  registro de comunicação.
- O histórico deve registrar canal, destinatário, data, usuário responsável, documento,
  tentativa de envio e resultado.
- Canais iniciais obrigatórios: e-mail e WhatsApp.
- Mensagens devem usar linguagem simples, educada, objetiva e adequada ao cliente final.
- Antes do envio, o usuário deve poder revisar destinatário, assunto, mensagem e documentos
  anexados ou vinculados.
- Falhas de envio não podem marcar o documento como enviado com sucesso.
- Reenvios devem ser registrados como novos eventos, sem substituir o histórico anterior.
- Para WhatsApp, o sistema deve suportar inicialmente mensagem pronta com link seguro para
  o PDF; integrações oficiais podem ser incorporadas em fase posterior.

**Racional:** O sistema deve permitir provar o que foi enviado, para quem, quando e por
qual canal.

---

## Princípio VII — Operação orientada a status e prazos

- Orçamentos, ordens de serviço, contratos, recebimentos, documentos e comunicações devem
  possuir status explícitos, transições válidas e histórico.
- Status mínimos do orçamento: rascunho, enviado, em análise, aprovado, recusado, vencido
  e revisado.
- Status mínimos da ordem de serviço: aguardando sinal, liberada, em produção, pronta,
  em entrega, instalada, concluída e cancelada.
- Toda transição relevante deve validar pré-requisitos e registrar data, usuário e motivo
  quando aplicável.
- A ordem de serviço deve conter prazos de produção, entrega e instalação quando aplicável.
- O sistema deve separar observações internas das observações destinadas ao cliente.
- Funcionalidades futuras de checklist devem cobrir produção, entrega, instalação e
  aceite/conferência do cliente.

**Racional:** A marcenaria precisa saber claramente em que fase está cada serviço e
identificar pendências antes que se transformem em atraso ou retrabalho.

---

## Princípio VIII — Qualidade, validação e evolução incremental

- Toda funcionalidade deve incluir critérios de aceite verificáveis antes da implementação.
- Regras críticas devem possuir testes automatizados, incluindo cálculo de saldo, emissão
  de recibo, conversão de orçamento para ordem de serviço, versionamento documental,
  permissões e transições de status.
- Toda alteração deve preservar compatibilidade com documentos e dados já existentes.
- Migrações de dados devem ser reversíveis ou possuir plano de recuperação validado.
- Erros devem ser apresentados ao usuário em linguagem clara, sem expor dados internos,
  detalhes técnicos ou informações sensíveis.
- Funcionalidades grandes devem ser divididas em fases pequenas, utilizáveis e testáveis.
- Não implementar recursos fora do escopo aprovado sem atualizar primeiro a especificação
  e, quando necessário, o plano técnico.

**Racional:** O produto deve evoluir com segurança, sem interromper a rotina administrativa,
financeira e produtiva da marcenaria.

---

## Princípio IX — Experiência simples e adequada à rotina da marcenaria

- A interface deve priorizar rapidez, clareza e uso diário em computador e celular.
- Formulários devem reduzir redigitação por meio de preenchimento automático, dados
  derivados e reaproveitamento de informações aprovadas.
- Campos obrigatórios devem ser identificados com clareza e validados antes de ações
  irreversíveis, como emissão, cancelamento e envio.
- Valores monetários, datas, números de documentos e status devem ser apresentados em
  formato brasileiro e de leitura simples.
- Nenhuma informação operacional importante deve depender somente de conversa informal,
  memória do usuário ou arquivos externos não vinculados ao sistema.
- A interface deve deixar evidente o saldo pendente, os prazos próximos, os documentos
  emitidos e as próximas ações necessárias.

**Racional:** O sistema deve diminuir trabalho administrativo e erros, não criar etapas
desnecessárias para a operação da marcenaria.

---

## Governança

- Esta constituição é obrigatória para todas as especificações, planos, tarefas, revisões
  de código, testes, alterações de banco de dados, integrações e documentação do projeto.
- Antes de implementar uma funcionalidade, o plano técnico deve conter uma seção
  "Constitution Check" demonstrando como a solução cumpre cada princípio aplicável.
- Se houver conflito entre prazo e princípios desta constituição, os princípios prevalecem.
- Exceções exigem justificativa explícita, impacto documentado, aprovação do administrador
  do projeto e plano para eliminação da exceção.
- Alterações na constituição devem ser versionadas semanticamente:
  - MAJOR para remoção ou redefinição incompatível de princípios;
  - MINOR para novo princípio ou expansão material de regras;
  - PATCH para esclarecimentos sem mudança material de governança.
- Toda alteração na constituição deve atualizar a data de emenda, gerar relatório de impacto
  de sincronização e revisar templates, documentação e orientações de agentes relacionados.
- A constituição deve ser revisada antes do início de cada grande fase do produto e sempre
  que houver mudança relevante em segurança, documentos, pagamentos, contratos ou acesso
  a dados.
