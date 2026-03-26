import { useRef, useEffect, useState } from "react";
import { Download, Share2, X, Check, Copy, Palette, Type, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  type: "monthly" | "achievement" | "comparison";
  data: {
    userName?: string;
    titleAr?: string;
    titleEn?: string;
    stats: {
      labelAr: string;
      labelEn: string;
      value: string | number;
      change?: string | number;
      unit?: string;
    }[];
    footerText?: string;
  };
}

export function ShareCard({ isOpen, onClose, type, data }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showName, setShowName] = useState(true);
  const [format, setFormat] = useState<"story" | "post">("story");
  
  const isAr = true; // Assuming RTL for now based on app context

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      drawCard();
    }
  }, [isOpen, showName, format]);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions
    const width = format === "story" ? 1080 : 1080;
    const height = format === "story" ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. Background
    ctx.fillStyle = "#0a0d08";
    ctx.fillRect(0, 0, width, height);

    // 2. Neon Gradient Overlay (Subtle)
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    gradient.addColorStop(0, "rgba(57, 255, 20, 0.05)");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 3. Logo & Brand
    ctx.fillStyle = "#39ff14";
    ctx.font = "bold 60px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("DARKFIT", width - 80, 100);
    
    // Status dot
    ctx.beginPath();
    ctx.arc(width - 45, 85, 8, 0, Math.PI * 2);
    ctx.fill();

    // 4. Main Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 80px Cairo, Inter, sans-serif";
    ctx.textAlign = "center";
    const title = data.titleAr || "تقدمي المذهل";
    ctx.fillText(title, width / 2, height * 0.2);

    // 5. User Name (Optional)
    if (showName && data.userName) {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "500 40px Inter, sans-serif";
      ctx.fillText(`@${data.userName}`, width / 2, height * 0.25);
    }

    // 6. Stats Grid
    const startY = height * 0.35;
    const itemHeight = (height * 0.45) / data.stats.length;

    data.stats.forEach((stat, i) => {
      const y = startY + (i * itemHeight);
      
      // Draw Divider
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, y - itemHeight/2);
      ctx.lineTo(width - 100, y - itemHeight/2);
      ctx.stroke();

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "bold 45px Cairo, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(stat.labelAr, width - 120, y);

      // Value
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 70px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${stat.value}${stat.unit || ""}`, 120, y);

      // Change (if exists)
      if (stat.change) {
          ctx.fillStyle = "#39ff14";
          ctx.font = "bold 35px Inter, sans-serif";
          ctx.fillText(`↑ ${stat.change}`, 120, y + 50);
      }
    });

    // 7. Footer
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "bold 40px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("darkfit.netlify.app", width / 2, height - 100);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `DarkFit-Progress-${type}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("تم تحميل البطاقة بنجاح");
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "progress.png", { type: "image/png" });
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: "DarkFit Progress",
            files: [file],
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback: Copy to clipboard not easily supported for files, so just download
        handleDownload();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0a0d08] border border-zinc-800 rounded-[2.5rem] w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Preview Area */}
        <div className="flex-1 bg-zinc-950 p-6 flex items-center justify-center min-h-[400px]">
          <div className={cn(
               "relative shadow-2xl transition-all duration-500",
               format === "story" ? "aspect-[9/16] h-[500px]" : "aspect-square h-[400px]"
          )}>
               <canvas ref={canvasRef} className="w-full h-full rounded-2xl border border-zinc-700" />
               <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                   <span className="text-[10px] font-black tracking-widest text-[#39ff14] uppercase">{format}</span>
               </div>
          </div>
        </div>

        {/* Controls Area */}
        <div className="w-full md:w-[320px] p-8 border-l border-zinc-800 space-y-8 flex flex-col justify-between bg-[#0d120a]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">تخصيص البطاقة</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6 text-zinc-500" />
              </button>
            </div>

            {/* Toggle Name */}
            <div className="space-y-3">
               <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <UserIcon className="w-3 h-3" /> الخصوصية
               </label>
               <button 
                onClick={() => setShowName(!showName)}
                className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                    showName ? "bg-[#39ff14]/10 border-[#39ff14] text-white" : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
                )}
               >
                 <span className="font-bold">إظهار الاسم</span>
                 {showName ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />}
               </button>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
               <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <Palette className="w-3 h-3" /> الحجم
               </label>
               <div className="grid grid-cols-2 gap-3">
                   {(["story", "post"] as const).map(f => (
                       <button 
                        key={f}
                        onClick={() => setFormat(f)}
                        className={cn(
                            "p-3 rounded-xl border-2 transition-all text-xs font-black uppercase",
                            format === f ? "bg-white text-black border-white" : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
                        )}
                       >
                           {f}
                       </button>
                   ))}
               </div>
            </div>
          </div>

          <div className="space-y-3">
             <button 
                onClick={handleShare}
                className="w-full py-4 bg-[#39ff14] hover:bg-[#32e012] text-black font-black text-lg rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
             >
                <Share2 className="w-5 h-5" />
                مشاركة
             </button>
             <button 
                onClick={handleDownload}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 transition-all"
             >
                <Download className="w-5 h-5" />
                تحميل PNG
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
