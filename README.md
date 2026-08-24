# politicos — Portal de Transparência Política (piloto SP 2026)

Agregador de **fatos com fonte** sobre candidatos. Não é lista de "corruptos": mostra o ato oficial + a fonte, e o leitor tira a conclusão. Ver `_bmad-output/planning-artifacts/` (brief, mapa de dados, plano, subtarefas, mockups).

## Estrutura

```
worker/          Worker de ingestão (cron + trigger manual) — bindings D1 + R2
  src/index.js       pipeline runIngest() (stubs FV-B/C/D)
  src/classificar.js função pura de classificação (FV-D) + .test.js
  src/divulgacand.js client da API DivulgaCandContas (FV-C)
web/             Cloudflare Pages (front + Pages Functions de leitura)
  public/index.html  dashboard (portar mockup v2 em FV-F)
  functions/api/     endpoints de leitura (FV-E)
db/
  migrations/0001_init.sql  schema da fatia
  dicionario-notes.md       mapa de colunas do TSE (FV-B1)
```

## Setup (grupo A)

Requer Node 18+ e uma conta Cloudflare. `wrangler` vem como devDependency.

```bash
npm install

# login (interativo — rode você mesmo no terminal, ex.: com o prefixo ! nesta sessão)
npx wrangler login

# A1 — criar o D1 e colar o database_id nos DOIS wrangler.jsonc (worker/ e web/)
npx wrangler d1 create politicos-db

# A2 — criar o bucket R2
npx wrangler r2 bucket create raw-tse

# A3 — aplicar a migration (local e depois remoto)
npm run db:apply:local
npm run db:apply:remote
```

## Dev

```bash
npm test              # FV-D: testes da classificação (não precisa de Cloudflare)
npm run dev:ingest    # Worker; GET /health prova o D1, GET /run dispara runIngest()
npm run dev:web       # Pages + Functions; abre o front e /api/governador
```

## Critério de aceite do grupo A

- [ ] `wrangler d1 list` mostra `politicos-db` (A1)
- [ ] `wrangler r2 bucket list` mostra `raw-tse` (A2)
- [ ] migration aplica limpo local e remoto (A3)
- [ ] `npm run dev:ingest` sobe sem erro de binding; `/health` responde `{db:true}` (A4)
- [ ] `npm test` verde (bônus: FV-D já semeado)

## Trava de conformidade

Não publicar com dados reais **flagados** antes do checklist de neutralidade e de um olhar jurídico. Testar em staging/privado. Ver `plano-tarefas-piloto.md` (Epic 5) e `fatia-vertical-subtarefas.md` (FV-G).
