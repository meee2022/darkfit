import React from "react";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-[#1c1c1c] border border-white/[0.08] hover:border-[#59f20d] transition-all duration-300 p-6 text-right">
      <h3 className="mb-4 text-sm font-bold text-white/70">{title}</h3>
      {children}
    </div>
  );
}
