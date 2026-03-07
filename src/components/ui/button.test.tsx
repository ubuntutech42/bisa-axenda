import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renderiza com o texto passado", () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByRole("button", { name: /clique aqui/i })).toBeInTheDocument();
  });

  it("chama onClick quando clicado", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Ok</Button>);
    fireEvent.click(screen.getByRole("button", { name: /ok/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("está desabilitado quando disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled();
  });

  it("aplica variante default por padrão", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bg-primary");
  });

  it("aplica variante destructive quando informada", () => {
    render(<Button variant="destructive">Excluir</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bg-destructive");
  });

  it("aplica size quando informado", () => {
    render(<Button size="lg">Grande</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("h-11");
  });
});
