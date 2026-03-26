import React from "react";
import { Phone } from "lucide-react";

interface DashboardFooterProps {
  isAr: boolean;
}

export function DashboardFooter({ isAr }: DashboardFooterProps) {
  return (
    <div className="mt-16 pb-12 flex flex-col items-center justify-center space-y-3 opacity-80" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-bold text-white/70 tracking-widest text-center" dir="ltr">
          &copy; {new Date().getFullYear()} DARK FIT. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/50 tracking-[0.1em]">
          <span>{isAr ? "تطوير وإدارة:" : "Directed by"}</span>
          <span className="text-[#59f20d] font-black">{isAr ? "المهندس محمد" : "Eng. Mohamed"}</span>
        </div>
      </div>
      
      <a 
        href="https://wa.me/97430296555" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#59f20d]/50 hover:bg-[#59f20d]/10 transition-colors group"
      >
        <Phone className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#59f20d] transition-colors" />
        <span className="text-xs font-black text-white/80 group-hover:text-white transition-colors tracking-widest" dir="ltr">
          +974 30296555
        </span>
      </a>
    </div>
  );
}
