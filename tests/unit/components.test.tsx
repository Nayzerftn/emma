import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayTitle, InfoList } from "@/components/site/Typography";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";

describe("DisplayTitle", () => {
  it("rend chaque ligne du titre", () => {
    render(<DisplayTitle lines={["Un bassin", "rien que", "pour vous."]} />);
    expect(screen.getByText("Un bassin")).toBeInTheDocument();
    expect(screen.getByText("rien que")).toBeInTheDocument();
    expect(screen.getByText("pour vous.")).toBeInTheDocument();
  });
});

describe("InfoList", () => {
  it("rend les paires label / valeur", () => {
    render(
      <InfoList
        items={[
          { label: "Disponibilité", value: "Tous les week-ends" },
          { label: "Annulation", value: "Sans frais jusqu'à 48h" },
        ]}
      />,
    );
    expect(screen.getByText("Disponibilité")).toBeInTheDocument();
    expect(screen.getByText("Tous les week-ends")).toBeInTheDocument();
    expect(screen.getByText("Annulation")).toBeInTheDocument();
  });
});

describe("Button", () => {
  it("rend un bouton par défaut", () => {
    render(<Button>Réserver</Button>);
    expect(screen.getByRole("button", { name: "Réserver" })).toBeInTheDocument();
  });
  it("rend un lien avec asChild", () => {
    render(
      <Button asChild>
        <a href="/reservation">Réserver ici</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Réserver ici" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/reservation");
  });
});

describe("Reveal", () => {
  it("rend ses enfants (reduced-motion)", () => {
    render(
      <Reveal>
        <span>Contenu révélé</span>
      </Reveal>,
    );
    expect(screen.getByText("Contenu révélé")).toBeInTheDocument();
  });
});
