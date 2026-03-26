import React, { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Salad,
  Droplets,
  Flame,
  Plus,
  Trash2,
  Minus,
  Utensils,
  ClipboardCheck,
  ScanLine,
  Bell,
  X,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { AIMealSuggestion } from "./AIMealSuggestion";
import { BarcodeScanner } from "./BarcodeScanner";
import { MealPhotoScanner } from "./MealPhotoScanner";
import { useAwardXP } from "./XPBar";

interface NutritionSectionProps {
  targetGroup?: "general" | "diabetes" | "seniors" | "children";
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "";

const CATEGORY_AR_TO_EN: Record<string, string> = {
  فواكه: "Fruits",
  خضروات: "Vegetables",
  بروتينات: "Proteins",
  حبوب: "Grains",
  "حبوب كاملة": "Whole Grains",
  "منتجات الألبان": "Dairy",
  "دهون صحية": "Healthy Fats",
  مكسرات: "Nuts",
  مشروبات: "Drinks",
  "مشروبات بدون سكر": "Sugar-free Drinks",
  شوربات: "Soups",
  "سناكات صحية": "Healthy Snacks",
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function mealLabel(t: any, mt: Exclude<MealType, "">) {
  return mt === "breakfast"
    ? t("breakfast" as any)
    : mt === "lunch"
      ? t("lunch" as any)
      : mt === "dinner"
        ? t("dinner" as any)
        : t("snack" as any);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// Sub-component for the redesigned food card
function FoodCardItem({ 
  food, 
  onAdd, 
  isAr 
}: { 
  food: any; 
  onAdd: (qty: number) => void; 
  isAr: boolean; 
}) {
  const [servings, setServings] = useState(1);
  const servingSize = 100; // default serving

  const name = (isAr ? food.nameAr : food.name) || "بدون اسم";
  const nameSub = (isAr ? food.name : food.nameAr) || "Untitled";

  // Per 100g values
  const baseCals = food.caloriesPer100g || food.calories || 0;
  const baseProt = food.proteinPer100g || food.protein || 0;
  const baseCarbs = food.carbsPer100g || food.carbs || 0;
  const baseFat = food.fatPer100g || food.fat || 0;

  // Totals for selected servings
  const totalCals = Math.round(baseCals * servings);
  const totalProt = (baseProt * servings).toFixed(1);
  const totalCarbs = (baseCarbs * servings).toFixed(1);
  const totalFat = (baseFat * servings).toFixed(1);

  // Quick visual max for macro bar based on total cals (rough approximation: 50% max)
  const macroVisualPct = (macroCals: number) => Math.min(100, (macroCals / Math.max(1, totalCals * 0.5)) * 100);

  return (
    <div className="bg-[#111] rounded-2xl border border-zinc-800 p-4 space-y-4 shadow-lg hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-white flex items-center gap-2">
            🍲 {name}
          </h4>
          <p className="text-sm text-zinc-400 mt-1">{nameSub}</p>
        </div>
        <button 
          onClick={() => onAdd(servings * servingSize)}
          className="px-4 py-2 bg-[#59f20d] text-black font-bold rounded-xl text-sm flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> {isAr ? "إضافة" : "Add"}
        </button>
      </div>

      <div className="flex items-center gap-4 py-3 border-y border-zinc-800">
        <p className="text-sm font-bold text-zinc-300">
          {isAr ? "الحصة:" : "Serving:"} {servingSize} {isAr ? "جم" : "g"}
        </p>
        <div className="flex items-center gap-3 bg-zinc-900 rounded-xl p-1 border border-zinc-700">
          <button 
            onClick={() => setServings(Math.max(0.5, servings - 0.5))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-white hover:bg-zinc-700"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm w-16 text-center">
            {servings} {isAr ? "حصص" : "servings"}
          </span>
          <button 
            onClick={() => setServings(servings + 0.5)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-white hover:bg-zinc-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-zinc-400 font-bold">{isAr ? "السعرات:" : "Calories:"}</span>
          <span className="text-xl font-black text-[#59f20d]">{totalCals} <span className="text-xs text-zinc-500">{isAr ? "سعرة" : "kcal"}</span></span>
        </div>

        <div className="space-y-2">
          {/* Protein */}
          <div className="flex items-center gap-3 text-xs">
            <span className="w-16 text-zinc-400">{isAr ? "بروتين" : "Protein"}</span>
            <span className="w-12 font-bold text-white">{totalProt}g</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${macroVisualPct(baseProt * servings * 4)}%` }} />
            </div>
          </div>
          {/* Carbs */}
          <div className="flex items-center gap-3 text-xs">
            <span className="w-16 text-zinc-400">{isAr ? "كارب" : "Carbs"}</span>
            <span className="w-12 font-bold text-white">{totalCarbs}g</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${macroVisualPct(baseCarbs * servings * 4)}%` }} />
            </div>
          </div>
          {/* Fat */}
          <div className="flex items-center gap-3 text-xs">
            <span className="w-16 text-zinc-400">{isAr ? "دهون" : "Fat"}</span>
            <span className="w-12 font-bold text-white">{totalFat}g</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${macroVisualPct(baseFat * servings * 9)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NutritionSectionDark({ targetGroup = "general" }: NutritionSectionProps) {
  const { language, dir, t } = useLanguage();
  const isAr = language === "ar";

  const [selectedMealType, setSelectedMealType] = useState<MealType>("");
  const [selectedCategoryAr, setSelectedCategoryAr] = useState<string>("");
  const [quickAddMeal, setQuickAddMeal] =
    useState<Exclude<MealType, "">>("breakfast");
  const [grams, setGrams] = useState<number>(150);
  const [foodTab, setFoodTab] = useState<"all" | "byMeal" | "byCategory">(
    "all"
  );

  // Modal state for adding food to meal
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedMealForAdd, setSelectedMealForAdd] = useState<Exclude<MealType, "">>("breakfast");
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [showAllFoods, setShowAllFoods] = useState(false);

  // Notification dismissal state
  const [dismissWaterReminder, setDismissWaterReminder] = useState(false);

  // Quick barcode scanner state for hero area
  const [heroScanMeal, setHeroScanMeal] = useState<Exclude<MealType, "">>('breakfast');

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(foodSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [foodSearchQuery]);

  // Specific category chips selection
  const [selectedChipCategory, setSelectedChipCategory] = useState<string>("all");

  const categoryChips = [
    { id: "all", labelAr: "الكل", labelEn: "All", icon: "🍱" },
    { id: "main", labelAr: "أطباق رئيسية", labelEn: "Main Dishes", icon: "🍛" },
    { id: "grilled", labelAr: "مشاوي", labelEn: "Grilled", icon: "🥩" },
    { id: "appetizers", labelAr: "مقبلات", labelEn: "Appetizers", icon: "🥗" },
    { id: "sweets", labelAr: "حلويات", labelEn: "Sweets", icon: "🍰" },
    { id: "ramadan", labelAr: "أطعمة رمضان", labelEn: "Ramadan Foods", icon: "🌙" },
    { id: "khaliji", labelAr: "خليجي", labelEn: "Khaliji", icon: "🥘" },
    { id: "shami", labelAr: "شامي", labelEn: "Shami", icon: "🧆" },
    { id: "egyptian", labelAr: "مصري", labelEn: "Egyptian", icon: "🫘" },
  ];

  useEffect(() => {
    if (!showFoodModal) {
      document.body.classList.remove('blur-active', 'modal-open');
      document.body.style.overflow = '';
      setFoodSearchQuery(""); // Reset search on close
      setShowAllFoods(false); // Reset toggle on close
    }
  }, [showFoodModal]);

  const foods = useQuery(api.nutrition.getAllFoods, {
    category: selectedCategoryAr || undefined,
    mealType: (selectedMealType || undefined) as any,
    isDiabeticFriendly: targetGroup === "diabetes" ? true : undefined,
    isSeniorFriendly: targetGroup === "seniors" ? true : undefined,
    isChildFriendly: targetGroup === "children" ? true : undefined,
  });

  const filteredModalFoods = useMemo(() => {
    if (!foods) return [];
    
    // 1. Filter by search query (debounced)
    let result = foods;
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) || 
        (f.nameAr && f.nameAr.toLowerCase().includes(q))
      );
    }
    
    // 2. Filter by chip category
    if (selectedChipCategory !== "all") {
      result = result.filter(f => {
        const cat = typeof f.category === 'string' ? f.category : '';
        const lowerCat = cat.toLowerCase();
        
        switch (selectedChipCategory) {
          case 'main': return lowerCat.includes('main') || lowerCat.includes('رئيسي');
          case 'grilled': return lowerCat.includes('grill') || lowerCat.includes('مشاوي');
          case 'appetizers': return lowerCat.includes('appetizer') || lowerCat.includes('مقبلات');
          case 'sweets': return lowerCat.includes('sweet') || lowerCat.includes('حلويات') || lowerCat.includes('dessert');
          case 'ramadan': return f.isRamadan || lowerCat.includes('ramadan') || lowerCat.includes('رمضان');
          case 'khaliji': return lowerCat.includes('khaliji') || lowerCat.includes('gulf') || lowerCat.includes('خليجي');
          case 'shami': return lowerCat.includes('shami') || lowerCat.includes('شامي');
          case 'egyptian': return lowerCat.includes('egyptian') || lowerCat.includes('مصري');
          default: return true;
        }
      });
    }

    // 3. Filter by Meal Type (unless 'showAllFoods' is true)
    if (!showAllFoods) {
      if (selectedMealForAdd === "breakfast") {
        result = result.filter(f => f.mealType === "breakfast" || f.mealType === "any");
      } else if (selectedMealForAdd === "lunch" || selectedMealForAdd === "dinner") {
        result = result.filter(f => f.mealType === "lunch_dinner" || f.mealType === "any" || f.mealType === "lunch" || f.mealType === "dinner");
      } else if (selectedMealForAdd === "snack") {
        result = result.filter(f => f.mealType === "snack" || f.mealType === "any");
      }
    }
    
    return result;
  }, [foods, debouncedQuery, showAllFoods, selectedMealForAdd, selectedChipCategory]);

  const plans = useQuery(api.nutrition.getNutritionPlans, { targetGroup });
  const log = useQuery(api.nutrition.getUserNutritionLog, {
    date: todayISO(),
  });

  const applyPlan = useMutation(api.nutrition.applyPlanToTodayLog);
  const addToMeal = useMutation(api.nutrition.addFoodToLogMeal);
  const updateQty = useMutation(api.nutrition.updateLogMealFoodQuantity);
  const clearLog = useMutation(api.nutrition.clearTodayLog);
  const setWater = useMutation(api.nutrition.setWaterIntake);
  const addScanned = useMutation(api.nutrition.addScannedFoodToLog);
  const awardXP = useAwardXP();

  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const fastingSettings = useQuery(api.fasting.getSettings);
  const isRamadan = fastingSettings?.mode === "ramadan";

  const header = useMemo(() => {
    if (targetGroup === "diabetes") {
      return {
        icon: "🩺",
        title: isAr ? "تغذية لمرضى السكري" : "Diabetes Nutrition",
        desc: isAr
          ? "اختيارات تقلل تذبذب السكر (ألياف أعلى + سكر أقل) مع خطط جاهزة."
          : "Choices that stabilize blood sugar (more fiber, less sugar) with ready plans.",
      };
    }
    if (targetGroup === "seniors") {
      return {
        icon: "👴",
        title: isAr ? "تغذية لكبار السن" : "Seniors Nutrition",
        desc: isAr
          ? "وجبات سهلة تدعم العضلات والعظام وتقلل الإرهاق."
          : "Easy meals that support muscles & bones and reduce fatigue.",
      };
    }
    if (targetGroup === "children") {
      return {
        icon: "👶",
        title: isAr ? "تغذية للأطفال" : "Kids Nutrition",
        desc: isAr
          ? "أفكار وجبات ممتعة ومتوازنة للنمو والطاقة."
          : "Fun, balanced meal ideas for growth and energy.",
      };
    }
    return {
      icon: "🥗",
      title: isAr ? "قسم التغذية" : "Nutrition",
      desc: isAr
        ? "تعرّف على سعراتك اليومية، وطبّق خطة أو سجّل وجباتك بسهولة."
        : "See your daily calories, apply a plan or log meals with ease.",
    };
  }, [targetGroup, isAr]);

  const categoriesShown = useMemo(() => {
    const arList = (() => {
      if (targetGroup === "diabetes")
        return [
          "خضروات",
          "بروتينات",
          "حبوب كاملة",
          "دهون صحية",
          "مشروبات بدون سكر",
        ];
      if (targetGroup === "seniors")
        return ["بروتينات", "منتجات الألبان", "شوربات", "حبوب", "خضروات"];
      if (targetGroup === "children")
        return ["فواكه", "خضروات", "منتجات الألبان", "سناكات صحية", "حبوب"];
      return [
        "فواكه",
        "خضروات",
        "بروتينات",
        "حبوب",
        "منتجات الألبان",
        "دهون صحية",
        "مكسرات",
        "مشروبات",
      ];
    })();

    if (!isAr) return arList.map((ar) => CATEGORY_AR_TO_EN[ar] || ar);
    return arList;
  }, [targetGroup, isAr]);

  const dayCalories = Number(log?.totalDailyCalories || 0);
  const targetCalories = useMemo(() => {
    if (userProfile?.calories) return userProfile.calories;
    if (targetGroup === "children") return 1600;
    if (targetGroup === "seniors") return 1800;
    if (targetGroup === "diabetes") return 1900;
    return 2200;
  }, [targetGroup, userProfile]);

  const progress = Math.min(
    100,
    Math.round((dayCalories / Math.max(1, targetCalories)) * 100)
  );
  const waterMl = Number(log?.waterIntake || 0);

  const foodName = (f: any) =>
    (isAr ? f.nameAr : f.name) || (isAr ? "بدون اسم" : "Untitled");
  const foodSubName = (f: any) => (isAr ? f.name : f.nameAr);

  const mealTypesArr: Array<Exclude<MealType, "">> = [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
  ];

  const mealBlocks = useMemo(() => {
    const meals = log?.meals || [];
    const byType: Record<string, any> = {};
    for (const m of meals) byType[m.mealType] = m;
    return mealTypesArr.map(
      (mt) => byType[mt] || { mealType: mt, foods: [], totalCalories: 0 }
    );
  }, [log]);

  async function onApplyPlan(planId: string) {
    await applyPlan({ planId: planId as any, mode: "merge" });
  }

  async function onQuickAdd(foodId: string) {
    await addToMeal({
      mealType: quickAddMeal as any,
      foodId: foodId as any,
      quantity: grams,
      date: todayISO(),
    });
  }

  async function onInc(mt: any, foodId: any, current: number) {
    await updateQty({
      mealType: mt,
      foodId,
      quantity: current + 50,
      date: todayISO(),
    });
  }
  async function onDec(mt: any, foodId: any, current: number) {
    const next = Math.max(0, current - 50);
    await updateQty({
      mealType: mt,
      foodId,
      quantity: next,
      date: todayISO(),
    });
  }
  async function onRemove(mt: any, foodId: any) {
    await updateQty({ mealType: mt, foodId, quantity: 0, date: todayISO() });
  }

  return (
    <div
      dir={dir}
      lang={language}
      className="min-h-screen bg-black text-white py-6 px-4 space-y-5"
    >
      {/* Header with Search */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#59f20d] flex items-center justify-center">
          <Salad className="h-6 w-6 text-black" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={isAr ? "ابحث عن طعام أو احسب السعرات الحرارية..." : "Search food..."}
            className="w-full bg-zinc-900 text-white placeholder-gray-500 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#59f20d]/50"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Daily Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111]/80 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 space-y-4 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#59f20d]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{isAr ? "الملخص اليومي" : "Daily Summary"}</h3>
            <p className="text-sm text-gray-400">
              {new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
            <MealPhotoScanner 
              onMealScanned={(meal) => {
                addScanned({
                  mealType: 'snack', // Defaulting to snack, they can edit later
                  barcode: 'ai-scanned',
                  foodData: {
                    nameEn: meal.nameEn || meal.name,
                    nameAr: meal.nameAr || meal.name,
                    calories: meal.calories,
                    protein: meal.protein,
                    carbs: meal.carbs,
                    fat: meal.fats,
                  }
                });
                alert(isAr ? "تمت إضافة الوجبة لسناكات اليوم!" : "Meal added to today's snacks!");
              }}
            />
            <BarcodeScanner
              onAddFood={(food, mealType) => {
                addScanned({
                  mealType: mealType as any,
                  barcode: food.barcode,
                  foodData: {
                    nameEn: food.nameEn,
                    nameAr: food.nameAr,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                  }
                });
              }}
              triggerLabel={isAr ? "مسح الباركود" : "Scan QR"}
              triggerClassName="px-4 py-3 sm:py-2 bg-[#59f20d]/10 border border-[#59f20d] rounded-2xl text-[#59f20d] text-sm font-bold hover:bg-[#59f20d]/20 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center py-6">
          <div className="relative w-full max-w-[16rem] aspect-square mx-auto">
            <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="150"
                cy="150"
                r="130"
                stroke="#1a1a1a"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="150"
                cy="150"
                r="130"
                stroke="#59f20d"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 130}`}
                strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)
                  }`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-sm text-gray-400 mb-1">
                {isAr ? "إجمالي السعرات اليومية" : "Total Daily Calories"}
              </div>
              <div className="text-5xl font-black">{dayCalories}</div>
              <div className="text-sm text-[#59f20d] mt-1">
                {isAr ? "سعرة حرارية" : "calories"}
              </div>
            </div>
          </div>
        </div>

        {/* Macro Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-400">{isAr ? "بروتين" : "Protein"}</div>
            <div className="text-2xl font-black text-white">{Math.round(dayCalories * 0.3 / 4)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{isAr ? "كاربوهيدرات" : "Carbs"}</div>
            <div className="text-2xl font-black text-white">{Math.round(dayCalories * 0.5 / 4)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{isAr ? "دهون" : "Fat"}</div>
            <div className="text-2xl font-black text-white">{Math.round(dayCalories * 0.2 / 9)}</div>
          </div>
        </div>

        {/* Macro Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{isAr ? "بروتين" : "Protein"} (30%)</span>
              <span className="text-white">
                {Math.round(dayCalories * 0.3 / 4)}g / {Math.round(targetCalories * 0.3 / 4)}g
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dayCalories / Math.max(1, targetCalories)) * 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-[#59f20d] rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{isAr ? "كاربوهيدرات" : "Carbs"} (50%)</span>
              <span className="text-white">
                {Math.round(dayCalories * 0.5 / 4)}g / {Math.round(targetCalories * 0.5 / 4)}g
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dayCalories / Math.max(1, targetCalories)) * 100)}%` }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{isAr ? "دهون" : "Fat"} (20%)</span>
              <span className="text-white">
                {Math.round(dayCalories * 0.2 / 9)}g / {Math.round(targetCalories * 0.2 / 9)}g
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dayCalories / Math.max(1, targetCalories)) * 100)}%` }}
                transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Water Intake */}
      <div className="bg-zinc-900 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <button
            onClick={() => setWater({ waterIntake: waterMl + 250, date: todayISO() })}
            className="w-12 h-12 rounded-full bg-[#59f20d] flex items-center justify-center flex-shrink-0 hover:scale-110 active:scale-95 transition-transform shadow-[0_0_12px_rgba(89,242,13,0.3)]"
          >
            <Plus className="w-6 h-6 text-black" />
          </button>
          <button
            onClick={() => setWater({ waterIntake: Math.max(0, waterMl - 250), date: todayISO() })}
            disabled={waterMl === 0}
            className="w-12 h-12 rounded-full bg-zinc-800 disabled:opacity-50 text-gray-400 flex items-center justify-center flex-shrink-0 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <Minus className="w-6 h-6" />
          </button>
          <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
              const regionSettings = useQuery(api.regionSettings.getSettings);
              const hotMode = regionSettings?.hotClimateMode || "auto";
              const targetWater = regionSettings?.waterReminderBoost ? 3000 : 2000;
              if (i > targetWater / 250) return null;

              return (
                <motion.div
                  key={i}
                  animate={{ height: waterMl >= i * 250 ? 32 : 20, opacity: waterMl >= i * 250 ? 1 : 0.35 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "w-2 rounded-full",
                    waterMl >= i * 250
                      ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]"
                      : "bg-zinc-700"
                  )}
                />
              );
            })}
          </div>
          <div>
            <div className="text-sm font-bold">{isAr ? "شرب الماء" : "Water Intake"}</div>
            {(() => {
              const regionSettings = useQuery(api.regionSettings.getSettings);
              const targetWater = regionSettings?.waterReminderBoost ? 3000 : 2000;
              return (
                <div className="text-xs text-gray-400">
                  {waterMl}ml {isAr ? `من ${targetWater} ml` : `of ${targetWater} ml`}
                </div>
              );
            })()}
          </div>
        </div>
        <Droplets className="h-8 w-8 text-blue-400 flex-shrink-0" />
      </div>

      {/* AI Meal Suggestion */}
      <AIMealSuggestion />

      {/* Daily Meals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{isAr ? "الوجبات اليومية" : "Daily Meals"}</h3>
          <button
            onClick={() => clearLog({ date: todayISO() })}
            className="text-sm text-[#59f20d]"
          >
            {isAr ? "تعديل خطة" : "Edit Plan"}
          </button>
        </div>

        {/* Meal Cards */}
        {mealBlocks.map((meal) => {
          let mealName = mealLabel(t, meal.mealType);
          let mealIcon = meal.mealType === "breakfast" ? "🍳" :
            meal.mealType === "lunch" ? "🥗" :
              meal.mealType === "dinner" ? "🍽️" : "🍎";
          
          let targetText = "";

          if (isRamadan) {
            if (meal.mealType === "breakfast") {
               mealName = isAr ? "الإفطار" : "Iftar";
               mealIcon = "🍲";
               targetText = `(الهدف: ${Math.round(targetCalories * 0.6)} سعرة)`;
            } else if (meal.mealType === "dinner") {
               mealName = isAr ? "السحور" : "Suhoor";
               mealIcon = "🌙";
               targetText = `(الهدف: ${Math.round(targetCalories * 0.4)} سعرة)`;
            } else if (meal.mealType === "snack") {
               mealName = isAr ? "سناك رمضاني" : "Ramadan Snack";
               mealIcon = "☕";
            } else if (meal.mealType === "lunch") {
               // Lunch is not typically eaten in Ramadan, but we keep it available
               mealName = isAr ? "وجبة إضافية" : "Extra Meal";
            }
          }

          return (
            <div
              key={meal.mealType}
              className="bg-zinc-900 rounded-3xl border-2 border-[#59f20d]/10 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMealForAdd(meal.mealType as any);
                        setShowFoodModal(true);
                      }}
                      className="w-10 h-10 rounded-full bg-[#59f20d] flex items-center justify-center hover:scale-110 transition-transform"
                      title={isAr ? "إضافة طعام" : "Add food"}
                    >
                      <Plus className="w-5 h-5 text-black" />
                    </button>
                    <BarcodeScanner
                      onAddFood={(food, mealType) => {
                        addScanned({
                          mealType: mealType as any,
                          barcode: food.barcode,
                          foodData: {
                            nameEn: food.nameEn,
                            nameAr: food.nameAr,
                            calories: (food as any).caloriesPer100g || food.calories || 0,
                            protein: (food as any).proteinPer100g || food.protein || 0,
                            carbs: (food as any).carbsPer100g || food.carbs || 0,
                            fat: (food as any).fatPer100g || food.fat || 0,
                          }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold flex items-center gap-2">
                      <span>{mealIcon}</span>
                      {mealName}
                    </h4>
                    <p className="text-xs text-gray-400">
                      <span className={meal.totalCalories > 0 ? "text-[#59f20d] font-bold" : ""}>
                        {meal.totalCalories}
                      </span> {isAr ? "سعرة" : "kcal"} {targetText && <span className="text-zinc-500 ml-1">{targetText}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{isAr ? "وجبة" : "Meal"}</div>
                  <div className="text-sm font-bold">{meal.foods.length} {isAr ? "عناصر" : "items"}</div>
                </div>
              </div>

              {/* Foods in this meal */}
              {meal.foods.length > 0 ? (
                <div className="space-y-2 mt-3 pt-3 border-t border-zinc-800">
                  {meal.foods.map((f: any) => {
                    const food = foods?.find((fd) => fd._id === f.foodId);
                    if (!food) return null;
                    return (
                      <div key={f.foodId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDec(meal.mealType, f.foodId, f.quantity)}
                            className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm">{foodName(food)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{f.quantity}g</span>
                          <button
                            onClick={() => onInc(meal.mealType, f.foodId, f.quantity)}
                            className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onRemove(meal.mealType, f.foodId)}
                            className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center ml-1"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    {isAr
                      ? `لم يتم تسجيل وجبة ${mealName} بعد`
                      : `No ${mealName} logged yet`}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedMealForAdd(meal.mealType as any);
                      setShowFoodModal(true);
                    }}
                    className="px-3 py-1.5 bg-[#59f20d]/10 hover:bg-[#59f20d]/20 border border-[#59f20d]/30 rounded-xl text-[#59f20d] text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    {isAr ? "سجل الآن" : "Log Now"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Meal Suggestion */}
      <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl p-5 flex items-center gap-4 backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-orange-50">{isAr ? "وجبات خفيفة" : "Snack Meals"}</h4>
          <p className="text-xs text-orange-200/60 mt-0.5">{isAr ? "6-7 وجبات • مستحسنة" : "6-7 meals • Recommended"}</p>
        </div>
        <button 
          onClick={() => {
            setSelectedMealForAdd("snack");
            setShowFoodModal(true);
          }}
          className="ml-auto w-10 h-10 rounded-full bg-[#59f20d] flex items-center justify-center shadow-[0_0_15px_rgba(89,242,13,0.3)] hover:scale-110 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 text-black" />
        </button>
      </div>



      {/* Floating Add Button */}
      <button 
        onClick={() => {
          setSelectedMealForAdd("breakfast"); // default
          setShowFoodModal(true);
        }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#59f20d] flex items-center justify-center shadow-[0_0_25px_rgba(89,242,13,0.5)] hover:scale-110 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-7 h-7 text-black" />
      </button>

      {/* Food Selection Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-3xl border-2 border-[#59f20d]/30 p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {isAr ? "اختر الطعام" : "Select Food"}
              </h3>
              <button
                onClick={() => setShowFoodModal(false)}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Search and Filter */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={isAr ? "ابحث عن طعام..." : "Search food..."}
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  className="w-full bg-zinc-800 text-white placeholder-gray-500 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#59f20d]/50"
                  dir={dir}
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {categoryChips.map((chip) => {
                  // Only show ramadan chip if in ramadan mode
                  if (chip.id === 'ramadan' && !isRamadan) return null;
                  
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setSelectedChipCategory(chip.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border flex items-center gap-2",
                        selectedChipCategory === chip.id
                          ? "bg-[#59f20d] border-[#59f20d] text-black shadow-[0_0_15px_rgba(89,242,13,0.3)]"
                          : "bg-zinc-800 border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-700 hover:border-zinc-600"
                      )}
                    >
                      <span>{chip.icon}</span> {isAr ? chip.labelAr : chip.labelEn}
                    </button>
                  );
                })}
              </div>

              {/* Meal Type Override (Show All toggle) */}
              <div className="flex items-center justify-between py-1 px-1">
                <p className="text-xs text-zinc-500 font-bold">
                  {isAr ? "فرز حسب الوجبة:" : "Filter by Meal:"}
                </p>
                <button
                  onClick={() => setShowAllFoods(!showAllFoods)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border flex items-center gap-1",
                    showAllFoods 
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-500" 
                      : "bg-[#59f20d]/20 border-[#59f20d]/50 text-[#59f20d]"
                  )}
                >
                  {showAllFoods ? (isAr ? "عرض الكل محدد" : "Showing All") : (isAr ? "مقتصر على الوجبة الحالية" : "Limited to Current Meal")}
                </button>
              </div>
            </div>

            {/* Food List */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-4">
              {filteredModalFoods && filteredModalFoods.length > 0 ? (
                filteredModalFoods.map((food) => (
                  <FoodCardItem
                    key={food._id}
                    food={food}
                    isAr={isAr}
                    onAdd={async (qty) => {
                      await addToMeal({
                        mealType: selectedMealForAdd as any,
                        foodId: food._id as any,
                        quantity: qty,
                        date: todayISO(),
                      });
                      // Award XP for logging a meal
                      awardXP("meal");
                      setShowFoodModal(false);
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center opacity-60">
                  <div className="text-4xl mb-3">🍽️</div>
                  <p className="text-white font-bold">{isAr ? "لا توجد أطعمة هنا" : "No foods found"}</p>
                  <p className="text-xs text-zinc-500 mt-1">{isAr ? "جرب البحث بكلمة أخرى أو تصفح الأقسام" : "Try another search term or browse categories"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacer for Navigation */}
      <div className="h-20"></div>
    </div>
  );
}
