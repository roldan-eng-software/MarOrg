# Especificação Funcional — [FEATURE_NAME]

**Versão:** [VERSION]
**Data:** [DATE]
**Autor:** [AUTHOR]

---

## 1. Contexto e Problema de Negócio

[PROBLEMA_DE_NEGÓCIO]

## 2. Usuários Envolvidos

| Perfil | Papel na funcionalidade |
|--------|------------------------|
| [USUARIO_1] | [PAPEL] |
| [USUARIO_2] | [PAPEL] |

## 3. Resultado Esperado

[RESULTADO_ESPERADO]

## 4. Regras de Negócio

### 4.1 [REGRA_1]
[DESCRIÇÃO_DA_REGRA]

### 4.2 [REGRA_2]
[DESCRIÇÃO_DA_REGRA]

## 5. Estados e Transições

### 5.1 Status do Orçamento
- Rascunho → Enviado
- Enviado → Em análise
- Em análise → Aprovado / Recusado / Vencido
- Aprovado → Revisado (quando necessário)

### 5.2 Status da Ordem de Serviço
- Aguardando sinal → Liberada
- Liberada → Em produção
- Em produção → Pronta
- Pronta → Em entrega
- Em entrega → Instalada
- Instalada → Concluída
- Qualquer status → Cancelada

### 5.3 [OUTRO_STATUS]
[TRANSIÇÕES]

## 6. Validações

| Campo/Regra | Validação | Mensagem de erro |
|-------------|-----------|-----------------|
| [CAMPO_1] | [VALIDAÇÃO] | [MENSAGEM] |

## 7. Critérios de Aceite

- [ ] [CRITÉRIO_1]
- [ ] [CRITÉRIO_2]

## 8. Fora do Escopo

- [ITEM_FORA_DO_ESCOPO_1]
