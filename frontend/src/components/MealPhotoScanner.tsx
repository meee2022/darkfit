import { useState, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Camera, Upload, X, Utensils, Zap, Loader2 } from "lucide-react";
import { useLanguage } from "../lib/i18n";

interface MealPhotoScannerProps {
  onMealScanned: (meal: any) => void;
}

export function MealPhotoScanner({ onMealScanned }: MealPhotoScannerProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const analyzePhoto = useAction(api.aiPlans.analyzeMealPhoto);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewUrl(base64);
      setIsScanning(true);

      try {
        const result = await analyzePhoto({
          base64Image: base64,
          mimeType: file.type,
        });

        if (result) {
          onMealScanned({
            name: isAr ? result.mealNameAr : result.mealNameEn,
            nameAr: result.mealNameAr,
            calories: result.totalCalories,
            protein: result.macros?.protein || 0,
            carbs: result.macros?.carbs || 0,
            fats: result.macros?.fats || 0,
          });
          setIsOpen(false);
          setPreviewUrl(null);
        }
      } catch (err) {
        console.error("Failed to analyze meal:", err);
        alert(isAr ? "حدث خطأ أثناء تحليل الصورة." : "Failed to analyze image.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-[#59f20d]/20 border border-white/10 hover:border-[#59f20d]/50 transition-all font-bold text-white text-sm"
      >
        <Camera className="w-5 h-5 text-[#59f20d]" />
        {isAr ? "التعرف الذكي على الوجبة" : "Smart Meal Scanner"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => { setIsOpen(false); setPreviewUrl(null); }}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/20 flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-[#59f20d]" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">{isAr ? "تحليل الوجبة بالذكاء الاصطناعي" : "AI Meal Scanner"}</h3>
              <p className="text-sm text-zinc-500 mb-6">
                {isAr ? "التقط صورة لتبدأ في حساب السعرات والمغذيات تلقائياً" : "Take a photo to automatically count calories and macros"}
              </p>

              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden aspect-square flex items-center justify-center mb-6">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 border-t-2 border-[#59f20d] rounded-full animate-spin"></div>
                      <Zap className="w-8 h-8 text-[#59f20d] absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <span className="text-white font-black text-sm">{isAr ? "جاري التحليل..." : "Scanning..."}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-[#59f20d]/50 transition-colors group"
                  >
                    <Upload className="w-6 h-6 text-zinc-500 group-hover:text-[#59f20d]" />
                    <span className="font-bold text-white text-sm">{isAr ? "رفع صورة أو التقاط بالكاميرا" : "Upload or Take Photo"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
