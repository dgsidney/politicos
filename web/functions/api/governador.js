// FV-E1 (stub) · Lista de candidatos a Governador (SP), com o balde já calculado.
// Pages Function: GET /api/governador

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT c.sq_candidato, c.nome, c.nome_urna, c.numero,
              p.sigla AS partido, cl.balde
         FROM candidato c
         LEFT JOIN partido p       ON p.id = c.partido_id
         LEFT JOIN classificacao cl ON cl.sq_candidato = c.sq_candidato
        WHERE c.cargo = 'GOVERNADOR' AND c.sg_uf = 'SP'
        ORDER BY c.nome`,
    ).all();
    return Response.json({ cargo: "GOVERNADOR", uf: "SP", candidatos: results });
  } catch (e) {
    // Antes das migrations/ingestão, retorna vazio em vez de estourar.
    return Response.json({ cargo: "GOVERNADOR", uf: "SP", candidatos: [], nota: String(e) });
  }
}
