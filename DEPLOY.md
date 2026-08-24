# Deploy — Cloudflare (git automático)

Dois artefatos separados: o **front (Pages)** com deploy automático via git, e o **Worker de ingestão** (deploy por comando).

## 1. Front no Pages, conectado ao GitHub (deploy automático)

Só pode ser feito no dashboard (é um OAuth com o GitHub — CLI não conecta o git):

1. **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Escolha o repo **`dgsidney/politicos`**.
3. **Build settings:**
   - Framework preset: **None**
   - **Root directory:** `web`
   - Build command: *(deixe vazio)*
   - **Build output directory:** `public`
   - (As Pages Functions são detectadas automaticamente em `web/functions`.)
4. **Deploy.** A partir daí, **todo `git push` na branch `main` publica sozinho**.
5. Depois do primeiro deploy: **Settings → Bindings → add D1**
   - Variable name: **`DB`** · Database: **`politicos-db`**
   - Adicione em **Production e Preview**. (Sem isso, `/api/governador` não acha o banco.)

## 2. Worker de ingestão (deploy por comando)

O Worker de cron não entra no git-auto do Pages. Publique quando precisar:

```bash
npm run deploy:ingest      # wrangler deploy --config worker/wrangler.jsonc
```

(Opcional: dá pra ligar **Workers Builds** no dashboard pra ele também buildar do git.)

## 3. Ordem certa na primeira vez

```bash
# 0. migration no REMOTO (o worker/wrangler.jsonc já está com o database_id certo)
npm run db:apply:remote

# 1. bulk (funciona com User-Agent de navegador; se der 403, tente de um IP no Brasil)
npm run ingest:bulk
#    -> gera db/seed-governador-sp.sql

# 2. carrega os candidatos reais no D1 remoto
npx wrangler d1 execute politicos-db --remote --file db/seed-governador-sp.sql

# 3. git push -> Pages publica sozinho -> /api/governador lista os governadores de SP
```

## Trava de conformidade (relembrando)

O grupo B carrega só a **lista neutra** de candidatos (nome, partido, número) — dado público, sem flag, sem cor. **Pode publicar.**
A trava vale quando entrarem **atos flagados** (laranja/vermelho com nome real, FV-C/D): aí, antes de ir ao ar público, passa o checklist de neutralidade + olhar jurídico. Até lá, mantenha o classificador em staging.
