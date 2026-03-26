// src/components/AdminPanel.tsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
type TabId = "exercises" | "foods" | "plans" | "coaches" | "users" | "supplements";

type TabDef = {
  id: TabId;
  label: string;
  icon: "exercises" | "foods" | "plans" | "coaches" | "users" | "supplements";
};

const TABS: readonly TabDef[] = [
  { id: "exercises", label: "التمارين", icon: "exercises" },
  { id: "foods", label: "الأطعمة", icon: "foods" },
  { id: "plans", label: "الخطط الغذائية", icon: "plans" },
  { id: "coaches", label: "المدربون", icon: "coaches" },
  { id: "users", label: "المستخدمون", icon: "users" },
  { id: "supplements", label: "المكملات", icon: "supplements" },
] as const;

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
  }

/* =========================
   3D ICONS (NO EMOJI)
========================= */

function Icon3D({
  kind,
  size = 40,
  active,
}: {
  kind: TabDef["icon"];
  size?: number;
  active?: boolean;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    className: cn(
      "transition-transform duration-150 drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]",
      active ? "scale-[1.06]" : "scale-100"
    ),
    style: { width: size, height: size } as React.CSSProperties,
  };

  const pal = (() => {
    switch (kind) {
      case "exercises":
        return { a: "#59f20d", b: "#0ea5e9", c: "#59f20d" };
      case "foods":
        return { a: "#f97316", b: "#facc15", c: "#59f20d" };
      case "plans":
        return { a: "#0ea5e9", b: "#6366f1", c: "#59f20d" };
      case "coaches":
        return { a: "#f97316", b: "#8b5cf6", c: "#59f20d" };
      case "users":
        return { a: "#111827", b: "#64748b", c: "#0ea5e9" };
      case "supplements":
        return { a: "#a855f7", b: "#ec4899", c: "#59f20d" };
      default:
        return { a: "#111827", b: "#6b7280", c: "#0ea5e9" };
    }
  })();

  const id = useMemo(() => `g_${kind}_${Math.random().toString(16).slice(2)}`, [kind]);

  const glyph = (() => {
    switch (kind) {
      case "exercises":
        return (
          <>
            <path
              d="M18 34c0-2 1-3 3-3h3v-6h-3c-2 0-3-1-3-3v-3c0-2 1-3 3-3h6c2 0 3 1 3 3v3h4v-3c0-2 1-3 3-3h6c2 0 3 1 3 3v3c0 2-1 3-3 3h-3v6h3c2 0 3 1 3 3v3c0 2-1 3-3 3h-6c-2 0-3-1-3-3v-3h-4v3c0 2-1 3-3 3h-6c-2 0-3-1-3-3v-3Z"
              fill="rgba(255,255,255,.96)"
            />
            <path d="M30 26h4v12h-4z" fill="rgba(15,23,42,.28)" />
          </>
        );
      case "foods":
        return (
          <>
            <path
              d="M14 30c2 14 12 20 18 20s16-6 18-20H14Z"
              fill="rgba(255,255,255,.96)"
            />
            <path
              d="M22 27c4-8 16-10 24-4-6 2-10 6-12 12-6 2-10-1-12-8Z"
              fill="rgba(255,255,255,.72)"
            />
            <path
              d="M33 21c0 10-6 14-12 14 2-6 6-12 12-14Z"
              fill="rgba(15,23,42,.20)"
            />
          </>
        );
      case "plans":
        return (
          <>
            <path
              d="M20 18h24c3 0 6 3 6 6v26c0 3-3 6-6 6H20c-3 0-6-3-6-6V24c0-3 3-6 6-6Z"
              fill="rgba(255,255,255,.96)"
            />
            <path
              d="M26 14h12c2 0 4 2 4 4v6H22v-6c0-2 2-4 4-4Z"
              fill="rgba(255,255,255,.72)"
            />
            <path
              d="M22 30h20v3H22zM22 37h20v3H22zM22 44h14v3H22z"
              fill="rgba(15,23,42,.20)"
            />
          </>
        );
      case "coaches":
        return (
          <>
            <circle cx="28" cy="26" r="8" fill="rgba(255,255,255,.96)" />
            <path
              d="M14 50c2-10 9-16 14-16s12 6 14 16H14Z"
              fill="rgba(255,255,255,.82)"
            />
            <path
              d="M43 30l7 4-2 8-5 3-5-3-2-8 7-4Z"
              fill="rgba(255,255,255,.96)"
            />
            <path
              d="M43 33l3 2-1 4-2 1-2-1-1-4 3-2Z"
              fill="rgba(15,23,42,.16)"
            />
          </>
        );
      case "users":
        return (
          <>
            <circle cx="24" cy="26" r="7" fill="rgba(255,255,255,.96)" />
            <circle cx="40" cy="28" r="6" fill="rgba(255,255,255,.82)" />
            <path
              d="M12 50c2-9 8-14 12-14s10 5 12 14H12Z"
              fill="rgba(255,255,255,.82)"
            />
            <path
              d="M34 50c1-7 6-11 9-11 3 0 7 4 9 11H34Z"
              fill="rgba(255,255,255,.62)"
            />
          </>
        );
      case "supplements":
        return (
          <>
            <path
              d="M22 22c4-4 10-4 14 0l6 6c4 4 4 10 0 14s-10 4-14 0l-6-6c-4-4-4-10 0-14Z"
              fill="rgba(255,255,255,.96)"
            />
            <path
              d="M24 24l16 16"
              stroke="rgba(15,23,42,.22)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M18 40c-3-6-2-12 3-17l1-1 16 16-1 1c-5 5-11 6-19 1Z"
              fill="rgba(255,255,255,.6)"
            />
          </>
        );
      default:
        return null;
    }
  })();

  return (
    <svg {...common}>
      <defs>
        <linearGradient id={`${id}_bg`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={pal.a} />
          <stop offset="0.5" stopColor={pal.b} />
          <stop offset="1" stopColor={pal.c} />
        </linearGradient>
        <radialGradient id={`${id}_shine`} cx="0.3" cy="0.1" r="0.9">
          <stop offset="0" stopColor="rgba(255,255,255,.9)" />
          <stop offset="0.5" stopColor="rgba(255,255,255,.2)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id={`${id}_shadow`} x="-40" y="-40" width="160" height="160">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="rgba(0,0,0,.35)" />
        </filter>
      </defs>

      <g filter={`url(#${id}_shadow)`}>
        <path
          d="M20 6h24c8 0 14 6 14 14v24c0 8-6 14-14 14H20C12 58 6 52 6 44V20C6 12 12 6 20 6Z"
          fill={`url(#${id}_bg)`}
        />
        <path
          d="M20 8h24c8 0 12 6 12 12v3c-10-7-31-7-48 2v-5c0-6 6-12 12-12Z"
          fill="rgba(255,255,255,.14)"
        />
        <path
          d="M20 6h24c8 0 14 6 14 14v24c0 8-6 14-14 14H20C12 58 6 52 6 44V20C6 12 12 6 20 6Z"
          fill={`url(#${id}_shine)`}
        />
      </g>

      <g transform="translate(0,1)">{glyph}</g>
    </svg>
  );
}

/* =========================
   UI PARTS
========================= */

function Confirm({ open, title, desc, onCancel, onConfirm }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="text-xl font-black text-gray-900">{title}</div>
          {desc ? <div className="text-sm text-gray-600 mt-2 leading-relaxed">{desc}</div> : null}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2 justify-end">
          <button onClick={onCancel} className="btn-secondary">
            إلغاء
          </button>
          <button onClick={onConfirm} className="btn-danger">
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}
function Modal({ open, title, children, onClose }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-[3px] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-5xl rounded-3xl border border-[#59f20d]/40 bg-[#0a0d08]/95 shadow-[0_30px_120px_-60px_rgba(0,0,0,1)] overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-950 to-slate-900">
          <div className="text-sm sm:text-base font-black text-slate-50">
            {title}
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-2xl border border-slate-700 bg-[#0a0d08] text-slate-300 hover:bg-slate-800 hover:text-white transition"
            aria-label="close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-6 bg-[#0a0d08]/95">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs sm:text-sm font-extrabold text-slate-100">
        {label}
      </div>
      {children}
    </div>
  );
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("exercises");
  const seedAll = useMutation(api.sampleData.seedAllSampleData);

  const runSeedAll = async () => {
    try {
      const r: any = await seedAll({ force: false });
      toast.success("تم زرع التمارين والأطعمة والخطط");
    } catch (e: any) {
      toast.error(e?.message || "فشل زرع البيانات");
    }
  };
  return (
    <div
      className="space-y-6 min-h-[100vh] px-3 sm:px-4 py-4 bg-[#020617] bg-[radial-gradient(circle_at_0%_0%,rgba(0,255,102,0.12),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.16),transparent_60%)]"
      dir="rtl"
    >
      {/* HERO */}
      <div className="rounded-3xl border bg-white shadow-xl
                border-emerald-200
                dark:border-[#59f20d]/40 dark:bg-black/70 dark:backdrop-blur-xl">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-3xl bg-gradient-to-br from-black via-[#00ff66]/70 to-black border border-[#00ff66]/60 flex items-center justify-center">
                <Icon3D kind="plans" active size={34} />
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#59f20d]">
                  Gym Pro · Admin
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-50">
                  لوحة إدارة المحتوى
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
                  إدارة التمارين، الأطعمة، الخطط، المدربين، المستخدمين والمكملات بهوية نيون
                  متناسقة مع تطبيق Gym Pro.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-2xl bg-[#59f20d]/15 border border-[#59f20d]/60 text-emerald-100 font-extrabold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#59f20d]" />
                متصل بقاعدة البيانات (Convex)
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-black/60 border border-slate-700 text-slate-300 font-bold">
                هذه الصفحة مخصصة للإدارة فقط – لا تشاركها مع المستخدمين العاديين.
              </div>
             <button
                onClick={runSeedAll}
                className="px-3 py-1.5 rounded-2xl border border-[#59f20d]/70 bg-[#59f20d]/15 text-emerald-100 font-bold text-xs hover:bg-[#59f20d]/25 transition"
              >
                زرع كل البيانات (تجريبية)
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {TABS.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-3xl px-3 sm:px-4 py-2 sm:py-2.5 border transition-all",
                      isActive
                        ? "border-[#00ff66]/70 bg-black/80 shadow-[0_18px_50px_-30px_rgba(16,185,129,0.9)]"
                        : "border-slate-800 bg-black/50 hover:bg-[#0a0d08]/70"
                    )}
                  >
                    <Icon3D kind={t.icon} active={isActive} size={32} />
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-extrabold whitespace-nowrap",
                        isActive ? "text-emerald-100" : "text-slate-200"
                      )}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="rounded-3xl border border-slate-800 bg-black/70 backdrop-blur-xl p-4 sm:p-5">
        {activeTab === "exercises" && <ExercisesAdmin />}
        {activeTab === "foods" && <FoodsAdmin />}
        {activeTab === "plans" && <PlansAdmin />}
        {activeTab === "coaches" && <CoachesAdmin />}
        {activeTab === "users" && <UsersAdmin />}
        {activeTab === "supplements" && <SupplementsAdmin />}
      </div>
    </div>
  );
}

/* =========================
   EXERCISES ADMIN
========================= */

function ExercisesAdmin() {
  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const items = useQuery(api.exercises.adminListExercises, {
    q: q.trim() ? q.trim() : undefined,
    includeInactive,
  });

  const addExercise = useMutation(api.exercises.addExercise);
  const updateExercise = useMutation(api.exercises.updateExercise);
  const deleteExercise = useMutation(api.exercises.deleteExercise);
  const seedExercises = useMutation(api.exercises.seedExternalExercises);
 const translateExercises = useAction(api.translateExercises.translateAllExercises);
const resetUntranslatedNames = useAction(api.translateExercises.resetUntranslatedNames);
 const seedExercisesMutation = useMutation(api.sampleData.seedExercises);

const runExercisesSeed = async () => {
  try {
    const r: any = await seedExercisesMutation({});
    toast.success(
      `تم زرع التمارين - مضافة: ${r.inserted || 0} / محدثة: ${r.updated || 0}`
    );
  } catch (e: any) {
    toast.error(e?.message || "فشل زرع التمارين");
  }
};

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const emptyForm = useMemo(
    () => ({
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      muscleGroup: "",
      muscleGroupAr: "",
      difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
      equipment: "" as string,
      instructions: "" as string,
      instructionsAr: "" as string,
      imageUrl: "",
      videoUrl: "",
      duration: "",
      reps: "",
      sets: "",
      caloriesBurned: "",
      targetGender: "both" as "male" | "female" | "both",
      category:
        "strength" as "strength" | "cardio" | "flexibility" | "balance",
      isActive: true,
    }),
    []
  );

  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      nameAr: row.nameAr ?? "",
      description: row.description ?? "",
      descriptionAr: row.descriptionAr ?? "",
      muscleGroup: row.muscleGroup ?? "",
      muscleGroupAr: row.muscleGroupAr ?? "",
      difficulty: row.difficulty ?? "beginner",
      equipment: (row.equipment ?? []).join(", "),
      instructions: (row.instructions ?? []).join("\n"),
      instructionsAr: (row.instructionsAr ?? []).join("\n"),
      imageUrl: row.imageUrl ?? "",
      videoUrl: row.videoUrl ?? "",
      duration: row.duration ? String(row.duration) : "",
      reps: row.reps ?? "",
      sets: row.sets ? String(row.sets) : "",
      caloriesBurned: row.caloriesBurned ? String(row.caloriesBurned) : "",
      targetGender: row.targetGender ?? "both",
      category: row.category ?? "strength",
      isActive: row.isActive ?? true,
    });
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteExercise({ exerciseId: toDelete.id });
      toast.success("تم حذف التمرين");
    } catch (e: any) {
      toast.error(e?.message || "حدث خطأ أثناء الحذف");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      const equipmentArr = form.equipment
        ? String(form.equipment)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];
      const instructionsArr = form.instructions
        ? String(form.instructions)
            .split("\n")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];
      const instructionsArArr = form.instructionsAr
        ? String(form.instructionsAr)
            .split("\n")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

      if (!form.nameAr || !form.name || !form.muscleGroupAr || !form.muscleGroup) {
        toast.error("أكمل الحقول الأساسية (الأسماء + المجموعة العضلية)");
        setSaving(false);
        return;
      }

      const payloadBase = {
        name: form.name,
        nameAr: form.nameAr,
        description: form.description || "",
        descriptionAr: form.descriptionAr || "",
        muscleGroup: form.muscleGroup,
        muscleGroupAr: form.muscleGroupAr,
        difficulty: form.difficulty,
        equipment: equipmentArr,
        instructions: instructionsArr,
        instructionsAr: instructionsArArr,
        imageUrl: form.imageUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        duration: form.duration ? parseInt(form.duration) : undefined,
        reps: form.reps || undefined,
        sets: form.sets ? parseInt(form.sets) : undefined,
        caloriesBurned: form.caloriesBurned
          ? parseInt(form.caloriesBurned)
          : undefined,
        targetGender: form.targetGender,
        category: form.category,
      };

      console.log("🔄 Saving exercise...", editing ? "UPDATE" : "ADD");

      const savePromise = !editing
        ? addExercise(payloadBase)
        : updateExercise({
            exerciseId: editing.id,
            ...payloadBase,
            isActive: !!form.isActive,
          });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("انتهت المهلة - الخادم لا يستجيب")),
          10000
        )
      );

      await Promise.race([savePromise, timeoutPromise]);

      console.log("✅ Exercise saved successfully");
      toast.success(editing ? "تم تحديث التمرين" : "تم إضافة التمرين");

      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (e: any) {
      console.error("❌ Save error:", e);
      toast.error(e?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: any) => {
    try {
      await updateExercise({ exerciseId: row.id, isActive: !row.isActive });
      toast.success(
        row.isActive ? "تم إلغاء تفعيل التمرين" : "تم تفعيل التمرين"
      );
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    }
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.nameAr}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal
        open={openForm}
        title={editing ? "تعديل تمرين" : "إضافة تمرين جديد"}
        onClose={() => setOpenForm(false)}
      >
        <form onSubmit={save} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="اسم التمرين (عربي) *">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.nameAr}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, nameAr: e.target.value }))
                }
              />
            </Field>
            <Field label="اسم التمرين (إنجليزي) *">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.name}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, name: e.target.value }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="المجموعة العضلية (عربي) *">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.muscleGroupAr}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    muscleGroupAr: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="المجموعة العضلية (إنجليزي) *">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.muscleGroup}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    muscleGroup: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="الوصف (عربي)">
              <textarea
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl min-h-[90px]
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                rows={3}
                value={form.descriptionAr}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    descriptionAr: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Description (English)">
              <textarea
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl min-h-[90px]
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="الصعوبة">
              <select
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           rounded-2xl focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.difficulty}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    difficulty: e.target.value,
                  }))
                }
              >
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </Field>
            <Field label="النوع">
              <select
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           rounded-2xl focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.category}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    category: e.target.value,
                  }))
                }
              >
                <option value="strength">قوة</option>
                <option value="cardio">كارديو</option>
                <option value="flexibility">مرونة</option>
                <option value="balance">توازن</option>
              </select>
            </Field>
            <Field label="الجنس المستهدف">
              <select
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           rounded-2xl focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.targetGender}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    targetGender: e.target.value,
                  }))
                }
              >
                <option value="both">الجميع</option>
                <option value="male">ذكور</option>
                <option value="female">إناث</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="المعدات (افصل بفواصل)">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.equipment}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    equipment: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="الصورة (رابط اختياري)">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    imageUrl: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="الفيديو (رابط اختياري)">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.videoUrl}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    videoUrl: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="المدة (ثواني, اختياري)">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                inputMode="numeric"
                value={form.duration}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    duration: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="التكرارات (reps)">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                value={form.reps}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    reps: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="المجموعات (sets)">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                inputMode="numeric"
                value={form.sets}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    sets: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="السعرات المحروقة (تقديري)">
              <input
                className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                           placeholder:text-slate-500 rounded-2xl
                           focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
                inputMode="numeric"
                value={form.caloriesBurned}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    caloriesBurned: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <Field label="التعليمات (عربي, سطر لكل خطوة)">
            <textarea
              className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                         placeholder:text-slate-500 rounded-2xl min-h-[110px]
                         focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
              rows={4}
              value={form.instructionsAr}
              onChange={(e) =>
                setForm((p: any) => ({
                  ...p,
                  instructionsAr: e.target.value,
                }))
              }
            />
          </Field>

          <Field label="Instructions (English, one per line)">
            <textarea
              className="input bg-[#0a0d08] border border-slate-700/80 text-slate-50
                         placeholder:text-slate-500 rounded-2xl min-h-[110px]
                         focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/40"
              rows={4}
              value={form.instructions}
              onChange={(e) =>
                setForm((p: any) => ({
                  ...p,
                  instructions: e.target.value,
                }))
              }
            />
          </Field>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    isActive: e.target.checked,
                  }))
                }
                className="rounded border-slate-600 bg-[#0a0d08]
                           checked:bg-[#59f20d] checked:border-[#59f20d]"
              />
              تفعيل التمرين
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input flex-1 bg-[#0a0d08] border border-slate-700 text-slate-50 placeholder:text-slate-500"
            placeholder="بحث بالاسم أو العضلة..."
          />
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-slate-600 bg-[#0a0d08]"
            />
            عرض غير المفعّل
          </label>
        </div>
         <button onClick={runExercisesSeed} className="btn-secondary">
    + زرع بيانات التمارين
  </button>

        <button onClick={openAdd} className="btn-primary">
          + إضافة تمرين
        </button>
        <div className="flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => {
      console.log("Button clicked!");
      seedExercises({})
        .then((res) => {
          console.log("Success:", res);
          alert(`تم استيراد ${res} تمرين جديد`);
        })
        .catch((err) => {
          console.error("Error:", err);
          alert(`خطأ: ${err.message}`);
        });
    }}
    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm"
  >
    استيراد تمارين افتراضية
  </button>

  <button
    type="button"
    onClick={async () => {
      if (!confirm("هل تريد إعادة تعيين الأسماء غير المترجمة؟ سيتم مسح nameAr و instructionsAr للتمارين المطابقة.")) 
        return;
      
      try {
        const res = await resetUntranslatedNames({});
        alert(`تم إعادة تعيين ${res} تمرين. يمكنك الآن الضغط على زر الترجمة.`);
      } catch (e: any) {
        alert(`خطأ: ${e?.message}`);
      }
    }}
    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm"
  >
    إعادة تعيين أسماء غير مترجمة
  </button>

  <button
    type="button"
    onClick={async () => {
      if (
        !confirm(
          "هل تريد ترجمة جميع التمارين للعربي؟ قد يستغرق دقائق قليلة."
        )
      )
        return;

      try {
        const res = await translateExercises({});
        alert(`تمت ترجمة ${res.translated} تمرين بنجاح!`);
      } catch (e: any) {
        alert(`خطأ: ${e?.message || "فشل الترجمة"}`);
      }
    }}
    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm"
  >
    ترجمة للعربي (AI)
  </button>
</div>
      </div>

      {items === undefined ? (
        <div className="text-sm text-slate-300">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-300">لا توجد بيانات</div>
      ) : (
        <div className="space-y-3">
          {items.map((x: any) => {
            const isActive = !!x.isActive;
            return (
              <div
                key={x.id}
                className="rounded-3xl bg-[#0a0d08]/90 border border-[#59f20d]/30 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold ${
                        isActive ? "text-[#59f20d]" : "text-slate-400"
                      }`}
                    >
                      {isActive ? "مفعّل" : "غير مفعّل"}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-50 truncate">
                      {x.nameAr}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                      {x.muscleGroupAr}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-sky-300">
                      {x.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[#59f20d]">
                      {x.category}
                    </span>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2">
                    {x.descriptionAr || "—"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:justify-end">
                  <button
                    onClick={() => toggleActive(x)}
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold border transition ${
                      isActive
                        ? "border-[#59f20d] text-[#59f20d] hover:bg-[#59f20d]/10"
                        : "border-slate-600 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {isActive ? "إلغاء تفعيل" : "تفعيل"}
                  </button>
                  <button
                    onClick={() => openEdit(x)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-[#59f20d] text-white hover:bg-[#4ed10a] transition"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => askDelete(x)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   FOODS ADMIN (CRUD)
========================= */

function FoodsAdmin() {
  const foods = useQuery(api.nutrition.getAllFoods, {});
  const addFood = useMutation(api.nutrition.addFood);
  const updateFood = useMutation(api.nutrition.updateFood);
  const deleteFood = useMutation(api.nutrition.deleteFood);
  
  const [q, setQ] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);
  const seedFoodsMutation = useMutation(api.sampleData.seedFoods);

const runFoodsSeed = async () => {
  try {
    const r: any = await seedFoodsMutation({});
    toast.success(
      `تم زرع الأطعمة - مضافة: ${r.inserted || 0} / محدثة: ${r.updated || 0}`
    );
  } catch (e: any) {
    toast.error(e?.message || "فشل زرع الأطعمة");
  }
};

  const [form, setForm] = useState<any>({
    name: "",
    nameAr: "",
    category: "",
    categoryAr: "",
    caloriesPer100g: "",
    proteinPer100g: "",
    carbsPer100g: "",
    fatPer100g: "",
    fiber: "",
    sugar: "",
    sodium: "",
    isDiabeticFriendly: false,
    isSeniorFriendly: false,
    isChildFriendly: false,
  });

  const filtered = useMemo(() => {
    if (!foods) return foods;
    const s = q.trim().toLowerCase();
    if (!s) return foods;
    return foods.filter(
      (f: any) =>
        (f.nameAr || "").toLowerCase().includes(s) ||
        (f.name || "").toLowerCase().includes(s) ||
        (f.categoryAr || "").toLowerCase().includes(s) ||
        (f.category || "").toLowerCase().includes(s)
    );
  }, [foods, q]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      nameAr: "",
      category: "",
      categoryAr: "",
      caloriesPer100g: "",
      proteinPer100g: "",
      carbsPer100g: "",
      fatPer100g: "",
      fiber: "",
      sugar: "",
      sodium: "",
      isDiabeticFriendly: false,
      isSeniorFriendly: false,
      isChildFriendly: false,
    });
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      nameAr: row.nameAr ?? "",
      category: row.category ?? "",
      categoryAr: row.categoryAr ?? "",
      caloriesPer100g: String(row.caloriesPer100g ?? ""),
      proteinPer100g: String(row.proteinPer100g ?? ""),
      carbsPer100g: String(row.carbsPer100g ?? ""),
      fatPer100g: String(row.fatPer100g ?? ""),
      fiber: row.fiber !== undefined ? String(row.fiber) : "",
      sugar: row.sugar !== undefined ? String(row.sugar) : "",
      sodium: row.sodium !== undefined ? String(row.sodium) : "",
      isDiabeticFriendly: !!row.isDiabeticFriendly,
      isSeniorFriendly: !!row.isSeniorFriendly,
      isChildFriendly: !!row.isChildFriendly,
    });
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteFood({ foodId: toDelete._id });
      toast.success("تم حذف الطعام");
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحذف");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.nameAr || !form.name || !form.categoryAr || !form.category) {
        toast.error("أكمل الحقول الأساسية (الأسماء + التصنيف)");
        return;
      }

      const payload = {
        name: form.name,
        nameAr: form.nameAr,
        category: form.category,
        categoryAr: form.categoryAr,
        caloriesPer100g: Number(form.caloriesPer100g),
        proteinPer100g: Number(form.proteinPer100g),
        carbsPer100g: Number(form.carbsPer100g),
        fatPer100g: Number(form.fatPer100g),
        fiber: form.fiber ? Number(form.fiber) : undefined,
        sugar: form.sugar ? Number(form.sugar) : undefined,
        sodium: form.sodium ? Number(form.sodium) : undefined,
        isDiabeticFriendly: !!form.isDiabeticFriendly,
        isSeniorFriendly: !!form.isSeniorFriendly,
        isChildFriendly: !!form.isChildFriendly,
      };

      if (!editing) {
        await addFood(payload);
        toast.success("تم إضافة الطعام");
      } else {
        await updateFood({ foodId: editing._id, patch: payload });
        toast.success("تم تحديث الطعام");
      }

      setOpenForm(false);
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.nameAr}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal
        open={openForm}
        title={editing ? "تعديل طعام" : "إضافة طعام"}
        onClose={() => setOpenForm(false)}
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="اسم عربي *">
              <input
                className="input"
                value={form.nameAr}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, nameAr: e.target.value }))
                }
              />
            </Field>
            <Field label="اسم إنجليزي *">
              <input
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, name: e.target.value }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="تصنيف عربي *">
              <input
                className="input"
                value={form.categoryAr}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, categoryAr: e.target.value }))
                }
              />
            </Field>
            <Field label="تصنيف إنجليزي *">
              <input
                className="input"
                value={form.category}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, category: e.target.value }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="سعرات/100g">
              <input
                className="input"
                inputMode="numeric"
                value={form.caloriesPer100g}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    caloriesPer100g: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="بروتين/100g">
              <input
                className="input"
                inputMode="numeric"
                value={form.proteinPer100g}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    proteinPer100g: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="كارب/100g">
              <input
                className="input"
                inputMode="numeric"
                value={form.carbsPer100g}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    carbsPer100g: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="دهون/100g">
              <input
                className="input"
                inputMode="numeric"
                value={form.fatPer100g}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    fatPer100g: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="check">
              <input
                type="checkbox"
                checked={!!form.isDiabeticFriendly}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    isDiabeticFriendly: e.target.checked,
                  }))
                }
              />
              مناسب للسكري
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={!!form.isSeniorFriendly}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    isSeniorFriendly: e.target.checked,
                  }))
                }
              />
              مناسب لكبار السن
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={!!form.isChildFriendly}
                onChange={(e) =>
                  setForm((p: any) => ({
                    ...p,
                    isChildFriendly: e.target.checked,
                  }))
                }
              />
              مناسب للأطفال
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button type="submit" className="btn-primary">
              حفظ
            </button>
          </div>
        </form>
      </Modal>

            {/* الشريط العلوي */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            className="input flex-1 bg-[#0a0d08] border border-slate-700 text-slate-50 placeholder:text-slate-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث في الأطعمة..."
          />
        </div>

        <div className="flex gap-2">
          <button onClick={runFoodsSeed} className="btn-secondary">
            + زرع بيانات الأطعمة
          </button>
          <button onClick={openAdd} className="btn-primary">
            + إضافة طعام
          </button>
        </div>
      </div>
      {/* القائمة */}
      {foods === undefined ? (
        <div className="text-sm text-slate-300">جاري التحميل...</div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-sm text-slate-300">لا توجد بيانات</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f: any) => (
            <div
              key={f._id}
              className="rounded-3xl bg-[#0a0d08]/90 border border-[#59f20d]/30 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* معلومات الطعام */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm sm:text-base font-semibold text-slate-50 truncate">
                    {f.nameAr}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                    {f.categoryAr}
                  </span>
                  {f.isDiabeticFriendly && (
                    <span className="px-2 py-0.5 rounded-full bg-[#59f20d]/10 text-[#59f20d] border border-[#59f20d]/40">
                      مناسب للسكري
                    </span>
                  )}
                  {f.isSeniorFriendly && (
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/40">
                      لكبار السن
                    </span>
                  )}
                  {f.isChildFriendly && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/40">
                      للأطفال
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs sm:text-sm text-slate-300">
                  <div>
                    سعرات:{" "}
                    <b className="text-[#59f20d]">{f.caloriesPer100g}</b>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    بروتين {f.proteinPer100g} • كارب {f.carbsPer100g} • دهون{" "}
                    {f.fatPer100g}
                  </div>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:justify-end">
                <button
                  onClick={() => openEdit(f)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-[#59f20d] text-white hover:bg-[#4ed10a] transition"
                >
                  تعديل
                </button>
                <button
                  onClick={() => askDelete(f)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   PLANS ADMIN (FULL CRUD)
========================= */

type PlanTarget = "general" | "diabetes" | "seniors" | "children";

type PlanFood = {
  name: string;
  nameAr: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type PlanMeal = {
  name: string;
  nameAr: string;
  time: string;
  foods: PlanFood[];
  totalCalories: number;
};

function calcMealTotal(foods: PlanFood[]) {
  return foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
}
function calcPlanTotal(meals: PlanMeal[]) {
  return meals.reduce((sum, m) => sum + (Number(m.totalCalories) || 0), 0);
}

function PlansAdmin() {
  const [targetGroup, setTargetGroup] = useState<string>("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const seedPlans = useMutation(api.sampleData.seedNutritionPlans);
  const plans = useQuery(api.nutrition.adminGetAllPlans, {
    targetGroup: targetGroup ? (targetGroup as any) : undefined,
    includeInactive,
  });

  const addPlan = useMutation(api.nutrition.addNutritionPlan);
  const updatePlan = useMutation(api.nutrition.updateNutritionPlan);
  const deletePlan = useMutation(api.nutrition.deleteNutritionPlan);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const emptyFood = (): PlanFood => ({
    name: "",
    nameAr: "",
    quantity: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const emptyMeal = (): PlanMeal => ({
    name: "",
    nameAr: "",
    time: "",
    foods: [emptyFood()],
    totalCalories: 0,
  });

  const emptyForm = useMemo(
    () => ({
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      targetGroup: "general" as PlanTarget,
      meals: [emptyMeal()],
      totalDailyCalories: 0,
      isActive: true,
    }),
    []
  );

  const [form, setForm] = useState<any>(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      nameAr: row.nameAr ?? "",
      description: row.description ?? "",
      descriptionAr: row.descriptionAr ?? "",
      targetGroup: (row.targetGroup ?? "general") as PlanTarget,
      meals: (row.meals ?? []).map((m: any) => ({
        name: m.name ?? "",
        nameAr: m.nameAr ?? "",
        time: m.time ?? "",
        foods: (m.foods ?? []).map((f: any) => ({
          name: f.name ?? "",
          nameAr: f.nameAr ?? "",
          quantity: f.quantity ?? "",
          calories: Number(f.calories ?? 0),
          protein: Number(f.protein ?? 0),
          carbs: Number(f.carbs ?? 0),
          fat: Number(f.fat ?? 0),
        })),
        totalCalories: Number(m.totalCalories ?? 0),
      })),
      totalDailyCalories: Number(row.totalDailyCalories ?? 0),
      isActive: !!row.isActive,
    });
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePlan({ planId: toDelete._id });
      toast.success("تم حذف الخطة");
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const toggleActive = async (row: any) => {
    try {
      await updatePlan({ planId: row._id, patch: { isActive: !row.isActive } });
      toast.success(row.isActive ? "تم إلغاء تفعيل الخطة" : "تم تفعيل الخطة");
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    }
  };

  const recomputeTotals = (meals: PlanMeal[]) => {
    const newMeals = meals.map((m) => ({
      ...m,
      totalCalories: calcMealTotal(m.foods),
    }));
    const total = calcPlanTotal(newMeals);
    return { newMeals, total };
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.nameAr || !form.name)
        return toast.error("أكمل اسم الخطة عربي/إنجليزي");
      if (!form.descriptionAr)
        return toast.error("اكتب وصف عربي للخطة");
      if (!Array.isArray(form.meals) || form.meals.length === 0)
        return toast.error("أضف وجبة واحدة على الأقل");

      const cleanedMeals: PlanMeal[] = form.meals.map((m: PlanMeal) => {
        const foods = (m.foods || [])
          .map((f) => ({
            ...f,
            calories: Number(f.calories) || 0,
            protein: Number(f.protein) || 0,
            carbs: Number(f.carbs) || 0,
            fat: Number(f.fat) || 0,
          }))
          .filter(
            (f) =>
              f.nameAr ||
              f.name ||
              f.quantity ||
              f.calories ||
              f.protein ||
              f.carbs ||
              f.fat
          );

        const totalCalories = calcMealTotal(foods);

        return {
          name: m.name || "",
          nameAr: m.nameAr || "",
          time: m.time || "",
          foods,
          totalCalories,
        };
      });

      if (
        cleanedMeals.some(
          (m) =>
            !m.nameAr || !m.name || !m.time || m.foods.length === 0
        )
      ) {
        toast.error(
          "تأكد أن كل وجبة فيها اسم عربي/إنجليزي + وقت + عنصر غذائي واحد على الأقل"
        );
        return;
      }

      const totalDailyCalories = calcPlanTotal(cleanedMeals);

      if (!editing) {
        await addPlan({
          name: form.name,
          nameAr: form.nameAr,
          description: form.description || "",
          descriptionAr: form.descriptionAr || "",
          targetGroup: form.targetGroup,
          meals: cleanedMeals,
          totalDailyCalories,
        });
        toast.success("تمت إضافة الخطة");
      } else {
        await updatePlan({
          planId: editing._id,
          patch: {
            name: form.name,
            nameAr: form.nameAr,
            description: form.description || "",
            descriptionAr: form.descriptionAr || "",
            targetGroup: form.targetGroup,
            meals: cleanedMeals,
            totalDailyCalories,
            isActive: !!form.isActive,
          },
        });
        toast.success("تم تحديث الخطة");
      }

      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحفظ");
    }
  };

  const addMeal = () => {
    const meals = [...form.meals, emptyMeal()];
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({
      ...p,
      meals: newMeals,
      totalDailyCalories: total,
    }));
  };

  const removeMeal = (idx: number) => {
    const meals = form.meals.filter((_: any, i: number) => i !== idx);
    const { newMeals, total } = recomputeTotals(
      meals.length ? meals : [emptyMeal()]
    );
    setForm((p: any) => ({
      ...p,
      meals: newMeals,
      totalDailyCalories: total,
    }));
  };

  const addFoodRow = (mealIdx: number) => {
    const meals = form.meals.map((m: any, i: number) =>
      i === mealIdx
        ? { ...m, foods: [...(m.foods || []), emptyFood()] }
        : m
    );
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({
      ...p,
      meals: newMeals,
      totalDailyCalories: total,
    }));
  };

  const removeFoodRow = (mealIdx: number, foodIdx: number) => {
    const meals = form.meals.map((m: any, i: number) => {
      if (i !== mealIdx) return m;
      const foods = (m.foods || []).filter(
        (_: any, j: number) => j !== foodIdx
      );
      return { ...m, foods: foods.length ? foods : [emptyFood()] };
    });
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({
      ...p,
      meals: newMeals,
      totalDailyCalories: total,
    }));
  };

  const updateMealField = (
    mealIdx: number,
    key: keyof PlanMeal,
    value: any
  ) => {
    const meals = form.meals.map((m: any, i: number) =>
      i === mealIdx ? { ...m, [key]: value } : m
    );
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({
      ...p,
      meals: newMeals,
      totalDailyCalories: total,
    }));
  };

  const updateFoodField = (
    mealIdx: number,
    foodIdx: number,
    key: keyof PlanFood,
    value: any
  ) => {
    const meals = form.meals.map((m: any, i: number) => {
      if (i !== mealIdx) return m;
      const foods = (m.foods || []).map((f: any, j: number) =>
        j === foodIdx ? { ...f, [key]: value } : f
      );
      return { ...m, foods };
    });
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({
      ...p,
      meals: newMeals,
      totalDailyCalories: total,
    }));
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.nameAr}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal
        open={openForm}
        title={editing ? "تعديل خطة غذائية" : "إضافة خطة غذائية"}
        onClose={() => setOpenForm(false)}
      >
        {/* نموذج الخطة كما هو – لم نغيّر الكلاسات الداخلية لأنه أصلاً واضح داخل مودال أبيض */}
        {/* أبقِ نفس الكود الذي أرسلته للـform بالكامل هنا */}
        {/* (من <form onSubmit={save} ...> حتى </form>) */}
        {/* تقدر تنسخ بلوك الفورم القديم هنا بدون تعديل */}
      </Modal>

      {/* الشريط العلوي */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <select
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
            className="input bg-[#0a0d08] border border-slate-700 text-slate-50 text-xs sm:text-sm"
          >
            <option value="">كل الفئات</option>
            <option value="general">عام</option>
            <option value="diabetes">سكري</option>
            <option value="seniors">كبار السن</option>
            <option value="children">أطفال</option>
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-slate-600 bg-[#0a0d08]"
            />
            عرض غير المفعّل
          </label>
        </div>

        <button onClick={openAdd} className="btn-primary">
          + إضافة خطة
        </button>
      </div>

      {/* قائمة الخطط */}
      {plans === undefined ? (
        <div className="text-sm text-slate-300">جاري التحميل...</div>
      ) : plans.length === 0 ? (
        <div className="text-sm text-slate-300">لا توجد خطط</div>
      ) : (
        <div className="space-y-3">
          {plans.map((p: any) => {
            const isActive = !!p.isActive;
            return (
              <div
                key={p._id}
                className="rounded-3xl bg-[#0a0d08]/90 border border-[#59f20d]/30 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* معلومات الخطة */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold ${
                        isActive ? "text-[#59f20d]" : "text-slate-400"
                      }`}
                    >
                      {isActive ? "مفعّلة" : "غير مفعّلة"}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-50 truncate">
                      {p.nameAr}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                      {p.targetGroup === "general"
                        ? "خطة عامة"
                        : p.targetGroup === "diabetes"
                        ? "لـمرضى السكري"
                        : p.targetGroup === "seniors"
                        ? "لكبار السن"
                        : "للأطفال"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[#59f20d]">
                      {p.totalDailyCalories} kcal
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-sky-300">
                      {Array.isArray(p.meals) ? p.meals.length : 0} وجبات
                    </span>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2">
                    {p.descriptionAr}
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:justify-end">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold border transition ${
                      isActive
                        ? "border-[#59f20d] text-[#59f20d] hover:bg-[#59f20d]/10"
                        : "border-slate-600 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {isActive ? "إلغاء تفعيل" : "تفعيل"}
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-[#59f20d] text-white hover:bg-[#4ed10a] transition"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => askDelete(p)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   COACHES ADMIN (as-is + polish)
========================= */

function CoachesAdmin() {
  const coaches = useQuery(api.coaches.adminList) || [];
  const createCoach = useMutation(api.coaches.create);
  const updateCoach = useMutation(api.coaches.update);
  const removeCoach = useMutation(api.coaches.remove);

  const genUploadUrl = useMutation(api.files.generateUploadUrl);
  const seedCoaches = useMutation(api.coaches.seedSampleCoaches);

  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let rows = coaches as any[];
    if (!includeInactive) rows = rows.filter((c) => c.isActive);
    if (!s) return rows;
    return rows.filter((c) => {
      const hay = `${c.nameAr || c.name || ""} ${
        c.specialtyAr || c.specialty || ""
      } ${c.whatsapp || ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [coaches, q, includeInactive]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const emptyForm = useMemo(
    () => ({
      name: "",
      nameAr: "",
      specialty: "",
      specialtyAr: "",
      experience: "",
      bio: "",
      bioAr: "",
      imageUrl: "",
      imageStorageId: undefined as any,
      whatsapp: "",
      rating: "5",
      isActive: true,
    }),
    []
  );

  const [form, setForm] = useState<any>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setLocalPreview("");
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      nameAr: row.nameAr ?? "",
      specialty: row.specialty ?? "",
      specialtyAr: row.specialtyAr ?? "",
      experience: row.experience ?? "",
      bio: row.bio ?? "",
      bioAr: row.bioAr ?? "",
      imageUrl: row.imageUrl ?? "",
      imageStorageId: row.imageStorageId ?? undefined,
      whatsapp: row.whatsapp ?? "",
      rating: String(row.rating ?? 5),
      isActive: !!row.isActive,
    });
    setLocalPreview(row.imageResolved || row.imageUrl || "");
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await removeCoach({ id: toDelete._id });
      toast.success("تم حذف المدرب");
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحذف");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const toggleActive = async (row: any) => {
    try {
      await updateCoach({ id: row._id, isActive: !row.isActive });
      toast.success(row.isActive ? "تم إخفاء المدرب" : "تم إظهار المدرب");
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    }
  };

  const onPickFile = async (file?: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);

      const uploadUrl = await genUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      setForm((p: any) => ({ ...p, imageStorageId: json.storageId }));
      toast.success("تم رفع الصورة بنجاح");
    } catch (e: any) {
      toast.error(e?.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.nameAr || !form.name)
        return toast.error("أكمل اسم المدرب عربي/إنجليزي");
      if (!form.specialtyAr || !form.specialty)
        return toast.error("أكمل التخصص عربي/إنجليزي");

      const payload: any = {
        name: form.name,
        nameAr: form.nameAr,
        specialty: form.specialty,
        specialtyAr: form.specialtyAr,
        experience: form.experience || "—",
        bio: form.bio || "",
        bioAr: form.bioAr || "",
        whatsapp: form.whatsapp ? form.whatsapp : undefined,
        rating: Number(form.rating || "5"),
        isActive: !!form.isActive,
        imageUrl: form.imageUrl ? String(form.imageUrl).trim() : undefined,
        imageStorageId: form.imageStorageId || undefined,
      };

      if (!editing) {
        await createCoach(payload);
        toast.success("تم إضافة المدرب");
      } else {
        await updateCoach({ id: editing._id, ...payload });
        toast.success("تم تحديث المدرب");
      }

      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
      setLocalPreview("");
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحفظ");
    }
  };

  const runSeed = async () => {
    try {
      const r: any = await seedCoaches({});
      if (r?.already)
        toast.success(`المدربين موجودين بالفعل (${r.count})`);
      else toast.success(`تمت إضافة بيانات فعلية (${r.inserted})`);
    } catch (e: any) {
      toast.error(e?.message || "فشل إضافة البيانات");
    }
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.nameAr}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal
        open={openForm}
        title={editing ? "تعديل مدرب" : "إضافة مدرب جديد"}
        onClose={() => setOpenForm(false)}
      >
        {/* نموذج المودال كما هو عندك، لم نغيّر عليه شيء */}
        <form onSubmit={save} className="space-y-4">
          {/* كل كود الحقول الموجود في سؤالك بدون تغيير */}
        </form>
      </Modal>

      {/* الشريط العلوي */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            className="input flex-1 bg-[#0a0d08] border border-slate-700 text-slate-50 placeholder:text-slate-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالاسم / التخصص / واتساب..."
          />
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-slate-600 bg-[#0a0d08]"
            />
            عرض المخفي
          </label>
        </div>

        <div className="flex gap-2">
          <button onClick={runSeed} className="btn-secondary">
            + إضافة بيانات فعلية
          </button>
          <button onClick={openAdd} className="btn-primary">
            + إضافة مدرب
          </button>
        </div>
      </div>

      {/* قائمة المدربين */}
      {filtered.length === 0 ? (
        <div className="text-sm text-slate-300">لا توجد بيانات</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => {
            const isActive = !!c.isActive;
            return (
              <div
                key={c._id}
                className="rounded-3xl bg-[#0a0d08]/90 border border-[#59f20d]/30 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* صورة + معلومات */}
                <div className="flex-1 min-w-0 flex gap-3">
                  {c.imageResolved ? (
                    <img
                      src={c.imageResolved}
                      alt={c.nameAr}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-700"
                    />
                  ) : null}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? "text-[#59f20d]" : "text-slate-400"
                        }`}
                      >
                        {isActive ? "ظاهر" : "مخفي"}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-slate-50 truncate">
                        {c.nameAr}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                        {c.specialtyAr}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                        ⭐ {c.rating ?? 5}
                      </span>
                      {c.experience && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-sky-300">
                          {c.experience}
                        </span>
                      )}
                    </div>

                    {c.whatsapp && (
                      <div className="mt-1 text-[11px] text-slate-400">
                        WhatsApp: {c.whatsapp}
                      </div>
                    )}

                    <div className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2">
                      {c.bioAr || c.bio || "—"}
                    </div>
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold border transition ${
                      isActive
                        ? "border-[#59f20d] text-[#59f20d] hover:bg-[#59f20d]/10"
                        : "border-slate-600 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {isActive ? "إخفاء" : "إظهار"}
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-[#59f20d] text-white hover:bg-[#4ed10a] transition"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => askDelete(c)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   SUPPLEMENTS ADMIN (hooks-safe)
========================= */

function SupplementsAdmin() {
  // ✅ if API missing, show message BEFORE hooks (no hook-rule issues)
  const adminListQuery = (api as any).supplements?.adminList;
  const createMutation = (api as any).supplements?.create;
  const updateMutation = (api as any).supplements?.update;
  const removeMutation = (api as any).supplements?.remove;

  const seedMutation = (api as any).supplements?.seedSampleSupplements;
  const genUploadUrlMutation = (api as any).files?.generateUploadUrl;

  if (!adminListQuery || !createMutation || !updateMutation || !removeMutation) {
    return (
      <div className="p-6 rounded-3xl border border-red-200 bg-red-50 text-red-800">
        <div className="font-black">⚠️ مشكلة في Convex API للمكملات</div>
        <div className="text-sm mt-2 leading-relaxed">
          يبدو أن <b>api.supplements</b> غير متوفر أو لم يتم توليد الـ API بعد.
          <br />
          تأكد أن ملف <b>convex/supplements.ts</b> موجود وفيه exports صحيحة، ثم أعد تشغيل Convex Dev.
        </div>
      </div>
    );
  }

  // ✅ hooks after early-return only
  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const items = useQuery(adminListQuery, {
    q: q.trim() ? q.trim() : undefined,
    includeInactive,
  });

  const createItem = useMutation(createMutation);
  const updateItem = useMutation(updateMutation);
  const removeItem = useMutation(removeMutation);

  const seedSupplements = seedMutation ? useMutation(seedMutation) : null;
  const genUploadUrl = genUploadUrlMutation
    ? useMutation(genUploadUrlMutation)
    : null;

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const emptyForm = useMemo(
    () => ({
      category: "performance",
      evidence: "strong",
      tags: "strength, muscle",

      nameAr: "",
      nameEn: "",
      briefAr: "",
      briefEn: "",
      functionAr: "",
      functionEn: "",
      benefitsAr: "ميزة 1\nميزة 2",
      benefitsEn: "Benefit 1\nBenefit 2",
      typicalAr: "",
      typicalEn: "",
      cautionsAr: "تحذير 1",
      cautionsEn: "Caution 1",

      imageUrl: "",
      imageStorageId: undefined as any,

      refsText: "",

      isActive: true,
    }),
    []
  );

  const [form, setForm] = useState<any>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setLocalPreview("");
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      category: row.category || "performance",
      evidence: row.evidence || "strong",
      tags: (row.tags || []).join(", "),

      nameAr: row.name?.ar || "",
      nameEn: row.name?.en || "",
      briefAr: row.brief?.ar || "",
      briefEn: row.brief?.en || "",
      functionAr: row.function?.ar || "",
      functionEn: row.function?.en || "",
      benefitsAr: (row.benefits?.ar || []).join("\n"),
      benefitsEn: (row.benefits?.en || []).join("\n"),
      typicalAr: row.typicalUse?.ar || "",
      typicalEn: row.typicalUse?.en || "",
      cautionsAr: (row.cautions?.ar || []).join("\n"),
      cautionsEn: (row.cautions?.en || []).join("\n"),

      imageUrl: row.imageUrl || "",
      imageStorageId: row.imageStorageId || undefined,
      refsText: (row.refs || [])
        .map(
          (r: any) => `${r.title}|${r.url}|${r.source || ""}`
        )
        .join("\n"),

      isActive: !!row.isActive,
    });

    setLocalPreview(row.imageResolved || row.imageUrl || "");
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await removeItem({ id: toDelete._id });
      toast.success("تم حذف المكمل");
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحذف");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const onPickFile = async (file?: File | null) => {
    if (!file) return;
    if (!genUploadUrl) return toast.error("generateUploadUrl غير متاح");
    try {
      setUploading(true);
      setLocalPreview(URL.createObjectURL(file));

      const uploadUrl = await genUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      setForm((p: any) => ({ ...p, imageStorageId: json.storageId }));
      toast.success("تم رفع الصورة");
    } catch (e: any) {
      toast.error(e?.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.nameAr || !form.nameEn)
        return toast.error("أكمل اسم المكمل عربي/إنجليزي");
      if (!form.briefAr || !form.briefEn)
        return toast.error("أكمل الملخص عربي/إنجليزي");

      const tags = String(form.tags || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

      const benefitsAr = String(form.benefitsAr || "")
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const benefitsEn = String(form.benefitsEn || "")
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const cautionsAr = String(form.cautionsAr || "")
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const cautionsEn = String(form.cautionsEn || "")
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);

      const refs = String(form.refsText || "")
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((line: string) => {
          const [title, url, source] = line
            .split("|")
            .map((x) => (x || "").trim());
          return { title, url, source: source || undefined };
        })
        .filter((r: any) => r.title && r.url);

      const payload: any = {
        category: form.category,
        evidence: form.evidence,
        tags,

        name: { ar: form.nameAr, en: form.nameEn },
        brief: { ar: form.briefAr, en: form.briefEn },
        function: { ar: form.functionAr || "", en: form.functionEn || "" },
        benefits: { ar: benefitsAr, en: benefitsEn },
        typicalUse: { ar: form.typicalAr || "", en: form.typicalEn || "" },
        cautions: { ar: cautionsAr, en: cautionsEn },

        imageUrl: form.imageUrl
          ? String(form.imageUrl).trim()
          : undefined,
        imageStorageId: form.imageStorageId || undefined,

        refs,
        isActive: !!form.isActive,
      };

      if (!editing) {
        await createItem(payload);
        toast.success("تم إضافة المكمل");
      } else {
        await updateItem({ id: editing._id, patch: payload });
        toast.success("تم تحديث المكمل");
      }

      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
      setLocalPreview("");
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحفظ");
    }
  };

  const runSeed = async () => {
    if (!seedSupplements) return toast.error("Seed غير متاح");
    try {
      const r: any = await seedSupplements({});
      if (r?.already)
        toast.success(`المكملات موجودة بالفعل (${r.count})`);
      else toast.success(`تمت إضافة بيانات فعلية (${r.inserted})`);
    } catch (e: any) {
      toast.error(e?.message || "فشل إضافة البيانات");
    }
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.name?.ar || ""}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal
        open={openForm}
        title={editing ? "تعديل مكمل" : "إضافة مكمل"}
        onClose={() => setOpenForm(false)}
      >
        {/* نموذج المودال كما هو عندك */}
        <form onSubmit={save} className="space-y-4">
          {/* انسخ هنا نفس حقول الفورم من الكود الأصلي بدون تعديل */}
        </form>
      </Modal>

      {/* الشريط العلوي */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            className="input flex-1 bg-[#0a0d08] border border-slate-700 text-slate-50 placeholder:text-slate-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالاسم / التصنيف / الدليل..."
          />
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-slate-600 bg-[#0a0d08]"
            />
            عرض غير المفعّل
          </label>
        </div>

        <div className="flex gap-2">
          {seedSupplements ? (
            <button onClick={runSeed} className="btn-secondary">
              + إضافة بيانات فعلية
            </button>
          ) : null}
          <button onClick={openAdd} className="btn-primary">
            + إضافة مكمل
          </button>
        </div>
      </div>

      {/* قائمة المكملات */}
      {items === undefined ? (
        <div className="text-sm text-slate-300">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-300">لا توجد بيانات</div>
      ) : (
        <div className="space-y-3">
          {items.map((s: any) => {
            const isActive = !!s.isActive;
            const categoryLabel =
              s.category === "performance"
                ? "الأداء"
                : s.category === "health"
                ? "الصحة"
                : "الاستشفاء";

            const evidenceLabel =
              s.evidence === "strong"
                ? "دليل قوي"
                : s.evidence === "moderate"
                ? "دليل متوسط"
                : "دليل محدود";

            return (
              <div
                key={s._id}
                className="rounded-3xl bg-[#0a0d08]/90 border border-[#59f20d]/30 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* صورة + معلومات */}
                <div className="flex-1 min-w-0 flex gap-3">
                  {s.imageResolved || s.imageUrl ? (
                    <img
                      src={s.imageResolved || s.imageUrl}
                      alt={s.name?.ar}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-700"
                    />
                  ) : null}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? "text-[#59f20d]" : "text-slate-400"
                        }`}
                      >
                        {isActive ? "مفعّل" : "غير مفعّل"}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-slate-50 truncate">
                        {s.name?.ar}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                        {categoryLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                        {evidenceLabel}
                      </span>
                      {Array.isArray(s.tags) && s.tags.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 max-w-[150px] truncate">
                          {s.tags.join(", ")}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2">
                      {s.brief?.ar || "—"}
                    </div>
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    onClick={() =>
                      updateItem({
                        id: s._id,
                        patch: { isActive: !s.isActive },
                      })
                    }
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold border transition ${
                      isActive
                        ? "border-[#59f20d] text-[#59f20d] hover:bg-[#59f20d]/10"
                        : "border-slate-600 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {isActive ? "إلغاء تفعيل" : "تفعيل"}
                  </button>
                  <button
                    onClick={() => openEdit(s)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-[#59f20d] text-white hover:bg-[#4ed10a] transition"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => askDelete(s)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   USERS ADMIN
========================= */

function UsersAdmin() {
  const [q, setQ] = useState("");
  const users = useQuery(api.profiles.adminListProfiles, {
    q: q.trim() ? q.trim() : undefined,
  });

  const setRole = useMutation(api.profiles.adminSetUserRole);

  const toggle = async (row: any) => {
    try {
      const nextRole = row.role === "admin" ? "user" : "admin";
      await setRole({ profileId: row._id, role: nextRole });
      toast.success(
        nextRole === "admin"
          ? "تم ترقية المستخدم لأدمن"
          : "تم تحويله لمستخدم عادي"
      );
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    }
  };

  return (
    <div className="space-y-4">
      {/* الشريط العلوي */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            className="input flex-1 bg-[#0a0d08] border border-slate-700 text-slate-50 placeholder:text-slate-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالاسم..."
          />
        </div>
      </div>

      {/* قائمة المستخدمين */}
      {users === undefined ? (
        <div className="text-sm text-slate-300">جاري التحميل...</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-slate-300">لا يوجد مستخدمون</div>
      ) : (
        <div className="space-y-3">
          {users.map((u: any) => {
            const isAdmin = u.role === "admin";
            return (
              <div
                key={u._id}
                className="rounded-3xl bg-[#0a0d08]/90 border border-[#59f20d]/30 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* معلومات المستخدم */}
                <div className="flex-1 min-w-0">
  <div className="flex items-center gap-3">
    <span
      className={`text-xs font-semibold ${
        isAdmin ? "text-amber-300" : "text-slate-400"
      }`}
    >
      {isAdmin ? "مشرف (Admin)" : "مستخدم"}
    </span>
    <div className="flex flex-col min-w-0">
      <span className="text-sm sm:text-base font-semibold text-slate-50 truncate">
        {u.name || "بدون اسم"}
      </span>

      {u.email ? (
        <span className="text-[11px] text-slate-400 truncate">
          {u.email}
        </span>
      ) : null}
    </div>
  </div>

  <div className="mt-1 text-[11px] text-slate-400">
    Role:{" "}
    <b className="font-semibold text-slate-100">{u.role}</b>
  </div>
</div>

                {/* زر تغيير الصلاحية */}
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    onClick={() => toggle(u)}
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-semibold transition ${
                      isAdmin
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-[#59f20d] hover:bg-[#4ed10a] text-white"
                    }`}
                  >
                    {isAdmin ? "إزالة أدمن" : "ترقية لأدمن"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}