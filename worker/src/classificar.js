// FV-D · Classificação determinística (função pura).
// Régua: Lei da Ficha Limpa — condenação por ÓRGÃO COLEGIADO (não juiz único).
//
// Entrada: lista de atos { tipo, situacao } de um candidato.
// Saída:   'verde' | 'laranja' | 'vermelho' | 'cinza'

export function classificar(atos = []) {
  // Sem nenhum registro apreciado ainda → cinza (nem verde, nem vermelho).
  if (!registroFoiApreciado(atos)) return "cinza";

  if (atos.some(ehVermelho)) return "vermelho";
  if (atos.some(ehLaranja)) return "laranja";
  return "verde";
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
  return false;
}

// Algo NÃO julgado → requer atenção (gaveta).
function ehLaranja(a) {
  if (a.tipo === "registro" && a.situacao === "sub_judice") return true;
  if (a.tipo === "impugnacao" && a.situacao !== "julgada_improcedente") return true;
  if (a.tipo === "processo" && a.situacao === "sem_transito") return true;
  return false;
}
