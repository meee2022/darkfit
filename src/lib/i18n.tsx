import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================
   Types
========================= */
export type Lang = "ar" | "en";
export type Dir = "rtl" | "ltr";

type Dict = Record<string, { ar: string; en: string }>;

/* =========================
   Dictionary
========================= */
const DICT: Dict = {
  /* App */
  app_tagline: { ar: "لياقة • تغذية • صحة", en: "Fitness • Nutrition • Health" },

  /* Auth (Titles/Sub) */
  sign_in_title: { ar: "Gym Pro", en: "Gym Pro" },
  sign_in_sub: { ar: "رحلتك نحو اللياقة تبدأ هنا", en: "Your fitness journey starts here" },

  /* Auth UI labels */
  email: { ar: "البريد الإلكتروني", en: "Email" },
  password: { ar: "كلمة المرور", en: "Password" },
  new_password: { ar: "كلمة المرور الجديدة", en: "New password" },
  code: { ar: "كود التحقق", en: "Code" },

  sign_in: { ar: "تسجيل الدخول", en: "Sign in" },
  sign_up: { ar: "إنشاء حساب", en: "Sign up" },
  sign_in_anonymous: { ar: "الدخول كضيف", en: "Continue as guest" },

  forgot_password: { ar: "نسيت كلمة المرور؟", en: "Forgot password?" },
  back_to_sign_in: { ar: "رجوع لتسجيل الدخول", en: "Back to sign in" },

  send_reset_code: { ar: "إرسال كود إعادة التعيين", en: "Send reset code" },
  reset_password: { ar: "تغيير كلمة المرور", en: "Reset password" },

  dont_have_account: { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  already_have_account: { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  sign_up_instead: { ar: "إنشاء حساب", en: "Sign up instead" },
  sign_in_instead: { ar: "تسجيل الدخول", en: "Sign in instead" },

  or: { ar: "أو", en: "or" },

  please_wait: { ar: "جاري المعالجة...", en: "Please wait..." },
  sending: { ar: "جاري الإرسال...", en: "Sending..." },
  saving: { ar: "جاري الحفظ...", en: "Saving..." },

  /* Auth validation messages */
  enter_valid_email: { ar: "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.", en: "Please enter a valid email address." },
  password_min_6: { ar: "كلمة المرور يجب ألا تقل عن 6 أحرف.", en: "Password must be at least 6 characters." },
  enter_code: { ar: "من فضلك أدخل كود التحقق.", en: "Please enter the verification code." },

  /* Auth success messages */
  signed_in_success: { ar: "تم تسجيل الدخول بنجاح ✅", en: "Signed in successfully ✅" },
  signed_up_success: { ar: "تم إنشاء الحساب بنجاح ✅", en: "Account created successfully ✅" },
  reset_code_sent: { ar: "تم إرسال كود إعادة التعيين إلى بريدك ✅", en: "Code sent to your email ✅" },
  password_updated: { ar: "تم تغيير كلمة المرور ✅ يمكنك تسجيل الدخول الآن", en: "Password updated ✅ You can sign in now" },

  /* Auth error translations */
  err_account_not_found: { ar: "الحساب غير موجود. من فضلك أنشئ حسابًا أولًا.", en: "Account not found. Please sign up first." },
  err_invalid_password: { ar: "كلمة المرور غير صحيحة. حاول مرة أخرى.", en: "Invalid password. Please try again." },
  err_invalid_email: { ar: "البريد الإلكتروني غير صحيح.", en: "Invalid email address." },
  err_email_exists: { ar: "هذا البريد مسجل بالفعل. جرّب تسجيل الدخول بدلًا من إنشاء حساب.", en: "Email already exists. Try signing in instead." },
  err_rate_limit: { ar: "محاولات كثيرة جدًا. انتظر قليلًا ثم حاول مرة أخرى.", en: "Too many attempts. Please try again later." },
  err_signin_generic: { ar: "تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور.", en: "Could not sign in. Check your email and password." },
  err_signup_generic: { ar: "تعذر إنشاء الحساب. جرّب بريدًا آخر أو كلمة مرور أقوى.", en: "Could not sign up. Try another email or a stronger password." },
  err_reset_code_invalid: { ar: "كود التحقق غير صحيح.", en: "Invalid verification code." },
  err_reset_code_expired: { ar: "انتهت صلاحية كود التحقق. اطلب كودًا جديدًا.", en: "Verification code expired. Request a new one." },
  err_generic: { ar: "حدث خطأ. حاول مرة أخرى.", en: "Something went wrong. Please try again." },

  /* Navigation */
  dashboard: { ar: "الرئيسية", en: "Home" },
  exercises: { ar: "التمارين", en: "Exercises" },
  nutrition: { ar: "التغذية", en: "Nutrition" },
  calculator: { ar: "الحاسبة", en: "Calculator" },
  calculators: { ar: "حاسبات", en: "Calculators" },
  health: { ar: "الصحة", en: "Health" },
  coaches: { ar: "المدربون", en: "Coaches" },
  admin_panel: { ar: "لوحة الإدارة", en: "Admin Panel" },

  /* Account */
  account: { ar: "الحساب", en: "Account" },
  account_settings: { ar: "إعدادات الحساب", en: "Account settings" },

  /* Nutrition common */
  breakfast: { ar: "فطور", en: "Breakfast" },
  lunch: { ar: "غداء", en: "Lunch" },
  dinner: { ar: "عشاء", en: "Dinner" },
  snack: { ar: "سناك", en: "Snack" },

  all_meals: { ar: "كل الوجبات", en: "All meals" },
  all_categories: { ar: "كل الأقسام", en: "All categories" },

  kcal: { ar: "سعرة", en: "kcal" },
  calories_per_100g: { ar: "سعرات / 100جم", en: "Calories / 100g" },

  protein: { ar: "بروتين", en: "Protein" },
  carbs: { ar: "كارب", en: "Carbs" },
  fat: { ar: "دهون", en: "Fat" },
  fiber: { ar: "ألياف", en: "Fiber" },
  sugar: { ar: "سكر", en: "Sugar" },

  /* Dashboard */
  dashboard_welcome: { ar: "مرحباً", en: "Welcome" },
  in_gympro: { ar: "في Gym Pro", en: "to Gym Pro" },
  dashboard_subtitle: {
    ar: "تطبيقك الشامل للياقة البدنية — تمارين، تغذية، صحة",
    en: "Your all-in-one fitness app — workouts, nutrition & health",
  },

  /* Fitness Level */
  fitness_level: { ar: "مستوى اللياقة", en: "Fitness Level" },
  fitness_beginner: { ar: "مبتدئ", en: "Beginner" },
  fitness_intermediate: { ar: "متوسط", en: "Intermediate" },
  fitness_advanced: { ar: "متقدم", en: "Advanced" },
  fitness_unknown: { ar: "غير محدد", en: "Not set" },

  /* Stats */
  completion: { ar: "نسبة الإنجاز", en: "Completion" },
  workout_days: { ar: "أيام تمرين", en: "Workout Days" },
  burned_calories: { ar: "سعرة محروقة", en: "Burned Calories" },

  /* BMI & Workout */
  bmi_title: { ar: "مؤشر كتلة الجسم", en: "Body Mass Index" },
  workout_summary: { ar: "ملخص التمرين", en: "Workout Summary" },
  sessions: { ar: "الجلسات", en: "Sessions" },
  hours: { ar: "الساعات", en: "Hours" },
  calories: { ar: "السعرات", en: "Calories" },

  /* Goals */
  your_goals: { ar: "أهدافك الرياضية", en: "Your Fitness Goals" },
  no_goals: { ar: "لم يتم تحديد أهداف بعد.", en: "No goals have been set yet." },

  /* Health */
  health_desc: {
    ar: "اختر الفئة وستظهر نفس بيانات التغذية المخصصة لها.",
    en: "Pick a category to see tailored nutrition data.",
  },
  diabetes: { ar: "مرضى السكري", en: "Diabetes" },
  seniors: { ar: "كبار السن", en: "Seniors" },
  children: { ar: "الأطفال", en: "Children" },

  /* Common */
  you: { ar: "أنت", en: "you" },
  loading: { ar: "جاري التحميل...", en: "Loading..." },
  no_data: { ar: "لا توجد بيانات", en: "No data" },
  no_results: { ar: "لا توجد نتائج", en: "No results" },

  /* Extra helpful text */
  search_food_placeholder: {
    ar: "ابحث عن عنصر غذائي (مثل: شوفان، دجاج، تفاح...)",
    en: "Search foods (e.g., oats, chicken, apple...)",
  },
  nutrition_how_help_title: {
    ar: "هتستفيد إيه من قسم التغذية؟",
    en: "How does Nutrition help you?",
  },
  nutrition_how_help_1: {
    ar: "اختيار وجبة مناسبة لهدفك بسرعة (تنشيف / تضخيم / ثبات).",
    en: "Quickly pick meals that match your goal (cut / bulk / maintain).",
  },
  nutrition_how_help_2: {
    ar: "ترشيح أطعمة مناسبة لفئتك (سكري/أطفال/كبار السن).",
    en: "Filter foods for your group (diabetes/kids/seniors).",
  },
  nutrition_how_help_3: {
    ar: "تقييم سريع للأكل بناءً على البروتين/الألياف/السكر.",
    en: "Quick scoring based on protein/fiber/sugar.",
  },

  goal_cut: { ar: "تنشيف", en: "Cut" },
  goal_bulk: { ar: "تضخيم", en: "Bulk" },
  goal_maintain: { ar: "ثبات", en: "Maintain" },
  goal_label: { ar: "اختر هدفك", en: "Choose your goal" },

  recommended_for_you: { ar: "مقترح لك", en: "Recommended for you" },

  // ✅ Added by UI fix (Exercise + Calculator)
  active: { ar: "نشط", en: "Active" },
  activity_level: { ar: "مستوى النشاط", en: "Activity level" },
  add_food: { ar: "إضافة طعام", en: "Add food" },
  advanced: { ar: "متقدم", en: "Advanced" },
  age: { ar: "العمر", en: "Age" },
  age_placeholder: { ar: "مثال: 25", en: "e.g., 25" },
  all_levels: { ar: "كل المستويات", en: "All levels" },
  all_types: { ar: "كل الأنواع", en: "All types" },
  back_view: { ar: "خلف", en: "Back" },
  balance: { ar: "توازن", en: "Balance" },
  beginner: { ar: "مبتدئ", en: "Beginner" },
  bulk: { ar: "تضخيم", en: "Bulk" },
  cardio: { ar: "كارديو", en: "Cardio" },
  choose_foods: { ar: "اختر الأطعمة", en: "Choose foods" },
  cm: { ar: "سم", en: "cm" },
  cut: { ar: "تنشيف", en: "Cut" },
  daily_calories_needed: { ar: "السعرات", en: "Calories" },
  daily_needs_smart: { ar: "احتياجك اليومي", en: "Daily needs" },
  exercise_section_desc: { ar: "اختر العضلة أو الفلاتر لعرض التمارين المناسبة.", en: "Pick a muscle or use filters to find exercises." },
  exercise_section_title: { ar: "التمارين", en: "Exercises" },
  exercises_for: { ar: "exercises for", en: "exercises for" },
  fat_hint: { ar: "20% مناسبة للتنشيف، 25% توازن، 30% لو طاقتك قليلة.", en: "20% cut, 25% balanced, 30% if low energy." },
  fat_percentage: { ar: "نسبة الدهون", en: "Fat percentage" },
  female: { ar: "أنثى", en: "Female" },
  flexibility: { ar: "مرونة", en: "Flexibility" },
  food_calculator_title: { ar: "حاسبة وجبة", en: "Meal calculator" },
  formula_note: { ar: "المعادلات تقديرية وقد تختلف حسب الجسم.", en: "Formulas are estimates and can vary by person." },
  front_view: { ar: "أمام", en: "Front" },
  gender: { ar: "النوع", en: "Gender" },
  goal_short_bulk: { ar: "تضخيم", en: "Bulk" },
  goal_short_cut: { ar: "تنشيف", en: "Cut" },
  goal_short_maintenance: { ar: "ثبات", en: "Maintain" },
  height: { ar: "الطول", en: "Height" },
  height_placeholder: { ar: "مثال: 175", en: "e.g., 175" },
  hide_foods: { ar: "إخفاء القائمة", en: "Hide list" },
  intermediate: { ar: "متوسط", en: "Intermediate" },
  kg: { ar: "كجم", en: "kg" },
  light_activity: { ar: "نشاط خفيف", en: "Light" },
  macros_subtitle: { ar: "احسب احتياجك اليومي ووزّع الماكروز بسهولة.", en: "Calculate daily needs and split macros easily." },
  macros_title: { ar: "حساب السعرات والماكروز", en: "Calories & Macros" },
  maintenance: { ar: "ثبات", en: "Maintenance" },
  male: { ar: "ذكر", en: "Male" },
  meals: { ar: "وجبات", en: "meals" },
  men: { ar: "رجال", en: "Men" },
  metabolism_basic: { ar: "معدل الحرق الأساسي", en: "Basal metabolism" },
  moderate_activity: { ar: "نشاط متوسط", en: "Moderate" },
  no_ar_name: { ar: "لا يوجد اسم عربي", en: "No Arabic name" },
  no_en_name: { ar: "لا يوجد اسم إنجليزي", en: "No English name" },
  no_exercises_found: { ar: "لا توجد تمارين مطابقة", en: "No matching exercises found" },
  no_foods_selected: { ar: "لم تختر أي طعام بعد", en: "No foods selected" },
  no_muscle_selected: { ar: "لم يتم اختيار عضلة بعد", en: "No muscle selected yet" },
  per_day: { ar: "في اليوم", en: "Per day" },
  per_meal: { ar: "لكل وجبة", en: "Per meal" },
  pro_mode_note: { ar: "هذه إرشادات عامة وليست بديلًا عن مختص.", en: "General guidance—consult a professional if needed." },
  protein_hint: { ar: "اختيار أعلى مناسب للضخامة أو وقت التنشيف.", en: "Higher for muscle gain or cutting." },
  protein_per_kg: { ar: "البروتين لكل كجم", en: "Protein per kg" },
  result_by_goal: { ar: "النتيجة حسب هدفك", en: "Result by goal" },
  sedentary: { ar: "قليل الحركة", en: "Sedentary" },
  selected_muscle: { ar: "العضلة المختارة", en: "Selected muscle" },
  smart_summary: { ar: "ملخص ذكي", en: "Smart summary" },
  split_title: { ar: "عدد الوجبات", en: "Meals split" },
  strength: { ar: "قوة", en: "Strength" },
  target_calories: { ar: "السعرات المستهدفة", en: "Target calories" },
  tip_bulk: { ar: "زود السعرات تدريجيًا مع تمارين مقاومة.", en: "Increase calories gradually with strength training." },
  tip_cut: { ar: "ركّز على البروتين وقلّل السعرات تدريجيًا.", en: "Prioritize protein and reduce calories gradually." },
  tip_maint: { ar: "حافظ على الاتزان بين البروتين والكارب والدهون.", en: "Keep a balanced macro split." },
  tips_bulk_1: { ar: "زود السعرات 250–500 تدريجيًا.", en: "Increase 250–500 kcal gradually." },
  tips_bulk_2: { ar: "اختر كارب مع بروتين في كل وجبة.", en: "Pair carbs with protein each meal." },
  tips_bulk_3: { ar: "تابع القوة والأوزان أسبوعيًا.", en: "Track strength weekly." },
  tips_bulk_title: { ar: "نصائح للتضخيم", en: "Bulk tips" },
  tips_cut_1: { ar: "اختر بروتين عالي وخضار كثيرة.", en: "High protein + lots of veggies." },
  tips_cut_2: { ar: "قلل السكريات والمقليات.", en: "Reduce sugar and fried foods." },
  tips_cut_3: { ar: "نم جيدًا وراقب خطواتك.", en: "Sleep well and track steps." },
  tips_cut_title: { ar: "نصائح للتنشيف", en: "Cut tips" },
  tips_maint_1: { ar: "حافظ على وجبات ثابتة ومتوازنة.", en: "Keep balanced consistent meals." },
  tips_maint_2: { ar: "راقب وزنك أسبوعيًا.", en: "Monitor weight weekly." },
  tips_maint_3: { ar: "حافظ على تمارين المقاومة.", en: "Keep strength training." },
  tips_maint_title: { ar: "نصائح للثبات", en: "Maintenance tips" },
  tips_title: { ar: "نصائح", en: "Tips" },
  top_cal_source: { ar: "أكبر مصدر للسعرات هو", en: "Top calories source is" },
  total_meal: { ar: "إجمالي الوجبة", en: "Meal total" },
  very_active: { ar: "نشاط عالي جدًا", en: "Very active" },
  weight: { ar: "الوزن", en: "Weight" },
  weight_placeholder: { ar: "مثال: 70", en: "e.g., 70" },
  women: { ar: "نساء", en: "Women" },
  your_goal: { ar: "هدفك", en: "Your goal" },

  /* Exercises – cards & logging */
  show_details: { ar: "عرض التفاصيل", en: "Show details" },
  hide_details: { ar: "إخفاء التفاصيل", en: "Hide details" },
  log_workout: { ar: "تسجيل التمرين", en: "Log workout" },
  workout_logged_success: { ar: "تم تسجيل التمرين بنجاح ✅", en: "Workout logged successfully ✅" },

  how_to_perform: { ar: "طريقة أداء التمرين", en: "How to perform" },
  required_equipment: { ar: "المعدات المطلوبة", en: "Required equipment" },

  minutes: { ar: "دقيقة", en: "min" },
  sets: { ar: "مجموعات", en: "sets" },

  video_not_working_preview: {
    ar: "لا يمكن تشغيل المعاينة هنا، يمكنك مشاهدة الفيديو على يوتيوب.",
    en: "Preview cannot play here, you can watch it on YouTube.",
  },
  watch_video: { ar: "مشاهدة الفيديو", en: "Watch video" },
  opens_youtube_new_tab: {
    ar: "سيفتح الفيديو في نافذة يوتيوب جديدة.",
    en: "Video will open in a new YouTube tab.",
  },

  log_workout_title: { ar: "سجل أدائك في هذا التمرين", en: "Log your performance" },
  duration_minutes: { ar: "المدة (بالدقائق)", en: "Duration (minutes)" },
  number_of_sets: { ar: "عدد المجموعات", en: "Number of sets" },
  reps_and_weight_each_set: {
    ar: "التكرارات والوزن لكل مجموعة",
    en: "Reps and weight per set",
  },
  set: { ar: "مجموعة", en: "Set" },
  reps: { ar: "تكرارات", en: "Reps" },
  weight_kg: { ar: "الوزن (كجم)", en: "Weight (kg)" },
  notes_optional: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  notes_placeholder: {
    ar: "اكتب ملاحظاتك أو شعورك بعد التمرين",
    en: "Write notes or how you felt after the workout",
  },
  save_workout: { ar: "حفظ التمرين", en: "Save workout" },
  cancel: { ar: "إلغاء", en: "Cancel" },

  something_went_wrong: {
    ar: "حدث خطأ ما، حاول مرة أخرى.",
    en: "Something went wrong, please try again.",
  },
};

/* =========================
   Helpers
========================= */
function getDir(lang: Lang) {
  return lang === "ar" ? ("rtl" as const) : ("ltr" as const);
}

/* =========================
   Context
========================= */
type I18nCtx = {
  language: Lang;
  dir: Dir;
  isRTL: boolean;
  setLanguage: (l: Lang) => void;
  t: (key: keyof typeof DICT) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

/* =========================
   Provider
========================= */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>("ar");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "ar") setLanguage(saved);
    } catch {}
  }, []);

  const dir = useMemo(() => getDir(language), [language]);
  const isRTL = dir === "rtl";

  useEffect(() => {
    try {
      localStorage.setItem("lang", language);
    } catch {}

    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const value = useMemo<I18nCtx>(
    () => ({
      language,
      dir,
      isRTL,
      setLanguage,
      t: (key) => {
        const row = DICT[key];
        if (!row) return String(key);
        return row[language] ?? String(key);
      },
    }),
    [language, dir, isRTL]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* =========================
   Hook
========================= */
export function useLanguage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be used within I18nProvider");
  return ctx;
}
