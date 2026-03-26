import React from "react";
import { ArrowRight } from "lucide-react";

interface ModernSectionCardProps {
  title: string;
  description: string;
  image: string;
  exploreLabel: string;
  onClick?: () => void;
}

export function ModernSectionCard({
  title,
  description,
  image,
  exploreLabel,
  onClick,
}: ModernSectionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#1c1c1c] border border-transparent hover:border-[#59f20d] transition-all duration-300 hover:scale-[1.02] text-right"
    >
      {/* Background Image Area */}
      <div className="relative h-64 w-full overflow-hidden bg-[#111]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-[50%_30%] group-hover:scale-110 transition-transform duration-700"
        />
        {/* Dark gradient from bottom to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
        
        {/* Title placed inside the image overlay, bottom right */}
        <h3 className="absolute bottom-4 right-4 text-2xl font-black text-[#59f20d] drop-shadow-lg">
          {title}
        </h3>
      </div>

      {/* Thin line separating image and content */}
      <div className="h-[1px] w-full bg-white/10" />

      {/* Content Area */}
      <div className="relative p-4 space-y-3 bg-[#1c1c1c]">
        <p className="text-sm text-white/50 leading-relaxed max-w-full font-medium">
          {description}
        </p>

        {/* Arrow and Text */}
        <div className="flex items-center justify-start gap-2 text-[#59f20d] text-sm font-bold pt-1 flex-row-reverse w-fit ml-auto">
          <span>{exploreLabel}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:rtl:-translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}
