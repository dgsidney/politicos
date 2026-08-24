// FV-E2 · Detalhe de um candidato + seus atos oficiais (para a gaveta).
// Pages Function: GET /api/candidato/:sq

export async function onRequestGet({ params, env }) {
  const sq = params.sq;
  try {
    const candidato = await env.DB.prepare(
      `SELECT c.sq_candidato, c.nome, c.nome_urna, c.numero, c.cargo, c.sg_uf,
              p.sigla AS partido, p.nome AS partido_nome, cl.balde
         FROM candidato c
         LEFT JOIN partido p        ON p.id = c.partido_id
         LEFT JOIN classificacao cl ON cl.sq_candidato = c.sq_candidato
        WHERE c.sq_candidato = ?`,
    ).bind(sq).first();

    const atos = await env.DB.prepare(
      `SELECT tipo, situacao, descricao, orgao, numero_processo, data_ato, fonte_url, fonte_coletada_em
         FROM ato_oficial WHERE sq_candidato = ? ORDER BY id`,
    ).bind(sq).all();

    return Response.json({ candidato, atos: atos.results });
  } catch (e) {
    return Response.json({ candidato: null, atos: [], nota: String(e) }, { status: 500 });
  }
}
