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
        ORDER BY c.nome`,
    ).bind(cargo).all();
    return Response.json({ cargo, uf: "SP", candidatos: results });
  } catch (e) {
    return Response.json({ cargo, uf: "SP", candidatos: [], nota: String(e) });
  }
}
