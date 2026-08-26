// FV-C · Client + mapeador da API DivulgaCandContas (REST JSON).
// Base e endpoints confirmados no swagger comunitário (augusto-herrmann/divulgacandcontas-doc)
// e sondados ao vivo:
//   GET /eleicao/ordinarias
//   GET /candidatura/buscar/{ano}/{ue}/{eleicao}/candidato/{sq}
// A API está atrás de um WAF que barra 'curl' cru — precisa de headers de navegador.
// (Por isso a ingestão roda como script LOCAL, não de dentro de um Worker.)

export const BASE = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1";
export const ELEICAO_GERAL_2026 = 20322002026; // "Eleição Geral Federal 2026"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "pt-BR,pt;q=0.9",
  Referer: "https://divulgacandcontas.tse.jus.br/divulga/",
};

export async function detalheCandidato({ ano, ue, eleicao, sq }, { fetchImpl = fetch } = {}) {
  const url = `${BASE}/candidatura/buscar/${ano}/${ue}/${eleicao}/candidato/${sq}`;
  const r = await fetchImpl(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`DivulgaCand ${r.status} para sq=${sq}`);
  return r.json();
}

// Link público (SPA) do candidato — vai na gaveta como "ver fonte".
export function fonteUrlCandidato({ eleicao, ue, sq }) {
  return `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${eleicao}/${ue}/${sq}`;
}

// Normaliza a descrição de situação do TSE nos tokens internos que classificar() entende.
// Regra de segurança: desconhecido → 'aguardando' (cinza). Nunca inventar vermelho.
//
// Ficha Limpa: só é ato consumado (vermelho) quando o indeferimento transitou ou foi
// confirmado por órgão colegiado. "Em prazo recursal" (janela aberta) e "com recurso"
// (recurso pendente) são trâmite não julgado → sub_judice (laranja).
export function normalizarSituacaoRegistro(desc) {
  const d = (desc || "").toLowerCase();
  if (d.includes("aguardando")) return "aguardando";
  if (d.includes("cassad")) return "cassado";
  if (d.includes("renúncia") || d.includes("renuncia")) return "renuncia";
  if (d.includes("indeferido") && (d.includes("prazo recursal") || d.includes("com recurso"))) return "sub_judice";
  if (d.includes("indeferido")) return "indeferido";
  if (d.includes("deferido com recurso")) return "sub_judice";
  if (d === "deferido" || d.includes("deferido")) return "deferido";
  return "aguardando";
}

// Detalhe da API -> lista de atos_oficiais (nossos tokens), cada um com fonte + data.
export function mapAtos(detalhe, { ano, ue, eleicao, sq }) {
  const fonte_url = fonteUrlCandidato({ eleicao, ue, sq });
  // dataUltimaAtualizacao é o carimbo da FONTE (ex.: "2026-08-18 21:22") — é o que a UI mostra.
  const carimbo = detalhe?.dataUltimaAtualizacao || new Date().toISOString();
  const atos = [];

  const sit = normalizarSituacaoRegistro(detalhe?.descricaoSituacao);
  atos.push({
    tipo: sit === "cassado" ? "cassacao" : "registro",
    situacao: sit === "cassado" ? "cassado" : sit,
    descricao: `Situação do registro: ${detalhe?.descricaoSituacao ?? "—"}`,
    orgao: "Justiça Eleitoral",
    numero_processo: detalhe?.numeroProcesso || null,
    data_ato: carimbo,
    fonte_url,
    fonte_coletada_em: carimbo,
  });

  for (const _p of detalhe?.processosCassacao || []) {
    atos.push({
      tipo: "cassacao",
      situacao: "em_curso",
      descricao: "Processo de cassação registrado",
      orgao: "Justiça Eleitoral",
      numero_processo: detalhe?.numeroProcesso || null,
      data_ato: carimbo,
      fonte_url,
      fonte_coletada_em: carimbo,
    });
  }

  if (detalhe?.st_MOTIVO_FICHA_LIMPA) {
    atos.push({
      tipo: "inelegibilidade",
      situacao: "declarada",
      descricao: "Motivo Ficha Limpa registrado pela Justiça Eleitoral",
      orgao: "Justiça Eleitoral",
      numero_processo: detalhe?.numeroProcesso || null,
      data_ato: carimbo,
      fonte_url,
      fonte_coletada_em: carimbo,
    });
  }

  return atos;
}

// Fila com atraso entre chamadas (respeitar o TSE — não martelar a API).
export async function comRateLimit(itens, fn, { delayMs = 800 } = {}) {
  const out = [];
  for (const item of itens) {
    out.push(await fn(item));
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return out;
}
