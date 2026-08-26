import { describe, it, expect } from "vitest";
import { normalizarSituacaoRegistro } from "./divulgacand.js";

describe("normalizarSituacaoRegistro (FV-C · régua Ficha Limpa)", () => {
  it("aguardando julgamento → aguardando", () => {
    expect(normalizarSituacaoRegistro("Aguardando julgamento")).toBe("aguardando");
  });

  it("deferido puro → deferido", () => {
    expect(normalizarSituacaoRegistro("Deferido")).toBe("deferido");
  });

  it("deferido com recurso → sub_judice (janela recursal aberta)", () => {
    expect(normalizarSituacaoRegistro("Deferido com recurso")).toBe("sub_judice");
  });

  // Ponto crítico: indeferimento fresco em janela recursal NÃO é ato consumado.
  // Vira vermelho só quando o TRE confirmar ou transitar em julgado.
  it("indeferido em prazo recursal ou com recurso → sub_judice", () => {
    expect(
      normalizarSituacaoRegistro("Indeferido em prazo recursal ou com recurso"),
    ).toBe("sub_judice");
  });

  it("indeferido com recurso → sub_judice", () => {
    expect(normalizarSituacaoRegistro("Indeferido com recurso")).toBe("sub_judice");
  });

  it("indeferido (sem qualificador) → indeferido", () => {
    expect(normalizarSituacaoRegistro("Indeferido")).toBe("indeferido");
  });

  it("cassado → cassado", () => {
    expect(normalizarSituacaoRegistro("Cassado")).toBe("cassado");
  });

  it("renúncia → renuncia (fora da lista, não classificado)", () => {
    expect(normalizarSituacaoRegistro("Renúncia")).toBe("renuncia");
    expect(normalizarSituacaoRegistro("Renuncia")).toBe("renuncia");
  });

  it("desconhecido / vazio → aguardando (fallback seguro)", () => {
    expect(normalizarSituacaoRegistro("")).toBe("aguardando");
    expect(normalizarSituacaoRegistro(null)).toBe("aguardando");
    expect(normalizarSituacaoRegistro("Situação nova que não conhecemos")).toBe("aguardando");
  });
});
