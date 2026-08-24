// FV-C · Client da API DivulgaCandContas (REST JSON).
// Endpoints não oficiais — CONFIRMAR nas docs comunitárias:
//   github.com/augusto-herrmann/divulgacandcontas-doc
//   github.com/meucandidato/tse-apidoc
// Regra: espaçar as chamadas (rate-limit gentil) para não derrubar o TSE nem tomar bloqueio de IP.

const BASE = "https://divulgacandcontas.tse.jus.br/divulga"; // conferir path exato da API

export async function detalheCandidato(idCandidato, { fetchImpl = fetch } = {}) {
  // TODO FV-C1: montar a URL real do endpoint de detalhe e parsear.
  throw new Error("detalheCandidato: não implementado (FV-C)");
}

// URL pública (para exibir como fonte na gaveta do front).
export function fonteUrlCandidato({ codEleicao, ue, sqCandidato }) {
  return `${BASE}/#/candidato/${codEleicao}/${ue}/${sqCandidato}`;
}

// Fila simples com atraso entre chamadas (FV-C2).
export async function comRateLimit(itens, fn, { delayMs = 800 } = {}) {
  const out = [];
  for (const item of itens) {
    out.push(await fn(item));
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return out;
}
