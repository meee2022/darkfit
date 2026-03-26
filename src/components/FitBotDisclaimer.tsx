import { useLanguage } from "../lib/i18n";

export default function FitBotDisclaimer() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <div className="bg-[rgba(57,255,20,0.05)] border border-[#39ff14]/30 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="text-3xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#39ff14] mb-3">
            {isAr ? "إخلاء المسؤولية الطبية" : "Medical Disclaimer"}
          </h3>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] font-bold">•</span>
              <span>{isAr ? <>هذا المساعد <strong>للأغراض التعليمية فقط</strong> وليس بديلاً عن استشارة طبية</> : <>This assistant is <strong>for educational purposes only</strong> and not a substitute for medical advice</>}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] font-bold">•</span>
              <span>{isAr ? <><strong>لا يقدم تشخيصات</strong> أو وصفات طبية أو نصائح علاجية</> : <><strong>Does not provide diagnoses</strong>, prescriptions, or medical advice</>}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] font-bold">•</span>
              <span>{isAr ? "استشر طبيبك دائماً قبل بدء أي برنامج رياضي أو تغذية" : "Always consult your doctor before starting any fitness or nutrition program"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] font-bold">•</span>
              <span className="font-bold">{isAr ? "في حالات الطوارئ: اتصل بالإسعاف 999 (قطر)" : "In emergencies: Call 999 (Qatar)"}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
