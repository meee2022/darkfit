import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Id } from "../../convex/_generated/dataModel";
import { NutritionPlanCreate } from "./NutritionPlanCreate";
import {
  Users,
  UtensilsCrossed,
  Dumbbell,
  ChevronRight,
  PlusCircle,
  Search,
  UserCheck,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "clients" | "nutritionPlan" | "workoutPlan";

export function CoachDashboard() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState<Tab>("clients");
  const [selectedClientId, setSelectedClientId] = useState<Id<"profiles"> | null>(null);
  const [showCreateNutrition, setShowCreateNutrition] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [addClientQ, setAddClientQ] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);

  const myClients = useQuery(api.profiles.getMyCoachClients) ?? [];
  const allProfiles = useQuery(api.profiles.listAllProfiles) ?? [];
  const addClientMutation = useMutation(api.profiles.coachAddClient);
  const seedFoodsMutation = useMutation(api.nutrition.seedArabicFoods);

  const [seeding, setSeeding] = useState(false);

  const filteredClients = myClients.filter((c: any) =>
    (c.name || "").toLowerCase().includes(searchQ.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  const searchableProfiles = allProfiles.filter(
    (p: any) =>
      !myClients.some((c: any) => c._id === p._id) &&
      (
        (p.name || "").toLowerCase().includes(addClientQ.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(addClientQ.toLowerCase())
      )
  );

  const handleAddClient = async (profileId: Id<"profiles">) => {
    try {
      await addClientMutation({ clientProfileId: profileId });
      toast.success(isAr ? "تمت إضافة المتدرب!" : "Client added!");
      setAddClientQ("");
      setShowAddClient(false);
    } catch {
      toast.error(isAr ? "حدث خطأ" : "Error occurred");
    }
  };

  if (showCreateNutrition) {
    return (
      <NutritionPlanCreate
        clientId={selectedClientId ?? undefined}
        onClose={() => {
          setShowCreateNutrition(false);
          setSelectedClientId(null);
        }}
      />
    );
  }

  const tabs = [
    { id: "clients" as Tab, label: isAr ? "متدربين" : "Clients", icon: Users },
    { id: "nutritionPlan" as Tab, label: isAr ? "التغذية" : "Nutrition", icon: UtensilsCrossed },
    { id: "workoutPlan" as Tab, label: isAr ? "التمارين" : "Workouts", icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white pb-24" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1a0d] via-[#111] to-[#0c0c0c] border border-[#1f2e1f] p-6 mb-6 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(89,242,13,0.08),transparent_70%)]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#59f20d]/15 border border-[#59f20d]/30 flex items-center justify-center shadow-lg">
            <Clipboard className="w-7 h-7 text-[#59f20d]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              {isAr ? "لوحة تحكم المدرب" : "Coach Dashboard"}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {isAr
                ? "إدارة متدربيك وخططهم الغذائية والتدريبية"
                : "Manage your clients and their plans"}
            </p>
          </div>
          {/* Seed Button */}
          <div className="mr-auto">
            <button
              onClick={async () => {
                setSeeding(true);
                try {
                  const res = await seedFoodsMutation({});
                  toast.success(isAr ? `تم تحديث المكتبة! تم إضافة ${res.addedCount} صنف` : `Library updated! Added ${res.addedCount} items`);
                } catch (e: any) {
                  toast.error(e.message || "Error seeding foods");
                } finally {
                  setSeeding(false);
                }
              }}
              disabled={seeding}
              className="px-4 py-2 rounded-xl bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] text-xs font-bold hover:bg-[#59f20d]/20 transition disabled:opacity-50"
            >
              {seeding ? (isAr ? "جاري التحديث..." : "Updating...") : (isAr ? "تحديث مكتبة الطعام" : "Refresh Food Library")}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-zinc-900/50 rounded-2xl p-1.5 border border-zinc-800/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                active
                  ? "bg-[#59f20d] text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== CLIENTS TAB ===== */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          {/* Search + Add */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder={isAr ? "ابحث عن متدرب..." : "Search clients..."}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#59f20d]/50"
              />
            </div>
            <button
              onClick={() => setShowAddClient(!showAddClient)}
              className="px-4 py-3 bg-[#59f20d] text-black rounded-xl font-bold flex items-center gap-2 hover:bg-[#4ed10a] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="text-sm">{isAr ? "إضافة" : "Add"}</span>
            </button>
          </div>

          {/* Add Client Search */}
          {showAddClient && (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-[#59f20d]/30 space-y-3">
              <p className="text-sm font-bold text-[#59f20d]">
                {isAr ? "ابحث عن مستخدم لإضافته كمتدرب" : "Search user to add as client"}
              </p>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  value={addClientQ}
                  onChange={(e) => setAddClientQ(e.target.value)}
                  placeholder={isAr ? "اسم أو إيميل..." : "Name or email..."}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#59f20d]/50"
                />
              </div>
              {addClientQ.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchableProfiles.length === 0 ? (
                    <p className="text-center text-zinc-500 text-sm py-4">
                      {isAr ? "لا توجد نتائج" : "No results"}
                    </p>
                  ) : (
                    searchableProfiles.slice(0, 6).map((p: any) => (
                      <button
                        key={p._id}
                        onClick={() => handleAddClient(p._id)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#59f20d]/20 flex items-center justify-center">
                            <span className="text-[#59f20d] font-bold text-sm">
                              {(p.name || "?")[0]}
                            </span>
                          </div>
                          <div className="text-start">
                            <p className="text-sm font-bold text-white">{p.name}</p>
                            <p className="text-xs text-zinc-500">{p.email}</p>
                          </div>
                        </div>
                        <PlusCircle className="w-5 h-5 text-[#59f20d]" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Client List */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-500 font-medium">
                {isAr ? "لا يوجد متدربون بعد" : "No clients yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client: any) => (
                <div
                  key={client._id}
                  className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 hover:border-[#59f20d]/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#59f20d]/15 border border-[#59f20d]/30 flex items-center justify-center">
                        <span className="text-[#59f20d] font-black text-lg">
                          {(client.name || "?")[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{client.name}</p>
                        <p className="text-xs text-zinc-500">{client.email}</p>
                        {client.calories ? (
                          <p className="text-xs text-[#59f20d] mt-0.5">
                            {client.calories} {isAr ? "سعرة مستهدفة" : "kcal target"}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedClientId(client._id);
                          setShowCreateNutrition(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] text-xs font-bold hover:bg-[#59f20d]/20 transition-all"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                        {isAr ? "خطة غذائية" : "Diet Plan"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== NUTRITION PLAN TAB ===== */}
      {activeTab === "nutritionPlan" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 text-center">
            <UtensilsCrossed className="w-12 h-12 text-[#59f20d] mx-auto mb-3" />
            <h3 className="text-lg font-black text-white mb-2">
              {isAr ? "إنشاء خطة غذائية" : "Create Nutrition Plan"}
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              {isAr
                ? "اختر متدرباً من القائمة وابدأ بتصميم خطته الغذائية"
                : "Select a client and create their personalized nutrition plan"}
            </p>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {myClients.map((client: any) => (
                <button
                  key={client._id}
                  onClick={() => {
                    setSelectedClientId(client._id);
                    setShowCreateNutrition(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#59f20d]/20 flex items-center justify-center">
                      <span className="text-[#59f20d] font-bold text-sm">
                        {(client.name || "?")[0]}
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm">{client.name}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#59f20d]" />
                </button>
              ))}
            </div>
            {myClients.length === 0 && (
              <p className="text-zinc-500 text-sm">
                {isAr ? "أضف متدربين أولاً من تبويب المتدربين" : "Add clients first from the Clients tab"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== WORKOUT TAB ===== */}
      {activeTab === "workoutPlan" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 text-center">
            <Dumbbell className="w-12 h-12 text-[#59f20d] mx-auto mb-3" />
            <h3 className="text-lg font-black text-white mb-2">
              {isAr ? "خطط التمارين" : "Workout Plans"}
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              {isAr
                ? "هذه الميزة قريباً — ستتمكن من إضافة خطط تمارين وتعيينها لمتدربيك"
                : "Coming soon — assign workout plans to your clients"}
            </p>
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/20 text-[#59f20d] text-sm font-bold">
              <UserCheck className="w-4 h-4" />
              {isAr ? "قريباً" : "Coming Soon"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
