import React from "react";
import { useLanguage } from "../lib/i18n";
import { Download, Share2, FileText, CheckCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ReportGenerator() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const profile = useQuery(api.profiles.getCurrentProfile);
  const analytics = useQuery(api.analytics.getComparativeAnalytics);
  const volumeData = useQuery(api.analytics.getTrainingVolume, { weeks: 1 });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isAr ? 'تقرير أدائي في FitApp' : 'My FitApp Performance Report',
          text: isAr ? 'اطلع على تقرير تقدمي الأسبوعي!' : 'Check out my weekly progress report!',
          url: window.location.href, // Or generate a public link if implemented
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      alert(isAr ? "خاصية المشاركة غير مدعومة في متصفحك." : "Web Share API not supported in your browser.");
    }
  };

  if (!profile || !analytics || !volumeData) {
    return (
      <div className="p-6 text-center text-zinc-500 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-[#59f20d] animate-spin mb-2" />
        {isAr ? "جاري تحميل بيانات التقرير..." : "Loading report data..."}
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111] rounded-[2rem] border border-[#59f20d]/20 p-6 shadow-2xl relative overflow-hidden">
      
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#59f20d]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#59f20d]/10 flex items-center justify-center border border-[#59f20d]/20">
              <FileText className="w-6 h-6 text-[#59f20d]" />
          </div>
          <div>
              <h3 className="font-black text-white text-xl leading-tight uppercase tracking-wider">
                  {isAr ? "تقرير الأداء" : "Performance Report"}
              </h3>
              <p className="text-zinc-500 text-sm mt-0.5">
                  {isAr ? "جاهز للمشاركة أو الطباعة (PDF)" : "Ready to share or export to PDF"}
              </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={handleShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors text-sm font-bold border border-white/10"
          >
            <Share2 className="w-4 h-4" />
            {isAr ? "مشاركة" : "Share"}
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#59f20d] hover:bg-[#59f20d]/90 text-black rounded-xl transition-colors text-sm font-black shadow-[0_0_15px_rgba(89,242,13,0.3)]"
          >
            <Download className="w-4 h-4" />
            {isAr ? "تصدير PDF" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Report Preview Surface (what actually gets printed if we wrap in a print media query) */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 relative" id="printable-report">
        
        <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#59f20d] mb-1">DARKFIT RECAP</h1>
            <p className="text-zinc-400 font-medium text-sm">
              {profile.name} • {new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center mx-auto sm:ml-auto">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <CheckCircle className="w-5 h-5 text-[#59f20d]" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{isAr ? "تمارين هذا الشهر" : "Workouts This Month"}</p>
            <p className="text-3xl font-black text-white">{analytics.current.workouts}</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{isAr ? "سعرات محروقة" : "Calories Burned"}</p>
            <p className="text-3xl font-black text-orange-400">{analytics.current.calories.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#59f20d]"></div>
            {isAr ? "العضلات الأكثر تركيزاً (هذا الأسبوع)" : "Top Muscles Trained (This Week)"}
          </h4>
          <div className="space-y-3">
            {volumeData.slice(0, 3).map((v, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium text-sm">{v.muscle}</span>
                <div className="flex-1 mx-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#59f20d]" style={{ width: `${Math.min(100, (v.volume / (volumeData[0]?.volume || 1)) * 100)}%` }}></div>
                </div>
                <span className="text-xs text-zinc-500 font-bold w-12 text-right">{v.volume} <span className="text-[10px]">vol</span></span>
              </div>
            ))}
            {volumeData.length === 0 && (
              <p className="text-xs text-zinc-600 italic text-center w-full">{isAr ? "لا توجد بيانات كافية." : "Not enough data."}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
