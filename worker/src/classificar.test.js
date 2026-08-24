import { describe, it, expect } from "vitest";
import { classificar } from "./classificar.js";

describe("classificar (FV-D)", () => {
  it("deferido sem processo → verde", () => {
    expect(classificar([{ tipo: "registro", situacao: "deferido" }])).toBe("verde");
  });

  it("registro sub judice → laranja", () => {
    expect(
      classificar([{ tipo: "registro", situacao: "sub_judice" }]),
    ).toBe("laranja");
  });

  it("impugnação em curso → laranja", () => {
    expect(
      classificar([
        { tipo: "registro", situacao: "deferido" },
        { tipo: "impugnacao", situacao: "em_curso" },
      ]),
    ).toBe("laranja");
  });

  it("registro indeferido → vermelho", () => {
    expect(
      classificar([{ tipo: "registro", situacao: "indeferido" }]),
    ).toBe("vermelho");
  });

  it("condenação por órgão colegiado → vermelho (Ficha Limpa)", () => {
    expect(
      classificar([
        { tipo: "registro", situacao: "deferido" },
        { tipo: "condenacao", situacao: "colegiado" },
      ]),
    ).toBe("vermelho");
  });

  it("vermelho vence laranja quando ambos existem", () => {
    expect(
      classificar([
        { tipo: "registro", situacao: "indeferido" },
        { tipo: "impugnacao", situacao: "em_curso" },
      ]),
    ).toBe("vermelho");
  });

  it("sem registro apreciado → cinza", () => {
    expect(classificar([])).toBe("cinza");
    expect(
      classificar([{ tipo: "registro", situacao: "aguardando" }]),
    ).toBe("cinza");
  });
});
