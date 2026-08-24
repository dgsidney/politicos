// FV-D · Classificação determinística (função pura).
// Régua: Lei da Ficha Limpa — condenação por ÓRGÃO COLEGIADO (não juiz único).
//
// Entrada: lista de atos { tipo, situacao } de um candidato.
// Saída:   'verde' | 'laranja' | 'vermelho' | 'cinza'

export function classificar(atos = []) {
  return classificarComMotivo(atos).balde;
}

// Igual a classificar(), mas devolve QUAL ato justificou o balde (índice em `atos`),
// para gravar classificacao.motivo_ato_id. Fonte única da verdade da regra.
export function classificarComMotivo(atos = []) {
  // Sem nenhum registro apreciado ainda → cinza (nem verde, nem vermelho).
  if (!registroFoiApreciado(atos)) return { balde: "cinza", motivo: null };

  let i = atos.findIndex(ehVermelho);
  if (i >= 0) return { balde: "vermelho", motivo: i };
  i = atos.findIndex(ehLaranja);
  if (i >= 0) return { balde: "laranja", motivo: i };
  return { balde: "verde", motivo: null };
}

function registroFoiApreciado(atos) {
  return atos.some(
    (a) => a.tipo === "registro" && a.situacao && a.situacao !== "aguardando",
  );
}

// Ato oficial CONSUMADO.
function ehVermelho(a) {
  if (a.tipo === "registro" && a.situacao === "indeferido") return true;
  if (a.tipo === "inelegibilidade" && a.situacao === "declarada") return true;
  if (a.tipo === "condenacao" && a.situacao === "colegiado") return true; // Ficha Limpa
  if (a.tipo === "cassacao" && a.situacao === "cassado") return true;
  return false;
}

// Algo NÃO julgado → requer atenção (gaveta).
function ehLaranja(a) {
  if (a.tipo === "registro" && a.situacao === "sub_judice") return true;
  if (a.tipo === "impugnacao" && a.situacao !== "julgada_improcedente") return true;
  if (a.tipo === "processo" && a.situacao === "sem_transito") return true;
  if (a.tipo === "cassacao" && a.situacao === "em_curso") return true; // processo não julgado
  return false;
}
