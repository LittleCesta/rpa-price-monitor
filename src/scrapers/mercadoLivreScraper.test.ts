import { describe, it, expect } from "vitest";
import { parsePrice } from "./mercadoLivreScraper";

describe("parsePrice", () => {
  it("converte preço com milhar e centavos", () => {
    expect(parsePrice("1.234,56")).toBe(1234.56);
  });

  it("converte preço sem separador de milhar", () => {
    expect(parsePrice("99,90")).toBe(99.9);
  });

  it("converte preço inteiro sem centavos", () => {
    expect(parsePrice("500")).toBe(500);
  });

  it("retorna null quando o texto é null", () => {
    expect(parsePrice(null)).toBeNull();
  });

  it("retorna null quando o texto não é numérico", () => {
    expect(parsePrice("indisponível")).toBeNull();
  });
});
