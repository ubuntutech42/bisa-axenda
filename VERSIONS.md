# Matriz de Versoes do Ecossistema BISA

Este arquivo e a fonte oficial de verdade para versoes de runtime, framework e dependencias criticas do ecossistema.

## Versoes oficiais (baseline)

| Categoria | Pacote | Versao oficial | Observacao |
|---|---|---|---|
| Framework | `next` | `15.3.8` | App Router obrigatorio |
| Frontend | `react` | `18.3.1` | Sincronizar com `react-dom` |
| Frontend | `react-dom` | `18.3.1` | Sincronizar com `react` |
| Backend SDK | `firebase` | `11.9.1` | Firestore/Auth/Functions no cliente |
| Linguagem | `typescript` | `5.x` | Tipagem estrita obrigatoria |
| UI | `tailwindcss` | `3.4.1` | Base do Design System |
| UI | `lucide-react` | `0.475.0` | Iconografia padrao |
| Validacao | `zod` | `3.24.2` | Contratos e schemas |

## Politica de governanca de versoes

1. Toda proposta de alteracao de versao critica deve incluir analise de compatibilidade no ecossistema.
2. Nao atualizar versoes criticas de forma isolada entre projetos sem justificativa tecnica.
3. Em caso de conflito, priorizar compatibilidade entre sistemas sobre conveniencia local.
4. Toda alteracao aprovada deve atualizar este arquivo e ser refletida na comunicacao tecnica da entrega.

## Checklist de mudanca de versao

- Confirmar impacto em build e runtime.
- Confirmar impacto em autenticacao/autorizacao (Firebase).
- Confirmar impacto em contratos de dados e integracoes.
- Confirmar necessidade de migracao incremental entre projetos.

## Como usar no dia a dia

- Antes de adicionar/atualizar dependencia critica, consultar este arquivo.
- Se a versao local divergir do baseline, reportar no planejamento.
- Ao concluir tarefa com alteracao de versao, descrever riscos e plano de rollout.
