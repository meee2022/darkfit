import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeCtx = {
  theme: ThemeMode;              // اختيار المستخدم (light / dark / system)
  resolvedTheme: "light" | "dark"; // الثيم الفعلي المطبق
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
  isDark: boolean;
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
      isDark: resolvedTheme === "dark",
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

/** Compact Theme Toggle for Header/Navbar */
export function ThemeToggleCompact({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
        resolvedTheme === "dark"
          ? "bg-zinc-800 hover:bg-zinc-700 text-yellow-400"
          : "bg-amber-100 hover:bg-amber-200 text-amber-600"
      } ${className}`}
      aria-label={resolvedTheme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}

/** Modern Theme Switcher with 3 options */
export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun className="w-4 h-4" />, label: "فاتح" },
    { value: "dark", icon: <Moon className="w-4 h-4" />, label: "داكن" },
    { value: "system", icon: <Monitor className="w-4 h-4" />, label: "تلقائي" },
  ];

  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            theme === opt.value
              ? "bg-white dark:bg-zinc-700 text-[#59f20d] shadow-sm"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
