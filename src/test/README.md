# Testes e mocks

## Setup

O arquivo `setup.ts` é carregado antes de todos os testes e adiciona os matchers do `@testing-library/jest-dom` ao `expect`. O ambiente de DOM usado é o **happy-dom** (configurado em `vitest.config.ts`).

- **Scripts:** `npm run test` (watch), `npm run test:run` (uma vez), `npm run test:coverage` (relatório de cobertura em `coverage/`).
- **Tipos:** O arquivo `vitest-env.d.ts` referencia os tipos do Vitest e do jest-dom para autocomplete em arquivos de teste.

## Mocks para Firebase e Genkit

Para testar código que depende de Firebase ou Genkit, use `vi.mock()` do Vitest.

### Firebase

Exemplo mockando o módulo de auth ou firestore:

```ts
// no topo do arquivo de teste, antes dos imports do código que usa Firebase
vi.mock("@/firebase/config", () => ({
  auth: {},
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  getDocs: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(),
  // ... outros que o seu código usa
}));
```

Para hooks que usam Firebase, use `renderHook` de `@testing-library/react` e garanta que o mock retorna os valores que o hook espera (ex.: array vazio, loading false).

### Genkit

Exemplo mockando um flow do Genkit:

```ts
vi.mock("@/ai/genkit", () => ({
  generateMotivationalQuote: vi.fn().mockResolvedValue("Frase mockada"),
}));
```

Assim você testa a lógica que consome o resultado do Genkit sem chamar o backend.

### Dica

Coloque os mocks no início do arquivo de teste (ou em um `beforeEach` se precisar reconfigurar por teste). O Vitest hoista os `vi.mock()` para o topo da execução, então a ordem em relação a outros imports costuma ser irrelevante, mas o mock deve estar no mesmo arquivo que o teste que o utiliza.
