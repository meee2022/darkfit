import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Brain, Calendar, ChevronRight, FileText, Sparkles, X, Trophy } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export function WeeklyReportCard() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const userProfile = useQuery(api.profiles.getCurrentProfile);
  // Get report from the db. We'll query weeklyReports using an internal api if we exported it, 
  // but since we only have `saveWeeklyReport` internal mutation, we should fetch it.
  // Assuming we need to add a query for it in `convex/aiPlans.ts` or we just generate it on the fly if missing.
  // For UI, we'll just have a button to "Generate this week's report" and show result.
  
  const generateReport = useAction(api.aiPlans.generateWeeklyReport);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await generateReport();
      setReport(data);
      setIsOpen(true);
    } catch (err) {
      console.error(err);
      alert(isAr ? "حدث خطأ أثناء توليد التقرير." : "Error generating report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-[#111] to-[#0f0f0f] border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{isAr ? "التقرير الأسبوعي الذكي" : "Smart Weekly Report"}</h3>
              <p className="text-zinc-500 text-sm">{isAr ? "رؤى وإحصائيات مدعومة بالذكاء الاصطناعي" : "AI-powered insights & stats"}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full mt-2 py-3 bg-blue-500/10 text-blue-400 font-bold rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20 flex items-center justify-center gap-2 group-hover:border-blue-500/50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-t-2 border-blue-400 rounded-full animate-spin"></div>
              {isAr ? "جاري التحليل..." : "Analyzing..."}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {isAr ? "استخراج التقرير" : "Generate Report"}
            </>
          )}
        </button>
      </div>

      {isOpen && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111] border border-blue-500/20 rounded-3xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 text-center border-b border-white/5 bg-blue-500/5">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border-4 border-[#111] shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <span className="text-3xl font-black text-blue-400">{report.score}/10</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-1">{isAr ? "تقييم الأسبوع" : "Weekly Score"}</h2>
              <p className="text-zinc-400 text-sm">
                {report.score >= 8 ? (isAr ? "أداء ممتاز! استمر." : "Excellent work! Keep it up.") : 
                 report.score >= 5 ? (isAr ? "أداء جيد، لكن يمكنك الأفضل." : "Good, but room for improvement.") :
                 (isAr ? "كان أسبوعاً صعباً، لنعوضه الأسبوع القادم!" : "Tough week, let's bounce back!")}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-white mb-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  {isAr ? "ملخص الأداء" : "Performance Summary"}
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed p-4 bg-white/5 rounded-2xl border border-white/5">
                  {isAr ? report.reportTextAr : (report.reportTextEn || report.reportTextAr)}
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-bold text-white mb-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  {isAr ? "توصيات للأسبوع القادم" : "Next Week's Recommendations"}
                </h3>
                <ul className="space-y-2">
                  {report.recommendations?.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-zinc-300 p-3 bg-white/5 rounded-xl border border-white/5">
                      <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-blue-500 text-white font-black rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
              >
                {isAr ? "رائع!" : "Got it!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
