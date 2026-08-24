// Worker de ingestão — pipeline de dados do piloto (Governador SP 2026).
// Grupo A = scaffold. Os passos B/C/D preenchem runIngest().

export default {
  // Cron (quando ligado no wrangler.jsonc) chama aqui.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runIngest(env));
  },

  // Trigger manual para desenvolvimento: GET /run
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/run") {
      const resultado = await runIngest(env);
      return Response.json(resultado);
    }
    if (url.pathname === "/health") {
      // prova que o binding do D1 responde
      const { results } = await env.DB.prepare("SELECT 1 AS ok").all();
      return Response.json({ db: results?.[0]?.ok === 1 });
    }
    return new Response("politicos-ingest ok", { status: 200 });
  },
};

async function runIngest(env) {
  // TODO FV-B: baixar bulk SP do TSE -> R2 (env.RAW) -> parse -> upsert candidato/partido
  // TODO FV-C: detalhe DivulgaCand (rate-limited) -> ato_oficial
  // TODO FV-D: classificar(atos) -> gravar classificacao
  return { ok: true, stub: true, ts: new Date().toISOString() };
}
