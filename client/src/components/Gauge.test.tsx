import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Gauge } from "./Gauge.js";

describe("Gauge", () => {
  it("renders labels and emits value changes", async () => {
    const onChange = vi.fn();
    render(<Gauge leftLabel="nul" rightLabel="excellent" value={500} interactive onChange={onChange} />);
    expect(screen.getByText("nul")).toBeInTheDocument();
    expect(screen.getByText("excellent")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Position sur la jauge"));
    expect(screen.getByLabelText("Position sur la jauge")).toBeEnabled();
  });

  it("hides input interaction when not interactive", () => {
    render(<Gauge leftLabel="court" rightLabel="long" value={100} />);
    expect(screen.queryByLabelText("Position sur la jauge")).not.toBeInTheDocument();
  });

  it("can hide the guess marker", () => {
    render(<Gauge leftLabel="court" rightLabel="long" value={100} showGuessMarker={false} />);
    expect(document.querySelector(".guess-marker")).not.toBeInTheDocument();
  });
});
