import React, { useState } from "react";
import { ArrowLeft, Heart, Activity, Pill, UserPlus, Phone } from "lucide-react";
import { useLanguage } from "../../lib/i18n";

export function SeniorsSection() {
  const { dir, language } = useLanguage();
  const isAr = language === "ar";

  // Mock user data
  const userName = isAr ? "أحمد محمد" : "Ahmed Mohamed";

  // Vitals data
  const vitals = [
    {
      label: "BP",
      value: "120",
      unit: "/80",
      status: isAr ? "طبيعي" : "Normal",
      icon: "🩺",
      color: "border-[#59f20d]",
      statusColor: "text-[#59f20d]",
    },
    {
      label: isAr ? "معدل القلب" : "HEART RATE",
      value: "72",
      unit: "bpm",
      status: isAr ? "طبيعي" : "Normal",
      icon: "❤️",
      color: "border-[#59f20d]",
      statusColor: "text-[#59f20d]",
    },
    {
      label: isAr ? "الجلوكوز" : "GLUCOSE",
      value: "95",
      unit: "mg/dL",
      status: isAr ? "طبيعي" : "Normal",
      icon: "🩸",
      color: "border-[#59f20d]",
      statusColor: "text-[#59f20d]",
    },
    {
      label: "SPO2",
      value: "94",
      unit: "%",
      status: isAr ? "تحقق" : "Check",
      icon: "🫁",
      color: "border-orange-500",
      statusColor: "text-orange-500",
    },
  ];

  // Medications
  const medications = [
    {
      name: isAr ? "فيتامين د3" : "Vitamin D3",
      time: "10:00 AM",
      dose: isAr ? "1 كبسولة" : "1 Capsule",
      taken: true,
      icon: "💊",
    },
    {
      name: isAr ? "ليزينوبريل" : "Lisinopril",
      time: "02:30 PM",
      dose: isAr ? "10 ملج" : "10mg",
      taken: false,
      icon: "💊",
      type: isAr ? "قرص" : "Tablet",
    },
  ];

  // Care team
  const careTeam = [
    {
      name: isAr ? "د. سارة" : "Dr. Sarah",
      role: isAr ? "طبيبة عامة" : "General Doctor",
      image: "https://i.pravatar.cc/150?img=5",
      available: true,
    },
    {
      name: isAr ? "د. خالد" : "Dr. Khaled",
      role: isAr ? "أخصائي قلب" : "Cardiologist",
      image: "https://i.pravatar.cc/150?img=12",
      available: false,
    },
  ];

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-white px-4 py-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.dispatchEvent(new Event("health-back"))}
          className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full border-3 border-[#59f20d] p-0.5">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">{isAr ? "صباح الخير،" : "Good Morning,"}</p>
            <h2 className="text-lg font-black">{userName}</h2>
          </div>
        </div>

        <button className="w-12 h-12 rounded-full bg-[#59f20d] flex items-center justify-center shadow-lg shadow-[#59f20d]/30">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      {/* Daily Health Tip */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-900/40 via-green-950/30 to-black/60 border-2 border-[#59f20d]/30 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#59f20d]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#59f20d]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#59f20d]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#59f20d] uppercase tracking-wider">
              {isAr ? "نصيحة صحية يومية" : "DAILY HEALTH TIP"}
            </span>
          </div>

          <h3 className="text-2xl font-black text-white mb-2">
            {isAr ? "حافظ على رطوبة جسمك" : "Stay Hydrated"}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {isAr
              ? "حان وقت شرب كوب من الماء. شرب الماء بانتظام يساعد على الحفاظ على مستويات الطاقة والتركيز."
              : "It's time for a glass of water. Drinking water regularly helps maintain energy levels and focus."}
          </p>

          <button className="px-6 py-2.5 rounded-full bg-[#59f20d] text-black font-bold text-sm hover:bg-[#4ed10a] transition-colors">
            {isAr ? "تم" : "Dismiss"}
          </button>
        </div>
      </div>

      {/* Your Vitals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">{isAr ? "المؤشرات الحيوية" : "Your Vitals"}</h3>
          <span className="text-xs text-[#59f20d] font-bold">
            {isAr ? "محدث منذ 5 دقائق" : "Updated 5m ago"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {vitals.map((vital, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/80 to-black/60 border-2 ${vital.color} p-5`}
            >
              <div className="absolute top-2 right-2 text-2xl">{vital.icon}</div>

              <div className="mt-8">
                <p className="text-xs text-gray-400 mb-1">{vital.label}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-white">{vital.value}</span>
                  <span className="text-lg text-gray-400">{vital.unit}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${vital.statusColor === "text-[#59f20d]" ? "bg-[#59f20d]" : "bg-orange-500"}`} />
                  <span className={`text-xs font-bold ${vital.statusColor}`}>{vital.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Meds */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">{isAr ? "الأدوية القادمة" : "Upcoming Meds"}</h3>
          <button className="text-xs font-bold text-[#59f20d]">
            {isAr ? "عرض التقويم" : "View Calendar"}
          </button>
        </div>

        <div className="space-y-3">
          {medications.map((med, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-3xl p-4 flex items-center justify-between ${
                med.taken
                  ? "bg-gradient-to-r from-[#59f20d]/20 to-[#59f20d]/5 border-2 border-[#59f20d]/40"
                  : "bg-zinc-900/60 border-2 border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    med.taken ? "bg-[#59f20d]/30" : "bg-zinc-800"
                  }`}
                >
                  {med.icon}
                </div>

                <div>
                  <h4 className="text-base font-bold text-white mb-0.5">{med.name}</h4>
                  <p className="text-xs text-gray-400">
                    {med.time} • {med.dose}
                  </p>
                  {med.type && <p className="text-xs text-gray-500 mt-0.5">{med.type}</p>}
                </div>
              </div>

              {med.taken ? (
                <div className="w-10 h-10 rounded-full bg-[#59f20d] flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : (
                <button className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Care Team */}
      <div>
        <h3 className="text-xl font-black mb-4">{isAr ? "فريق الرعاية" : "Care Team"}</h3>

        <div className="flex items-center gap-4">
          {careTeam.map((doctor, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-3 border-[#59f20d] p-0.5 mb-2">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {doctor.available && (
                  <div className="absolute bottom-2 right-0 w-5 h-5 rounded-full bg-[#59f20d] border-2 border-black" />
                )}
              </div>
              <p className="text-sm font-bold text-white">{doctor.name}</p>
              <p className="text-xs text-gray-500">{doctor.role}</p>
            </div>
          ))}

          <button className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center mb-2 hover:border-[#59f20d] transition-colors">
              <UserPlus className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-xs text-gray-500">{isAr ? "إضافة جديد" : "Add New"}</p>
          </button>
        </div>
      </div>

      {/* Emergency SOS Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button className="relative group">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center shadow-2xl border-4 border-white/20 hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
            <span className="text-xs font-black text-white mt-1">SOS</span>
          </div>
        </button>
      </div>

      {/* Health Tips */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-900/30 to-zinc-900/60 border-2 border-blue-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-black">{isAr ? "نصائح صحية لكبار السن" : "Senior Health Tips"}</h3>
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
            <p>
              {isAr
                ? "مارس تمارين خفيفة مثل المشي لمدة 20-30 دقيقة يومياً"
                : "Exercise lightly such as walking for 20-30 minutes daily"}
            </p>
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
            <p>
              {isAr
                ? "تناول الأدوية في أوقاتها المحددة واحتفظ بقائمة محدثة"
                : "Take medications on time and keep an updated list"}
            </p>
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
            <p>
              {isAr
                ? "راقب ضغط الدم بانتظام واحتفظ بسجل للقراءات"
                : "Monitor blood pressure regularly and keep a log"}
            </p>
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
            <p>
              {isAr
                ? "احرص على نظام غذائي متوازن غني بالألياف والبروتين"
                : "Maintain a balanced diet rich in fiber and protein"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-24" />
    </div>
  );
}
