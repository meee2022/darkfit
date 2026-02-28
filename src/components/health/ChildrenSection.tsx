import React, { useState } from "react";
import { ArrowLeft, Smile, TrendingUp, Utensils, Activity, Lightbulb, Plus } from "lucide-react";
import { useLanguage } from "../../lib/i18n";

export function ChildrenSection() {
  const { dir, language } = useLanguage();
  const isAr = language === "ar";

  const childName = isAr ? "ليو" : "Leo";
  const childAge = 6;
  const childTitle = isAr ? "كشاف متميز" : "Super Scout";

  const healthScore = 85;
  const scoreChange = 5;

  const activities = [
    { name: isAr ? "ركوب الدراجة" : "Biking", duration: 25, icon: "🚴" },
    { name: isAr ? "تمرين كرة القدم" : "Soccer Practice", duration: 20, icon: "⚽" },
  ];

  const totalActivity = activities.reduce((sum, act) => sum + act.duration, 0);
  const activityGoal = 60;

  const mealSuggestion = {
    title: isAr ? "سلطة قوس قزح" : "Rainbow Power Bowl",
    type: isAr ? "اقتراح غداء" : "LUNCH SUGGESTION",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    nutrients: [
      { label: isAr ? "بروتين" : "PROTEIN", value: "High", color: "bg-[#59f20d]" },
      { label: isAr ? "خضروات" : "VEGGIES", value: "High", color: "bg-green-400" },
      { label: isAr ? "كربوهيدرات" : "CARBS", value: "Med", color: "bg-yellow-400" },
    ],
  };

  const growthData = [
    { month: "JAN", height: 110 },
    { month: "FEB", height: 112 },
    { month: "MAR", height: 114 },
    { month: "APR", height: 116 },
    { month: "MAY", height: 117 },
    { month: "JUN", height: 118 },
    { month: "JUL", height: 120 },
  ];

  const maxHeight = Math.max(...growthData.map((d) => d.height));

  const parentalTips = [
    {
      title: isAr ? "خدعة وقت الشاشة" : "Screen-Time Hack",
      description: isAr
        ? "استبدل 15 دقيقة من وقت الشاشة بـ 30 دقيقة من اللعب الخارجي."
        : "Trade 15 min of screen time for 30 min of outdoor play.",
      icon: "🚫",
      color: "border-blue-500/30",
    },
    {
      title: isAr ? "بطل الترطيب" : "Hydration Hero",
      description: isAr
        ? "أضف فواكه مجمدة للماء لإنشاء 'مشروب متألق'."
        : "Add frozen fruit to water for a 'sparkle drink' effect.",
      icon: "💧",
      color: "border-[#59f20d]/30",
    },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-b from-[#0f1e0f] via-[#0d1a0c] to-black text-white px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.dispatchEvent(new Event("health-back"))}
          className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full border-3 border-[#59f20d] p-0.5">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-2xl">
              👶
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black">{isAr ? `رحلة ${childName}` : `${childName}'s Journey`}</h2>
            <p className="text-xs text-gray-400">
              {isAr ? `العمر ${childAge}` : `Age ${childAge}`} • {childTitle}
            </p>
          </div>
        </div>

        <button className="w-12 h-12 rounded-full bg-[#59f20d] flex items-center justify-center shadow-lg shadow-[#59f20d]/30">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-900/50 via-green-950/30 to-black/60 border-2 border-[#59f20d]/30 p-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#59f20d]/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <span className="text-xs font-bold text-[#59f20d] uppercase tracking-wider">{isAr ? "درجة الصحة اليومية" : "DAILY HEALTH SCORE"}</span>
          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white">{healthScore}</span>
                <span className="flex items-center gap-1 text-sm font-bold text-[#59f20d]">
                  <TrendingUp className="w-4 h-4" />+{scoreChange}%
                </span>
              </div>
              <p className="text-sm text-gray-400 italic mt-1">"{isAr ? `${childName} يحقق أهدافه اليوم!` : `${childName} is crushing his goals today!`}"</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#1a2e15" strokeWidth="8" fill="none" />
                <circle cx="48" cy="48" r="40" stroke="#59f20d" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * 0.25}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[#59f20d]">75%</span>
                <span className="text-xs text-gray-500">⚡</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#59f20d]" />
            <h3 className="text-xl font-black">{isAr ? "وقت اللعب النشط" : "Active Playtime"}</h3>
          </div>
          <span className="text-sm font-bold text-[#59f20d]">{totalActivity} / {activityGoal} {isAr ? "دقيقة" : "min"}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {activities.map((activity, index) => (
            <div key={index} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/70 to-black/50 border-2 border-[#59f20d]/20 p-5">
              <div className="text-4xl mb-3">{activity.icon}</div>
              <p className="text-sm font-bold text-white mb-1">{activity.name}</p>
              <p className="text-2xl font-black text-[#59f20d]">{activity.duration} {isAr ? "دقيقة" : "min"}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#59f20d]" />
            <h3 className="text-xl font-black">{isAr ? "وجبات صحية" : "Healthy Bites"}</h3>
          </div>
          <button className="text-xs font-bold text-[#59f20d]">{isAr ? "عرض الكل" : "View All"}</button>
        </div>
        <div className="relative h-56 rounded-3xl overflow-hidden group">
          <img src={mealSuggestion.image} alt={mealSuggestion.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#59f20d] text-black text-xs font-black">{mealSuggestion.type}</div>
          <div className="absolute bottom-4 left-4 right-4">
            <h4 className="text-2xl font-black text-white mb-3">{mealSuggestion.title}</h4>
            <div className="flex gap-2">
              {mealSuggestion.nutrients.map((nutrient, index) => (
                <div key={index} className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-bold flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${nutrient.color}`} />
                  <span className="text-white">{nutrient.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-zinc-900/70 to-black/50 border-2 border-[#59f20d]/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#59f20d]/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#59f20d]" />
          </div>
          <div>
            <h3 className="text-lg font-black">{isAr ? "مؤشرات النمو" : "Growth Trends"}</h3>
            <p className="text-xs text-gray-500">{isAr ? "الطول: 118 سم (+2 سم هذا الشهر)" : "Height: 118cm (+2cm this month)"}</p>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {growthData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col justify-end items-center">
              <div className={`w-full rounded-t-2xl ${index === growthData.length - 1 ? "bg-[#59f20d]" : "bg-gradient-to-t from-[#59f20d]/40 to-[#59f20d]/20"}`} style={{ height: `${(data.height / maxHeight) * 100}%` }} />
              <span className="text-[10px] text-gray-500 mt-1 uppercase">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-[#59f20d]" />
          <h3 className="text-xl font-black">{isAr ? "نصائح للآباء" : "Parental Tips"}</h3>
        </div>
        <div className="space-y-3">
          {parentalTips.map((tip, index) => (
            <div key={index} className={`relative overflow-hidden rounded-3xl bg-zinc-900/60 border-2 ${tip.color} p-5 group hover:border-[#59f20d]/60 transition-colors`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{tip.icon}</div>
                <div className="flex-1">
                  <h4 className="text-base font-black text-white mb-1">{tip.title}</h4>
                  <p className="text-sm text-gray-300">{tip.description}</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#59f20d]/20 flex items-center justify-center group-hover:bg-[#59f20d] transition-colors">
                  <svg className="w-4 h-4 text-[#59f20d] group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button className="relative group">
          <div className="absolute inset-0 bg-[#59f20d] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative w-16 h-16 rounded-full bg-[#59f20d] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-black" />
          </div>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}
