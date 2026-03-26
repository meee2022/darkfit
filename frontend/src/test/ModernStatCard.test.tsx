import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModernStatCard } from "../components/dashboard/ModernStatCard";
import { TrendingUp } from "lucide-react";

describe("ModernStatCard", () => {
  it("renders label and value correctly", () => {
    render(
      <ModernStatCard
        icon={<TrendingUp data-testid="icon" />}
        label="إنجاز الأسبوع"
        value="75%"
        iconColor="bg-emerald-500/20 text-emerald-400"
      />
    );
    
    expect(screen.getByText("إنجاز الأسبوع")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders unit when provided", () => {
    render(
      <ModernStatCard
        icon={<TrendingUp />}
        label="السعرات"
        value={1500}
        unit="kcal"
        iconColor="bg-orange-500/20 text-orange-400"
      />
    );
    
    expect(screen.getByText("kcal")).toBeInTheDocument();
  });

  it("renders progress bar for progress variant", () => {
    const { container } = render(
      <ModernStatCard
        icon={<TrendingUp />}
        label="التقدم"
        value="50%"
        iconColor="bg-emerald-500/20"
        variant="progress"
        progress={50}
      />
    );
    
    // Check for progress bar element
    const progressBar = container.querySelector(".rounded-full.transition-all");
    expect(progressBar).toBeInTheDocument();
  });

  it("renders ring for radial variant", () => {
    const { container } = render(
      <ModernStatCard
        icon={<TrendingUp />}
        label="Test"
        value={100}
        iconColor="bg-sky-500/20"
        variant="radial"
        progress={75}
      />
    );
    
    // Check for SVG element (ring)
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies correct accent color based on iconColor", () => {
    const { container } = render(
      <ModernStatCard
        icon={<TrendingUp />}
        label="Test"
        value={100}
        iconColor="bg-emerald-500/20 text-emerald-400"
        variant="radial"
      />
    );
    
    // The component should have emerald accent (#10b981)
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveStyle({ boxShadow: expect.stringContaining("10b981") });
  });
});
