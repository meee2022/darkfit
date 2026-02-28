import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeCtx = {
  theme: ThemeMode;              // اختيار المستخدم (light / dark / system)
  resolvedTheme: "light" | "dark"; // الثيم الفعلي المطبق
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = "app_theme_mode";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeToDom(theme: "light" | "dark") {
  const root = document.documentElement;

  // data-theme لو حابب تستخدمها في CSS
  root.setAttribute("data-theme", theme);

  // Tailwind dark: يحتاج .dark
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);

  // لمساعدة المتصفح في اختيار ألوان الـ form controls
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem(STORAGE_KEY) as
      | ThemeMode
      | null;
    return saved || "dark"; // افتراضي: dark
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    const sys = getSystemTheme();
    return theme === "system" ? sys : (theme as "light" | "dark");
  });

  // كلما تغيّر theme نحسب resolvedTheme ونطبقه على الـ DOM
  useEffect(() => {
    const sys = getSystemTheme();
    const resolved = theme === "system" ? sys : (theme as "light" | "dark");
    setResolvedTheme(resolved);
    applyThemeToDom(resolved);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  // لو المستخدم اختار "system" وتغير system theme
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      if (theme === "system") {
        const sys = getSystemTheme();
        setResolvedTheme(sys);
        applyThemeToDom(sys);
      }
    };

    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [theme]);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
      toggle: () =>
        setThemeState((p) =>
          p === "dark" ? "light" : p === "light" ? "dark" : "dark"
        ),
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** زر جاهز تحطه في صفحة الحساب/الإعدادات */
export function ThemeToggleButton({ className = "" }: { className?: string }) {
  const { theme, resolvedTheme, setTheme, toggle } = useTheme();

  return (
    <div
      className={`flex items-center justify-between gap-3 ${className}`}
      dir="rtl"
    >
      <div>
        <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
          المظهر
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          الحالي: <b dir="ltr">{resolvedTheme}</b> • الوضع:{" "}
          <b dir="ltr">{theme}</b>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          className="border border-herb-200 dark:border-[#59f20d]/40 rounded-full px-3 py-1.5 text-xs bg-white dark:bg-[#1a2318] text-zinc-800 dark:text-zinc-100 shadow-soft"
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeMode)}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>

        <button
          type="button"
          className="rounded-full px-3 py-1.5 text-xs font-medium bg-herb-500 text-white hover:bg-herb-600 transition-colors"
          onClick={toggle}
        >
          تبديل
        </button>
      </div>
    </div>
  );
}
