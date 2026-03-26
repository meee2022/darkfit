import { useState, useEffect, useCallback } from "react";
import { Activity, Heart, Footprints, Moon, Flame, AlertCircle, Check, Link2, Unlink } from "lucide-react";

// Types for health data
export interface HealthDataPoint {
  value: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  source: "apple_health" | "google_fit" | "manual";
}

export interface DailyHealthSummary {
  date: Date;
  steps: number;
  activeCalories: number;
  restingCalories: number;
  heartRate: {
    min: number;
    max: number;
    average: number;
  } | null;
  sleepHours: number | null;
  workouts: Array<{
    type: string;
    duration: number; // minutes
    calories: number;
  }>;
}

export interface HealthPermissions {
  steps: boolean;
  heartRate: boolean;
  activeEnergy: boolean;
  sleep: boolean;
  workouts: boolean;
}

// Platform detection
export function detectPlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Capacitor native platforms
  if ((window as any).Capacitor?.isNativePlatform()) {
    if ((window as any).Capacitor.getPlatform() === "ios") return "ios";
    if ((window as any).Capacitor.getPlatform() === "android") return "android";
  }
  
  // Fallback to user agent
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  
  return "web";
}

// Check if health integration is available
export function isHealthIntegrationAvailable(): boolean {
  const platform = detectPlatform();
  
  // For native apps, check for Capacitor Health plugin
  if (platform !== "web") {
    return !!(window as any).Capacitor?.Plugins?.Health;
  }
  
  return false;
}

// Health Integration Service (Capacitor-based)
class HealthService {
  private platform: "ios" | "android" | "web";
  private isAvailable: boolean;

  constructor() {
    this.platform = detectPlatform();
    this.isAvailable = isHealthIntegrationAvailable();
  }

  async requestPermissions(types: (keyof HealthPermissions)[]): Promise<HealthPermissions> {
    if (!this.isAvailable) {
      console.warn("Health integration not available");
      return {
        steps: false,
        heartRate: false,
        activeEnergy: false,
        sleep: false,
        workouts: false,
      };
    }

    try {
      const HealthPlugin = (window as any).Capacitor.Plugins.Health;
      
      // Map our types to platform-specific types
      const dataTypes = types.map(type => {
        switch (type) {
          case "steps": return "steps";
          case "heartRate": return "heart_rate";
          case "activeEnergy": return "active_energy";
          case "sleep": return "sleep";
          case "workouts": return "workout";
          default: return type;
        }
      });

      const result = await HealthPlugin.requestAuthorization({ dataTypes });
      
      return {
        steps: result.steps || false,
        heartRate: result.heart_rate || false,
        activeEnergy: result.active_energy || false,
        sleep: result.sleep || false,
        workouts: result.workout || false,
      };
    } catch (error) {
      console.error("Failed to request health permissions:", error);
      return {
        steps: false,
        heartRate: false,
        activeEnergy: false,
        sleep: false,
        workouts: false,
      };
    }
  }

  async getSteps(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isAvailable) return 0;

    try {
      const HealthPlugin = (window as any).Capacitor.Plugins.Health;
      const result = await HealthPlugin.queryAggregated({
        dataType: "steps",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return result.value || 0;
    } catch (error) {
      console.error("Failed to get steps:", error);
      return 0;
    }
  }

  async getActiveCalories(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isAvailable) return 0;

    try {
      const HealthPlugin = (window as any).Capacitor.Plugins.Health;
      const result = await HealthPlugin.queryAggregated({
        dataType: "active_energy",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return Math.round(result.value || 0);
    } catch (error) {
      console.error("Failed to get active calories:", error);
      return 0;
    }
  }

  async getHeartRate(startDate: Date, endDate: Date): Promise<{ min: number; max: number; average: number } | null> {
    if (!this.isAvailable) return null;

    try {
      const HealthPlugin = (window as any).Capacitor.Plugins.Health;
      const result = await HealthPlugin.query({
        dataType: "heart_rate",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (!result.data || result.data.length === 0) return null;

      const values = result.data.map((d: any) => d.value);
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        average: Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length),
      };
    } catch (error) {
      console.error("Failed to get heart rate:", error);
      return null;
    }
  }

  async getSleepHours(startDate: Date, endDate: Date): Promise<number | null> {
    if (!this.isAvailable) return null;

    try {
      const HealthPlugin = (window as any).Capacitor.Plugins.Health;
      const result = await HealthPlugin.queryAggregated({
        dataType: "sleep",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return result.value ? Math.round(result.value / 60 * 10) / 10 : null; // Convert minutes to hours
    } catch (error) {
      console.error("Failed to get sleep data:", error);
      return null;
    }
  }

  async getDailySummary(date: Date): Promise<DailyHealthSummary> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const [steps, activeCalories, heartRate, sleepHours] = await Promise.all([
      this.getSteps(startDate, endDate),
      this.getActiveCalories(startDate, endDate),
      this.getHeartRate(startDate, endDate),
      this.getSleepHours(startDate, endDate),
    ]);

    return {
      date,
      steps,
      activeCalories,
      restingCalories: 0, // Would need additional calculation
      heartRate,
      sleepHours,
      workouts: [], // Would need to query workouts separately
    };
  }

  getPlatformName(): string {
    switch (this.platform) {
      case "ios": return "Apple Health";
      case "android": return "Google Fit";
      default: return "Health App";
    }
  }

  getPlatformIcon(): string {
    switch (this.platform) {
      case "ios": return "🍎";
      case "android": return "💚";
      default: return "❤️";
    }
  }
}

// Singleton instance
export const healthService = new HealthService();

// React Hook for Health Data
export function useHealthData() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [permissions, setPermissions] = useState<HealthPermissions>({
    steps: false,
    heartRate: false,
    activeEnergy: false,
    sleep: false,
    workouts: false,
  });
  const [todaySummary, setTodaySummary] = useState<DailyHealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAvailable(isHealthIntegrationAvailable());
    setIsLoading(false);
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const perms = await healthService.requestPermissions([
        "steps",
        "heartRate",
        "activeEnergy",
        "sleep",
        "workouts",
      ]);
      
      setPermissions(perms);
      setIsConnected(Object.values(perms).some(v => v));
      
      if (Object.values(perms).some(v => v)) {
        const summary = await healthService.getDailySummary(new Date());
        setTodaySummary(summary);
      }
    } catch (err) {
      setError("فشل الاتصال بتطبيق الصحة");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setPermissions({
      steps: false,
      heartRate: false,
      activeEnergy: false,
      sleep: false,
      workouts: false,
    });
    setTodaySummary(null);
  }, []);

  const refreshData = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const summary = await healthService.getDailySummary(new Date());
      setTodaySummary(summary);
    } catch (err) {
      setError("فشل تحديث البيانات");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  return {
    isAvailable,
    isConnected,
    permissions,
    todaySummary,
    isLoading,
    error,
    connect,
    disconnect,
    refreshData,
    platformName: healthService.getPlatformName(),
    platformIcon: healthService.getPlatformIcon(),
  };
}

// Health Connection Card Component
export function HealthConnectionCard({ className = "" }: { className?: string }) {
  const {
    isAvailable,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    platformName,
    platformIcon,
  } = useHealthData();

  const platform = detectPlatform();

  if (platform === "web") {
    return (
      <div className={`p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
            <Activity className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">تكامل تطبيقات الصحة</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              متاح فقط في تطبيق الموبايل
            </p>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-300/80">
              حمّل التطبيق على iOS أو Android للاتصال بـ Apple Health أو Google Fit
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isConnected ? "bg-[#59f20d]/20" : "bg-zinc-700"
          }`}>
            <span className="text-2xl">{platformIcon}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{platformName}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isConnected ? (
                <span className="flex items-center gap-1 text-[#59f20d]">
                  <Check className="w-3 h-3" />
                  متصل
                </span>
              ) : (
                "غير متصل"
              )}
            </p>
          </div>
        </div>

        <button
          onClick={isConnected ? disconnect : connect}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            isConnected
              ? "bg-zinc-700 text-white hover:bg-zinc-600"
              : "bg-[#59f20d] text-black hover:brightness-110"
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isConnected ? (
            <>
              <Unlink className="w-4 h-4" />
              <span>قطع الاتصال</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              <span>اتصال</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

// Health Stats Widget
export function HealthStatsWidget({ className = "" }: { className?: string }) {
  const { isConnected, todaySummary, isLoading, refreshData } = useHealthData();

  if (!isConnected || !todaySummary) {
    return null;
  }

  const stats = [
    {
      icon: <Footprints className="w-5 h-5" />,
      label: "الخطوات",
      value: todaySummary.steps.toLocaleString(),
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: "سعرات نشطة",
      value: `${todaySummary.activeCalories}`,
      unit: "kcal",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    ...(todaySummary.heartRate ? [{
      icon: <Heart className="w-5 h-5" />,
      label: "نبض القلب",
      value: `${todaySummary.heartRate.average}`,
      unit: "bpm",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    }] : []),
    ...(todaySummary.sleepHours ? [{
      icon: <Moon className="w-5 h-5" />,
      label: "النوم",
      value: `${todaySummary.sleepHours}`,
      unit: "ساعة",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    }] : []),
  ];

  return (
    <div className={`p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#59f20d]" />
          بيانات الصحة اليوم
        </h3>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          {isLoading ? "جارِ التحديث..." : "تحديث"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50"
          >
            <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-white">{stat.value}</span>
                {stat.unit && <span className="text-xs text-zinc-500">{stat.unit}</span>}
              </div>
              <p className="text-xs text-zinc-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
