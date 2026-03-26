import { useState, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Camera, Image as ImageIcon, Upload, X, Loader2, Zap, CheckCircle2, Utensils } from "lucide-react";
import { useLanguage } from "../lib/i18n";

interface MealAnalysisResult {
  mealNameAr: string;
  mealNameEn: string;
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  confidence: "high" | "medium" | "low";
}

export function MealPhotoAnalyzer({ onAdd }: { onAdd?: (result: MealAnalysisResult) => void }) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const analyzePhoto = useAction(api.aiPlans.analyzeMealPhoto);
  
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MealAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const base64 = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];
      
      const analysis = await analyzePhoto({
        base64Image: base64,
        mimeType: mimeType
      });
      
      setResult(analysis);
    } catch (err) {
      console.error("Analysis failed:", err);
      alert(isAr ? "فشل تحليل الصورة. تأكد من جودة الصورة والمفتاح الخاص بـ API." : "Failed to analyze image. Check image quality and API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  const tr = (en: string, ar: string) => isAr ? ar : en;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-neon-500 to-neon-600 text-black px-4 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-neon-500/20 hover:scale-105 transition-transform active:scale-95"
      >
        <Camera className="w-4 h-4" />
        {tr("Analyze Meal", "حلل وجبتك بالذكاء الاصطناعي")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-400/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-neon-400" />
                </div>
                <div>
                  <h3 className="font-black text-white">{tr("AI Meal Analysis", "تحليل الوجبة بالذكاء الاصطناعي")}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{tr("BETA VISION TECHNOLOGY", "تقنية الرؤية الذكية - تجريبي")}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-white rounded-full bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square w-full max-w-[300px] mx-auto border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:border-neon-400/50 hover:bg-neon-400/5 transition-all group"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-zinc-500 group-hover:text-neon-400" />
                  </div>
                  <h4 className="text-white font-bold mb-1">{tr("Upload Meal Photo", "ارفع صورة الوجبة")}</h4>
                  <p className="text-zinc-500 text-xs">{tr("Photo must be clear and focus on the food", "يجب أن تكون الصورة واضحة وتركز على الأكل")}</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-xl group">
                    <img src={image} alt="Meal" className="w-full h-full object-cover" />
                    <button 
                      onClick={reset}
                      className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                        <Loader2 className="w-12 h-12 text-neon-400 animate-spin mb-4" />
                        <p className="text-neon-400 font-black animate-pulse">{tr("ANALYZING MACROS...", "جاري تحليل المكونات...")}</p>
                      </div>
                    )}
                  </div>

                  {!result && !isAnalyzing && (
                    <button
                      onClick={handleAnalyze}
                      className="w-full py-4 bg-white text-black font-black text-lg rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5 fill-black" />
                      {tr("Analyze with AI", "ابدأ التحليل الذكي")}
                    </button>
                  )}

                  {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-neon-400/10 border border-neon-400/20 rounded-3xl p-6 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                           <span className="px-2 py-0.5 rounded-md bg-neon-400 text-black text-[10px] font-black uppercase tracking-tighter">AI RESULT</span>
                           <h2 className="text-2xl font-black text-white">{isAr ? result.mealNameAr : result.mealNameEn}</h2>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                          <CheckCircle2 className={`w-3 h-3 ${result.confidence === 'high' ? 'text-neon-400' : 'text-amber-400'}`} />
                          {tr("Confidence:", "نسبة التأكد:")} {result.confidence}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 text-center">
                           <span className="block text-2xl font-black text-white">{result.totalCalories}</span>
                           <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{tr("Calories", "سعرة")}</span>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 text-center">
                           <span className="block text-2xl font-black text-neon-400">{result.macros.protein}g</span>
                           <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{tr("Protein", "بروتين")}</span>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 text-center">
                           <span className="block text-2xl font-black text-blue-400">{result.macros.carbs}g</span>
                           <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{tr("Carbs", "كارب")}</span>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 text-center">
                           <span className="block text-2xl font-black text-amber-400">{result.macros.fats}g</span>
                           <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{tr("Fats", "دهون")}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onAdd?.(result);
                          setIsOpen(false);
                        }}
                        className="w-full py-4 bg-neon-400 text-black font-black text-lg rounded-2xl hover:scale-[1.02] transition-transform shadow-xl shadow-neon-400/20 flex items-center justify-center gap-2"
                      >
                        <Utensils className="w-5 h-5" />
                        {tr("Add to Meal Log", "إضافة إلى السجل الغذائي")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-black/40 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-600 font-medium">
                {tr("AI detection is approximate. Always verify nutrition labels.", "التحليل الذكي تقريبي. دائماً تأكد من الملصقات الغذائية.")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
