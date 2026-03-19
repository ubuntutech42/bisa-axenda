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
- `npm run lint`: Verifica o código com ESLint.
- `npm run typecheck`: Valida os tipos TypeScript sem compilar.

## Estrutura do Projeto

- `/src/app`: Rotas e páginas da aplicação.
- `/src/components`: Componentes React reutilizáveis.
- `/src/firebase`: Configuração e hooks do Firebase.
- `/src/ai`: Fluxos e lógica de Inteligência Artificial usando Genkit.
- `/src/lib`: Utilitários, tipos e constantes.

## Estratégia de Branches

O projeto usa um modelo de **trunk-based adaptado** com 3 branches principais:

| Branch       | Papel                                                                 |
|--------------|-----------------------------------------------------------------------|
| `main`       | Desenvolvimento diário. Commits atômicos protegidos por Feature Flags. |
| `test`       | Homologação. Push aqui dispara o ambiente de staging no Firebase.     |
| `production` | Código estável em produção. Merges restritos via PR de `test`.        |

O fluxo de promoção é: `main` → `test` → `production`.

## CI/CD (GitHub Actions)

O workflow em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) é executado em todo push e pull request para `main`, `test` e `production`.

**Job `quality`** (obrigatório em todas as branches):
1. `npm ci` — instalação reproduzível
2. `npm run lint` — ESLint via Next.js
3. `npm run typecheck` — `tsc --noEmit`
4. `npm run build` — compilação Next.js

**Job `deploy-staging`** (apenas na branch `test`, após `quality` passar):
- Autentica no Google Cloud via Workload Identity Federation (WIF)
- Cria um rollout no Firebase App Hosting no backend de homologação

O ambiente de homologação (`apphosting.staging.yaml`) é mapeado ao backend do Firebase App Hosting cuja *live branch* está configurada como `test` e cujo *Environment name* é `staging`.

### Secrets necessários

Para o job de deploy funcionar, configure estes secrets no repositório (Settings → Secrets → Actions):

| Secret                            | Descrição                                                   |
|-----------------------------------|-------------------------------------------------------------|
| `WIF_PROVIDER`                    | Provider do Workload Identity Federation (formato `projects/…`) |
| `WIF_SERVICE_ACCOUNT`             | E-mail da Service Account com permissão no App Hosting      |
| `APPHOSTING_BACKEND_ID_STAGING`   | ID do backend de staging no Firebase App Hosting            |
| `FIREBASE_PROJECT_ID_STAGING`     | ID do projeto Firebase de homologação                       |

> Se preferir usar JSON de Service Account em vez de WIF, substitua o passo `google-github-actions/auth` por um secret `FIREBASE_SERVICE_ACCOUNT_STAGING` e passe-o via `GOOGLE_APPLICATION_CREDENTIALS`.

### Configurando o Backend de Staging no Firebase Console

1. Acesse [Firebase Console → App Hosting](https://console.firebase.google.com/project/_/apphosting).
2. Selecione o projeto de homologação.
3. Crie ou edite um backend; em **Settings → Deployment**, defina a *live branch* como `test`.
4. Em **Settings → Environment**, defina o *Environment name* como `staging` — isso fará o App Hosting aplicar o arquivo `apphosting.staging.yaml` automaticamente.
5. Anote o **Backend ID** para usar no secret `APPHOSTING_BACKEND_ID_STAGING`.

---
Uma criação **UBUNTU TECH**.
