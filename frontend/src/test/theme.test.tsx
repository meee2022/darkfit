import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme, ThemeToggleCompact, ThemeSwitcher } from "../lib/theme";

// Test component to access theme context
const TestThemeConsumer = () => {
  const { theme, resolvedTheme, isDark, toggle, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <span data-testid="isDark">{isDark ? "yes" : "no"}</span>
      <button data-testid="toggle" onClick={toggle}>Toggle</button>
      <button data-testid="setLight" onClick={() => setTheme("light")}>Light</button>
      <button data-testid="setDark" onClick={() => setTheme("dark")}>Dark</button>
    </div>
  );
};

describe("ThemeProvider", () => {
  beforeEach(() => {
    // Clear localStorage and DOM before each test
    localStorage.clear();
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.removeAttribute("data-theme");
  });

  it("provides default dark theme", () => {
    render(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(screen.getByTestId("isDark").textContent).toBe("yes");
  });

  it("toggles theme on toggle()", () => {
    render(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    );
    
    // Initially dark
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    
    // Toggle to light
    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    
    // Toggle back to dark
    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("setTheme() changes theme correctly", () => {
    render(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByTestId("setLight"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(screen.getByTestId("isDark").textContent).toBe("no");
    
    fireEvent.click(screen.getByTestId("setDark"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("isDark").textContent).toBe("yes");
  });

  it("throws error when useTheme used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    
    expect(() => {
      render(<TestThemeConsumer />);
    }).toThrow("useTheme must be used within ThemeProvider");
    
    consoleError.mockRestore();
  });
});

describe("ThemeToggleCompact", () => {
  it("renders sun icon in dark mode", () => {
    render(
      <ThemeProvider>
        <ThemeToggleCompact />
      </ThemeProvider>
    );
    
    // In dark mode, should show sun icon (to switch to light)
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "تفعيل الوضع الفاتح");
  });
});

describe("ThemeSwitcher", () => {
  it("renders all three theme options", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );
    
    expect(screen.getByText("فاتح")).toBeInTheDocument();
    expect(screen.getByText("داكن")).toBeInTheDocument();
    expect(screen.getByText("تلقائي")).toBeInTheDocument();
  });

  it("switches theme when option clicked", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
        <TestThemeConsumer />
      </ThemeProvider>
    );
    
    // Click light option
    fireEvent.click(screen.getByText("فاتح"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    
    // Click dark option
    fireEvent.click(screen.getByText("داكن"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });
});
