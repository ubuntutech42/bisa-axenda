# Axénda - Sua agenda com axé

Axénda é uma ferramenta de organização pessoal afrocentrada, focada em produtividade, ancestralidade e conexão com seus ciclos.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React, Tailwind CSS, ShadCN UI
- **Backend/Auth:** Firebase (Firestore, Authentication)
- **AI:** Google Genkit
- **Ícones:** Lucide React

## Como editar usando o Cursor IDE

Para trabalhar neste projeto no Cursor, siga estes passos:

1. **Baixe o Código:** Certifique-se de que todos os arquivos do projeto estão em uma pasta no seu computador.
2. **Abra no Cursor:** Clique em `File > Open Folder` e selecione a pasta do projeto.
3. **Configuração de Ambiente:**
   - Crie um arquivo `.env.local` na raiz (não é versionado).
   - Adicione suas chaves do Firebase e do Google AI (GEMINI_API_KEY).
   - **Desenvolvimento sem login:** Para entrar direto no app sem tela de login, adicione em `.env.local`:
     ```
     NEXT_PUBLIC_DEV_SKIP_AUTH=true
     ```
     O app fará login anônimo automaticamente. Use apenas em ambiente local; não defina em produção.
4. **Instalação:**
   ```bash
   npm install
   ```
5. **Recursos de IA do Cursor:**
   - **Chat (Cmd+L):** Pergunte sobre a lógica de qualquer componente. Use `@Files` para dar contexto à IA sobre arquivos específicos.
   - **Edição Inline (Cmd+K):** Selecione um trecho de código e peça para "mudar a cor deste botão" ou "melhorar a tipagem desta função".
   - **Composer (Cmd+I):** O recurso mais poderoso. Peça mudanças complexas que envolvam vários arquivos (ex: "Crie uma nova funcionalidade de etiquetas para as tarefas"). Ele aplicará as mudanças de forma similar ao App Prototyper do Firebase Studio.

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento do Next.js.
- `npm run genkit:dev`: Inicia a interface do Genkit para testar os fluxos de IA.
- `npm run build`: Cria a versão de produção.

## Estrutura do Projeto

- `/src/app`: Rotas e páginas da aplicação.
- `/src/components`: Componentes React reutilizáveis.
- `/src/firebase`: Configuração e hooks do Firebase.
- `/src/ai`: Fluxos e lógica de Inteligência Artificial usando Genkit.
- `/src/lib`: Utilitários, tipos e constantes.

---
Uma criação **UBUNTU TECH**.
