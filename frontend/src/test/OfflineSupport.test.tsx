import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnlineStatus } from "../components/OfflineSupport";

describe("useOnlineStatus", () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    // Reset navigator.onLine
    Object.defineProperty(window, "navigator", {
      value: { onLine: true },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      writable: true,
    });
  });

  it("returns true when online", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("returns false when offline", () => {
    Object.defineProperty(window, "navigator", {
      value: { onLine: false },
      writable: true,
    });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it("updates when online event fires", () => {
    Object.defineProperty(window, "navigator", {
      value: { onLine: false },
      writable: true,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current).toBe(true);
  });

  it("updates when offline event fires", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current).toBe(false);
  });
});
