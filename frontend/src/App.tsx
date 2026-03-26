import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

import { Dashboard } from "./components/Dashboard";
import { ExerciseSection } from "./components/ExerciseSection";
import NutritionSection from "./components/NutritionSection";
import { CalorieCalculator } from "./components/CalorieCalculator";
import { AdminPanel } from "./components/AdminPanel";
import { ProfileSetup } from "./components/ProfileSetup";
import { Coaches } from "./components/Coaches";
import { Supplements } from "./components/Supplements";
import { HealthSection } from "./components/HealthSection";
import { AccountSettings } from "./components/AccountSettings";
import { ProfileSection } from "./components/ProfileSection";
import { WorkoutGenerator } from "./components/WorkoutGenerator";
import { AboutSection } from "./components/AboutSection";
import { ProgressTracker } from "./components/ProgressTracker";
import { SmartCoachSection } from "./components/SmartCoachSection";
import { SocialHub } from "./components/SocialHub";
import { WorkoutHistory } from "./components/WorkoutHistory";
import { CoachChat } from "./components/CoachChat";

import { CoachWorkoutPlanForm } from "./components/CoachWorkoutPlanForm";
import { CoachDashboard } from "./components/CoachDashboard";
import { MyPlans } from "./components/MyPlans";
import { MyNutritionPlan } from "./components/MyNutritionPlan";

import { useLanguage } from "./lib/i18n";
import { ResetCardStandalone } from "./ResetCardStandalone";
import { SignInForm } from "./SignInForm";

import type { SectionId } from "./sections";
import { Header } from "./layout/Header";
import { TopNav } from "./layout/TopNav";
import { MobileBottomNav } from "./layout/MobileBottomNav";
import splashLogo from "./assets/splash.jpg";
import FitBot from "./components/FitBot";
import { NotificationManager } from "./components/NotificationManager";
import { WorkoutTimer } from "./components/WorkoutTimer";
import { PWAManager } from "./components/PWAManager";
import { Onboarding } from "./components/Onboarding";

/* ============ Splash Screen ============ */

function SplashScreen() {
  const { language } = useLanguage();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden pt-6">
      {/* هالة نيون خضراء أهدى */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18),transparent_60%)]"
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* كرت الشعار مع حركة دخول احترافية */}
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.2
          }}
          className="relative group"
        >
          {/* نبض إضافي خلف اللوجو */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-3xl bg-[#59f20d]/20 blur-xl"
          />

          <div className="w-52 h-52 max-w-[70vw] max-h-[70vw] rounded-3xl bg-black shadow-[0_0_50px_rgba(89,242,13,0.4)] border border-[#59f20d]/50 relative z-10 overflow-hidden p-1">
            <div className="w-full h-full rounded-[1.3rem] overflow-hidden border border-black/60">
              <img
                src={splashLogo}
                alt="DarkFit logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* نص تحت الشعار بحركة ظهور تدريجية */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <h2 className="text-2xl font-black tracking-widest text-[#59f20d] uppercase italic">
            DARKFIT
          </h2>
          <p className="text-xs font-medium tracking-[0.3em] text-zinc-400 uppercase">
            {language === "ar" ? "لياقة • تغذية • صحة" : "Fitness • Nutrition • Health"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ============ App ============ */

export default function App() {
  const { t, language, dir } = useLanguage();

  // حالة إظهار / إخفاء شاشة الـ Splash
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [dir, language]);

  // إخفاء الـ Splash بعد 2 ثانية (تقدر تزود/تقلل المدة)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const tr = (key: string, fallback: string) => {
    try {
      const v = typeof t === "function" ? (t as any)(key) : "";
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const isAdmin = useQuery(api.profiles.checkAdminStatus);
  const isCoach = useQuery(api.profiles.checkCoachStatus);

  const isProfileLoading = isAuthenticated && userProfile === undefined;
  const needsProfile = isAuthenticated && userProfile === null;

  useEffect(() => {
    if (isAuthenticated && userProfile && userProfile.onboardingCompleted === undefined) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, userProfile]);

  const publicSections: SectionId[] = ["dashboard", "exercises", "coaches", "calculator", "workoutGenerator", "about"];
  const isProtectedSection = !publicSections.includes(activeSection);

  // لو الـ Splash لسه ظاهر، رجّعه لوحده
  if (showSplash) {
    return <SplashScreen />;
  }

  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const isReset = path === "/reset" || path === "/reset/";

  if (isReset && !isAuthenticated) {
    return <UnauthGate subtitle={tr("sign_in_sub", "رحلتك نحو اللياقة تبدأ هنا")} />;
  }

  return (
    <div className="relative min-h-screen bg-[#0c0c0c] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <Toaster position="top-center" richColors />
      <div className="bg-app-gradient fixed inset-0 -z-10 opacity-80" />

      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isAdmin={!!isAdmin}
        onSignInClick={() => setShowSignInModal(true)}
      />

      <main className="flex-1">
        {(authLoading || isProfileLoading) ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-herb-300 border-t-neon-400 animate-spin" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {tr("loading", "جارِ التحميل...")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <PWAManager />
            {isAuthenticated && <NotificationManager />}
            {isAuthenticated && <WorkoutTimer />}
            <TopNav
              activeSection={activeSection}
              setActiveSection={(id) => {
                setShowSignInModal(false);
                setActiveSection(id);
              }}
              isAdmin={!!isAdmin}
              isCoach={!!isCoach}
            />

            {/* Modal تسجيل الدخول */}
            {showSignInModal && !isAuthenticated && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowSignInModal(false)}
              >
                <div
                  className="w-full max-w-md bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.6)] border border-zinc-200 dark:border-zinc-800/50 overflow-hidden relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowSignInModal(false)}
                    className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 text-lg"
                  >×</button>
                  <div className="px-6 pt-10 pb-4 text-center">
                    <h1 className="text-3xl font-black tracking-tighter text-[#59f20d] mb-1 uppercase italic">DARKFIT</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{language === "ar" ? "رحلتك نحو اللياقة تبدأ هنا" : "Your fitness journey starts here"}</p>
                  </div>
                  <div className="px-6 pb-10">
                    <SignInForm />
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
              {/* بانر ترحيبي للزوار غير المسجلين */}
              {!isAuthenticated && !showSignInModal && (
                <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/30 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-[#59f20d] truncate">
                    {language === "ar"
                      ? "يرجى تسجيل الدخول لرؤية جميع محتوى التطبيق 💪"
                      : "Sign in to access all app features 💪"}
                  </p>
                  <button
                    onClick={() => setShowSignInModal(true)}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full bg-[#59f20d] text-zinc-950 font-black text-xs hover:brightness-95 transition whitespace-nowrap"
                  >
                    {tr("sign_in", "تسجيل دخول")}
                  </button>
                </div>
              )}
              <div className="bg-[#111] dark:bg-[#111] backdrop-blur rounded-[2rem] shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5 p-4 sm:p-6 md:p-8">
                {isProtectedSection && !isAuthenticated ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 dark:text-zinc-50">
                      {language === "ar" ? "يرجى تسجيل الدخول" : "Please Sign In"}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
                      {language === "ar"
                        ? "يجب تسجيل الدخول للوصول إلى هذه الميزة."
                        : "You must log in to access this feature."}
                    </p>
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-left">
                      <SignInForm />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Banner لو مافيش profile */}
                    {needsProfile && !showProfilePrompt && (
                      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">✨</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                              {tr("enjoy_browsing", "استمتع بالتصفح! 🎯")}
                            </h3>
                            <p className="text-xs text-emerald-700 dark:text-[#59f20d]">
                              {tr("complete_profile_desc", "لتسجيل تمارينك وحساب سعراتك، أكمل ملفك الشخصي")}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowProfilePrompt(true)}
                          className="px-4 py-2 rounded-full bg-[#59f20d] text-zinc-950 font-bold text-sm hover:brightness-95 transition whitespace-nowrap"
                        >
                          {tr("complete_profile", "إكمال الملف")}
                        </button>
                      </div>
                    )}

                    {showProfilePrompt ? (
                      <div>
                        <button
                          onClick={() => setShowProfilePrompt(false)}
                          className="mb-4 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-2"
                        >
                          <span>←</span>
                          {tr("back_to_browse", "العودة للتصفح")}
                        </button>
                        <ProfileSetup />
                      </div>
                    ) : (
                      <>
                        {activeSection === "dashboard" && (
                          <Dashboard onNavigate={(id) => setActiveSection(id)} />
                        )}

                        {activeSection === "exercises" && <ExerciseSection />}
                        {activeSection === "workoutGenerator" && <WorkoutGenerator />}
                        {activeSection === "about" && <AboutSection onNavigate={(id) => setActiveSection(id as SectionId)} />}
                        {activeSection === "progress" && <ProgressTracker />}
                        {activeSection === "smartCoach" && <SmartCoachSection />}
                        {activeSection === "nutrition" && <NutritionSection />}
                        {activeSection === "supplements" && <Supplements />}
                        {activeSection === "calculator" && <CalorieCalculator />}
                        {activeSection === "coaches" && <Coaches />}
                        {activeSection === "account" && <AccountSettings />}
                        {activeSection === "health" && <HealthSection />}
                        {activeSection === "fitbot" && <FitBot onBack={() => setActiveSection("dashboard")} />}
                        {activeSection === "profile" && <ProfileSection onNavigate={(id) => setActiveSection(id as SectionId)} />}

                        {activeSection === "plans" && <MyPlans />}
                         {activeSection === "social" && <SocialHub />}
                         {activeSection === "messages" && <CoachChat />}
                         {activeSection === "workoutHistory" && <WorkoutHistory />}

                        {activeSection === "coachPlans" && isAdmin && (
                          <CoachWorkoutPlanForm />
                        )}

                        {activeSection === "coachDashboard" && isCoach && (
                          <CoachDashboard />
                        )}

                        {activeSection === "coachDashboard" && !isCoach && (
                          <p className="mt-4 text-sm text-red-500">
                            {language === "ar"
                              ? "ليس لديك صلاحية الدخول إلى لوحة المدرب."
                              : "You don't have coach access."}
                          </p>
                        )}

                        {activeSection === "admin" && isAdmin && <AdminPanel />}

                        {activeSection === "admin" && !isAdmin && (
                          <p className="mt-4 text-sm text-red-500">
                            {tr("no_admin_permission", "لا تملك صلاحية الدخول إلى لوحة التحكم.")}
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <MobileBottomNav
              activeSection={activeSection}
              onChange={setActiveSection}
            />
          </>
        )}
      </main>
    </div>
  );
}

function UnauthGate({ subtitle }: { subtitle: string }) {
  const path =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const isReset = path === "/reset" || path === "/reset/";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(89,242,13,0.05),transparent_70%)]" />
      <div className="w-full max-w-md bg-white/95 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-zinc-200 dark:border-zinc-800/50 overflow-hidden relative">
        <div className="px-6 pt-10 pb-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-zinc-900 dark:text-[#59f20d] mb-3 uppercase italic drop-shadow-[0_0_15px_rgba(89,242,13,0.3)]">
            DARKFIT
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium tracking-wide">
            {subtitle}
          </p>
        </div>

        <div className="px-6 pb-10">
          {isReset ? <ResetCardStandalone /> : <SignInForm />}
        </div>
      </div>
    </div>
  );
}
