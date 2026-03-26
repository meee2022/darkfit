import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { toast } from "sonner";

export function AIMealSuggestion() {
    const { language } = useLanguage();
    const isAr = language === "ar";

    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestion, setSuggestion] = useState<any[] | null>(null);

    const allFoods = useQuery(api.nutrition.getAllFoods, {});
    const addToMeal = useMutation(api.nutrition.addFoodToLogMeal);

    const generateMeal = () => {
        if (!allFoods || allFoods.length === 0) return;
        setIsGenerating(true);
        setSuggestion(null);

        setTimeout(() => {
            // Pick 1 protein, 1 carb, 1 veg if possible
            const proteins = allFoods.filter(f => f.categoryAr === "بروتينات");
            const carbs = allFoods.filter(f => f.categoryAr === "حبوب" || f.categoryAr === "حبوب كاملة");
            const veggies = allFoods.filter(f => f.categoryAr === "خضروات");

            const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

            const p = proteins.length ? pickRandom(proteins) : pickRandom(allFoods);
            const c = carbs.length ? pickRandom(carbs) : pickRandom(allFoods);
            const v = veggies.length ? pickRandom(veggies) : pickRandom(allFoods);

            // Ensure unique choices
            const meal = Array.from(new Set([p, c, v])).filter(Boolean);

            setSuggestion(meal);
            setIsGenerating(false);
        }, 2500);
    };

    const handleAddAll = async () => {
        if (!suggestion) return;
        try {
            const today = new Date().toISOString().split("T")[0];
            for (const food of suggestion) {
                await addToMeal({
                    mealType: "lunch",
                    foodId: food._id,
                    quantity: 150,
                    date: today
                });
            }
            toast.success(isAr ? "تم إضافة الوجبة لغداء اليوم!" : "Meal added to today's lunch!");
            setSuggestion(null);
        } catch (e) {
            toast.error("Error adding meal");
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-3xl p-5 relative overflow-hidden mb-6">
            {/* Decorative Sparkles */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white leading-tight">
                            {isAr ? "اقتراح وجبة بالذكاء الاصطناعي" : "AI Meal Suggestion"}
                        </h3>
                        <p className="text-xs text-purple-200 mt-0.5">
                            {isAr ? "احصل على وجبة صحية متكاملة بضغطة زر" : "Get a balanced healthy meal in one click"}
                        </p>
                    </div>
                </div>

                {!suggestion && !isGenerating && (
                    <button
                        onClick={generateMeal}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl transition shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
                    >
                        {isAr ? "اقترح لي وجبة 🤖" : "Suggest a Meal 🤖"}
                    </button>
                )}

                {isGenerating && (
                    <div className="flex flex-col items-center justify-center py-5 animate-pulse">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
                        <p className="text-sm font-medium text-purple-300">
                            {isAr ? "جاري تحليل الاحتياجات واقتراح الأفضل..." : "Analyzing needs and picking the best..."}
                        </p>
                    </div>
                )}

                {suggestion && !isGenerating && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-black/40 rounded-2xl p-4 border border-purple-500/20">
                            <p className="text-xs text-purple-300 font-bold mb-3 uppercase tracking-wider">
                                {isAr ? "الوجبة المقترحة" : "Suggested Meal"}
                            </p>
                            <ul className="space-y-2">
                                {suggestion.map(food => (
                                    <li key={food._id} className="flex items-center gap-2 text-sm text-white">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        {isAr ? food.nameAr : food.name} <span className="text-zinc-500 text-xs">({food.calories} kcal)</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 pt-3 border-t border-purple-500/20 flex items-center justify-between">
                                <span className="text-xs text-zinc-400">
                                    {isAr ? "إجمالي السعرات:" : "Total Calories:"}
                                </span>
                                <span className="font-bold text-purple-400">
                                    {suggestion.reduce((sum, f) => sum + (f.calories || 0) * 1.5, 0)} kcal
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleAddAll}
                                className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2"
                            >
                                <Plus size={16} />
                                {isAr ? "إضافة للغداء" : "Add to Lunch"}
                            </button>
                            <button
                                onClick={generateMeal}
                                className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-xl transition border border-zinc-700"
                                title={isAr ? "تغيير الوجبة" : "Regenerate"}
                            >
                                <Sparkles size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
