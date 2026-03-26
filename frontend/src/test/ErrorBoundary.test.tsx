import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary, SectionErrorBoundary } from "../components/ErrorBoundary";

// Component that throws error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("Test error");
  return <div>Content loaded</div>;
};

describe("ErrorBoundary", () => {
  // Suppress console.error for cleaner test output
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders error UI when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("حدث خطأ غير متوقع")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalled();
  });

  it("resets error state on retry button click", async () => {
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) throw new Error("Test error");
      return <div>Content loaded</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText("حدث خطأ غير متوقع")).toBeInTheDocument();
    
    // Change the state before retry
    shouldThrow = false;
    
    // Click retry
    fireEvent.click(screen.getByText("إعادة المحاولة"));
    
    // The error boundary should try to re-render children
    // Since shouldThrow is now false, it should succeed
    expect(screen.queryByText("حدث خطأ غير متوقع")).not.toBeInTheDocument();
  });
});

describe("SectionErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows section-specific error message", () => {
    render(
      <SectionErrorBoundary sectionName="التمارين">
        <ThrowError shouldThrow={true} />
      </SectionErrorBoundary>
    );
    expect(screen.getByText("تعذر تحميل قسم التمارين")).toBeInTheDocument();
  });
});
