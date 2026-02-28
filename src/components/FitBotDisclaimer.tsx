export default function FitBotDisclaimer() {
  return (
    <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="text-3xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-900 mb-3">
            إخلاء المسؤولية الطبية
          </h3>
          <ul className="space-y-2 text-sm text-red-800">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>هذا المساعد <strong>للأغراض التعليمية فقط</strong> وليس بديلاً عن استشارة طبية</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>لا يقدم تشخيصات</strong> أو وصفات طبية أو نصائح علاجية</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>استشر طبيبك دائماً قبل بدء أي برنامج رياضي أو تغذية</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span className="font-bold">في حالات الطوارئ: اتصل بالإسعاف 999 (قطر)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
