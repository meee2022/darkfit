import React from "react";
import { Droplet, Heart, Activity, TrendingUp, User, Baby } from "lucide-react";
import { useLanguage } from "../../lib/i18n";
import { useNavigate } from "react-router-dom";
import { SleepTracker, HeartRateTracker } from "./SleepHeartRate";

export function HealthDashboard() {
  const { dir, language } = useLanguage();
  const isAr = language === "ar";
  const navigate = useNavigate();

  const healthCategories = [
    {
      id: "diabetes",
      title: isAr ? "مرضى السكري" : "Diabetes Care",
      description: isAr
        ? "إدارة مستوى السكر في الدم والتغذية المناسبة"
        : "Manage blood sugar levels and proper nutrition",
      icon: Droplet,
      color: "from-[#59f20d]/20 to-[#59f20d]/5",
      borderColor: "border-[#59f20d]/30",
      iconBg: "bg-[#59f20d]/20",
      iconColor: "text-[#59f20d]",
      route: "diabetes",
    },
    {
      id: "seniors",
      title: isAr ? "كبار السن" : "Elderly Care",
      description: isAr
        ? "رعاية صحية متخصصة لكبار السن"
        : "Specialized health care for seniors",
      icon: User,
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      route: "seniors",
    },
    {
      id: "children",
      title: isAr ? "الأطفال" : "Children Care",
      description: isAr
        ? "نمو صحي وتغذية متوازنة للأطفال"
        : "Healthy growth and balanced nutrition for children",
      icon: Baby,
      color: "from-pink-500/20 to-pink-500/5",
      borderColor: "border-pink-500/30",
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-400",
      route: "children",
    },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-black text-white px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center hover:border-zinc-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-black bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            {isAr ? "قسم الصحة" : "Health Dashboard"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isAr ? "اختر الفئة المناسبة" : "Choose your category"}
          </p>
        </div>

        <div className="w-14 h-14 rounded-full border-3 border-[#59f20d] p-0.5 group-hover:scale-110 transition-transform">
          <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden relative">
            <svg className="w-full h-full text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#59f20d] border-2 border-black animate-pulse" />
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2318]/80 to-[#0f1410]/60 backdrop-blur-xl border-2 border-[#2a3528] p-6 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-[#59f20d] rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 bg-[#59f20d] rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "5s", animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#59f20d]/20 to-[#59f20d]/5 border-2 border-[#59f20d]/40 flex items-center justify-center">
              <Heart className="w-7 h-7 text-[#59f20d]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {isAr ? "مرحباً بك في قسم الصحة" : "Welcome to Health Dashboard"}
              </h2>
              <p className="text-sm text-gray-400">
                {isAr
                  ? "اختر فئتك الصحية للحصول على خطة مخصصة"
                  : "Choose your health category for a personalized plan"}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="text-center p-3 rounded-2xl bg-black/40 border border-[#59f20d]/20">
              <div className="text-2xl font-black text-[#59f20d]">3</div>
              <div className="text-xs text-gray-400 mt-1">
                {isAr ? "فئات متاحة" : "Categories"}
              </div>
            </div>
            <div className="text-center p-3 rounded-2xl bg-black/40 border border-[#59f20d]/20">
              <div className="text-2xl font-black text-[#59f20d]">24/7</div>
              <div className="text-xs text-gray-400 mt-1">
                {isAr ? "متابعة" : "Monitoring"}
              </div>
            </div>
            <div className="text-center p-3 rounded-2xl bg-black/40 border border-[#59f20d]/20">
              <div className="text-2xl font-black text-[#59f20d]">100%</div>
              <div className="text-xs text-gray-400 mt-1">
                {isAr ? "آمن" : "Safe"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SleepTracker />
        <HeartRateTracker />
      </div>

      {/* Health Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black">{isAr ? "اختر الفئة المناسبة" : "Choose Your Category"}</h3>
        </div>

        {healthCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => {
                // Update to use state-based navigation
                window.dispatchEvent(new CustomEvent('health-category-change', { detail: category.route }));
              }}
              className={`w-full group relative overflow-hidden rounded-3xl bg-gradient-to-br ${category.color} border-2 ${category.borderColor} p-6 text-right hover:scale-[1.02] transition-all duration-300 stagger-item shadow-xl hover:shadow-2xl`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-white mb-2">{category.title}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{category.description}</p>

                  <div className="flex items-center gap-2 mt-4 text-[#59f20d] group-hover:gap-4 transition-all">
                    <span className="text-sm font-bold">{isAr ? "اعرف المزيد" : "Learn More"}</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>

                <div
                  className={`w-20 h-20 rounded-3xl ${category.iconBg} border-2 ${category.borderColor} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                >
                  <Icon className={`w-10 h-10 ${category.iconColor}`} />
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </button>
          );
        })}
      </div>

      {/* Health Tips */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 border-2 border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-black">{isAr ? "نصائح صحية عامة" : "General Health Tips"}</h3>
        </div>

        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#59f20d]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-[#59f20d]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p>{isAr ? "اشرب 8 أكواب ماء يومياً على الأقل" : "Drink at least 8 glasses of water daily"}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#59f20d]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-[#59f20d]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p>{isAr ? "مارس الرياضة لمدة 30 دقيقة يومياً" : "Exercise for 30 minutes daily"}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#59f20d]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-[#59f20d]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p>{isAr ? "نم من 7-8 ساعات يومياً" : "Sleep 7-8 hours daily"}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#59f20d]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-[#59f20d]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p>{isAr ? "تناول وجبات متوازنة ومتنوعة" : "Eat balanced and varied meals"}</p>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
}
