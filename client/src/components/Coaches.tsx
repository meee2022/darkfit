import React, { useMemo, useState } from "react";
import { Users, Award, Star, Search, MessageCircle, X } from "lucide-react";

type Coach = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  bio: string;
  image?: string;
  whatsapp?: string; // مثال: 97450123456
  rating?: number; // 0..5
};

const SAMPLE_COACHES: Coach[] = [
  {
    id: "1",
    name: "كابتن أحمد",
    specialty: "تضخيم وبناء عضلات",
    experience: "8 سنوات خبرة",
    bio: "متخصص في برامج التضخيم وخطط التغذية العملية حسب نمط حياتك.",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=300&q=80",
    whatsapp: "97450123456",
    rating: 5,
  },
  {
    id: "2",
    name: "كابتن سارة",
    specialty: "خسارة دهون ولياقة",
    experience: "6 سنوات خبرة",
    bio: "برامج خسارة دهون واقعية + متابعة أسبوعية + عادات غذائية بدون حرمان.",
    image:
      "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=300&q=80",
    whatsapp: "97455112233",
    rating: 5,
  },
  {
    id: "3",
    name: "كابتن يوسف",
    specialty: "قوة و CrossFit",
    experience: "7 سنوات خبرة",
    bio: "تطوير القوة والتحمل مع خطط تمارين قابلة للتدرج للمبتدئ والمتقدم.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80",
    whatsapp: "97450001122",
    rating: 4,
  },
];

export function Coaches() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Coach | null>(null);

  const coaches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return SAMPLE_COACHES;
    return SAMPLE_COACHES.filter((c) =>
      `${c.name} ${c.specialty} ${c.experience} ${c.bio}`.toLowerCase().includes(query)
    );
  }, [q]);

  const openWhatsApp = (phone?: string) => {
    const clean = String(phone || "").replace(/[^\d]/g, "");
    if (!clean) return;
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header داخل السيكشن */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-5 border border-emerald-100 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              المدربون
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              اختر مدربك المناسب وتواصل معه عبر واتساب.
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن مدرب…"
            className="w-full pr-10 pl-3 py-3 rounded-2xl border border-emerald-100 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>

      {/* List */}
      {coaches.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-3xl p-8 border border-emerald-100 shadow-sm text-center">
          <div className="text-4xl mb-2">🧑‍🏫</div>
          <div className="font-extrabold text-slate-800">لا يوجد نتائج</div>
          <div className="text-sm text-slate-500 mt-1">جرّب بحث مختلف.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((coach) => (
            <button
              key={coach.id}
              onClick={() => setSelected(coach)}
              className="text-right bg-white/85 backdrop-blur rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="p-4 flex gap-4">
                <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden shrink-0">
                  {coach.image ? (
                    <img src={coach.image} alt={coach.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Users className="w-7 h-7" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-base font-extrabold text-slate-900">{coach.name}</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">{coach.specialty}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Award className="w-4 h-4" />
                    <span>{coach.experience}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (coach.rating ?? 5)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-emerald-700">عرض التفاصيل</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal بسيط بدل Drawer */}
      {selected && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-3">
          <div className="w-full sm:max-w-lg bg-white rounded-3xl p-5 border border-emerald-100 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-extrabold text-slate-900">{selected.name}</div>
                <div className="text-sm font-bold text-emerald-700">{selected.specialty}</div>
                <div className="text-xs text-slate-500 mt-1">{selected.experience}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-2xl hover:bg-slate-50"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="text-sm font-extrabold text-slate-800 mb-1">نبذة</div>
              <div className="text-sm text-slate-600 leading-relaxed">{selected.bio}</div>
            </div>

            <button
              onClick={() => openWhatsApp(selected.whatsapp)}
              className="mt-4 w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-extrabold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              تواصل واتساب
            </button>

            {!selected.whatsapp && (
              <div className="text-xs text-rose-600 text-center mt-2">
                رقم واتساب غير موجود لهذا المدرب.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center text-[10px] text-slate-300 py-2">
        📁 client/src/components/Coaches.tsx
      </div>
    </div>
  );
}
