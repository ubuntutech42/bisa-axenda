import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("retorna string vazia quando não recebe argumentos", () => {
    expect(cn()).toBe("");
  });

  it("combina múltiplas classes em uma string", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignora valores falsy (undefined, null)", () => {
    expect(cn("a", undefined, "b", null, "c")).toBe("a b c");
  });

  it("aplica tailwind-merge: classes conflitantes ficam com a última", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("aceita objetos condicionais (padrão clsx)", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("aceita array de classes", () => {
    expect(cn(["a", "b"])).toBe("a b");
  });
});
