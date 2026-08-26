// FV-E1 · Lista de candidatos por cargo (SP), com o balde já calculado.
// Pages Function: GET /api/candidatos/:cargo
// cargo em slug: governador | deputado-federal | deputado-estadual

const CARGOS = {
  "governador": "GOVERNADOR",
  "deputado-federal": "DEPUTADO FEDERAL",
  "deputado-estadual": "DEPUTADO ESTADUAL",
};

export async function onRequestGet({ params, env }) {
  const slug = String(params.cargo || "").toLowerCase();
  const cargo = CARGOS[slug];
  if (!cargo) {
    return Response.json(
      { erro: "cargo desconhecido", validos: Object.keys(CARGOS) },
      { status: 404 },
    );
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT c.sq_candidato, c.nome, c.nome_urna, c.numero,
              p.sigla AS partido, cl.balde
         FROM candidato c
         LEFT JOIN partido p        ON p.id = c.partido_id
         LEFT JOIN classificacao cl ON cl.sq_candidato = c.sq_candidato
        WHERE c.cargo = ? AND c.sg_uf = 'SP'
          AND NOT EXISTS (
            SELECT 1 FROM ato_oficial a
             WHERE a.sq_candidato = c.sq_candidato AND a.situacao = 'renuncia'
          )
        ORDER BY c.nome`,
    ).bind(cargo).all();
    const renunciados = await env.DB.prepare(
      `SELECT COUNT(DISTINCT a.sq_candidato) AS n
         FROM ato_oficial a
         JOIN candidato c ON c.sq_candidato = a.sq_candidato
        WHERE a.situacao = 'renuncia' AND c.cargo = ? AND c.sg_uf = 'SP'`,
    ).bind(cargo).first();
    return Response.json({ cargo, uf: "SP", candidatos: results, renunciados: renunciados?.n ?? 0 });
  } catch (e) {
    return Response.json({ cargo, uf: "SP", candidatos: [], renunciados: 0, nota: String(e) });
  }
}
