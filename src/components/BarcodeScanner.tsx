import React, { useState, useEffect, useRef } from "react";
import { X, ScanLine, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "../lib/i18n";

interface ScannedFood {
    barcode: string;
    nameEn: string;
    nameAr: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    brand?: string;
    image?: string;
}

interface BarcodeScannerProps {
    onAddFood?: (food: ScannedFood, mealType: string) => void;
}

export function BarcodeScanner({ onAddFood }: BarcodeScannerProps) {
    const { language } = useLanguage();
    const isAr = language === "ar";

    const [isOpen, setIsOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [manualBarcode, setManualBarcode] = useState("");
    const [scannedFood, setScannedFood] = useState<ScannedFood | null>(null);
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState("lunch");
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Arabic food name translator
    const ARABIC_MAP: Record<string, string> = {
        chicken: "دجاج", beef: "لحم بقري", fish: "سمك", milk: "حليب",
        yogurt: "زبادي", cheese: "جبن", bread: "خبز", rice: "أرز",
        pasta: "معكرونة", oat: "شوفان", apple: "تفاح", banana: "موز",
        orange: "برتقال", chocolate: "شوكولاتة", coffee: "قهوة", juice: "عصير",
        water: "ماء", egg: "بيض", tuna: "تونة", salmon: "سلمون",
        almond: "لوز", peanut: "فول سوداني", walnut: "جوز",
    };

    const translateName = (name: string) => {
        const lower = name.toLowerCase();
        for (const [key, ar] of Object.entries(ARABIC_MAP)) {
            if (lower.includes(key)) return `${ar} (${name})`;
        }
        return name;
    };

    const lookupBarcode = async (code: string) => {
        if (!code.trim()) return;
        try {
            setLoading(true);
            setError("");
            setScannedFood(null);
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code.trim()}.json`);
            const data = await res.json();

            if (data.status !== 1 || !data.product) {
                setError(isAr ? "لم يتم العثور على هذا المنتج في قاعدة البيانات" : "Product not found in database");
                return;
            }

            const p = data.product;
            const n = p.nutriments || {};
            const nameEn = p.product_name || p.product_name_en || (isAr ? "منتج غير معروف" : "Unknown product");
            const cal = n["energy-kcal_100g"] || n["energy-kcal"] || 0;

            setScannedFood({
                barcode: code,
                nameEn,
                nameAr: translateName(nameEn),
                calories: Math.round(cal),
                protein: Math.round(n.proteins_100g || 0),
                carbs: Math.round(n.carbohydrates_100g || 0),
                fat: Math.round(n.fat_100g || 0),
                brand: p.brands,
                image: p.image_front_small_url,
            });
        } catch {
            setError(isAr ? "فشل الاتصال بقاعدة بيانات الأطعمة" : "Failed to connect to food database");
        } finally {
            setLoading(false);
        }
    };

    // Camera scanning using ZXing bundled via jsDelivr
    const startCamera = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setScanning(true);

            // Load ZXing from CDN dynamically
            const { BrowserMultiFormatReader } = await import(
                /* @vite-ignore */
                "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js" as any
            ).catch(() => ({ BrowserMultiFormatReader: null }));

            if (!BrowserMultiFormatReader) {
                // Fallback: manual entry only
                toast.info(isAr ? "الكاميرا تعمل — أدخل الباركود يدوياً إذا لم تعمل المسح" : "Camera works — enter barcode manually if scan fails");
                return;
            }

            const codeReader = new BrowserMultiFormatReader();
            codeReader.decodeFromVideoElement(videoRef.current, (result: any, err: any) => {
                if (result) {
                    codeReader.reset();
                    lookupBarcode(result.getText());
                    stopCamera();
                }
            });
        } catch {
            setError(isAr ? "تعذّر الوصول إلى الكاميرا — أدخل الباركود يدوياً" : "Could not access camera — enter barcode manually");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setScanning(false);
    };

    const handleClose = () => {
        stopCamera();
        setIsOpen(false);
        setScannedFood(null);
        setError("");
        setManualBarcode("");
    };

    const handleAddToMeal = () => {
        if (!scannedFood) return;
        if (onAddFood) {
            onAddFood(scannedFood, selectedMeal);
        }
        const successMsg = isAr 
            ? `✓ تمت إضافة "${scannedFood.nameAr}" إلى ${selectedMeal === "breakfast" ? "الفطور" : selectedMeal === "lunch" ? "الغداء" : selectedMeal === "dinner" ? "العشاء" : "سناك"}`
            : `✓ Added "${scannedFood.nameEn}" to ${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}`;
        toast.success(successMsg);
        handleClose();
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition text-sm font-semibold"
            >
                <ScanLine size={18} />
                {isAr ? "مسح باركود" : "Scan Barcode"}
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
                    <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <ScanLine className="text-blue-400" size={22} />
                                {isAr ? "مسح باركود الطعام" : "Scan Food Barcode"}
                            </h2>
                            <button onClick={handleClose} className="text-zinc-400 hover:text-white transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Camera view */}
                            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-700">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                />
                                {!scanning && !scannedFood && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                        <ScanLine className="text-zinc-600" size={48} />
                                        <p className="text-zinc-500 text-sm">{isAr ? "اضغط لتشغيل الكاميرا" : "Click to start camera"}</p>
                                    </div>
                                )}
                                {scanning && (
                                    <>
                                        {/* Scan overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-48 h-28 border-2 border-blue-400 rounded-lg relative">
                                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400 rounded-br" />
                                                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-400/60 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-3 inset-x-0 text-center text-xs text-blue-300 animate-pulse">
                                            {isAr ? "جاري المسح..." : "Scanning..."}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Camera toggle */}
                            {!scanning ? (
                                <button
                                    onClick={startCamera}
                                    className="w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/20 transition flex items-center justify-center gap-2"
                                >
                                    <ScanLine size={18} /> {isAr ? "تشغيل الكاميرا" : "Start Camera"}
                                </button>
                            ) : (
                                <button
                                    onClick={stopCamera}
                                    className="w-full py-2 rounded-2xl bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 transition"
                                >
                                    {isAr ? "إيقاف الكاميرا" : "Stop Camera"}
                                </button>
                            )}

                            {/* Manual input */}
                            <div className="flex gap-2" dir={isAr ? "rtl" : "ltr"}>
                                <input
                                    className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                                    placeholder={isAr ? "أو أدخل الباركود يدوياً..." : "Or enter barcode manually..."}
                                    value={manualBarcode}
                                    onChange={e => setManualBarcode(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && lookupBarcode(manualBarcode)}
                                />
                                <button
                                    onClick={() => lookupBarcode(manualBarcode)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition disabled:opacity-50"
                                >
                                    {loading ? "..." : (isAr ? "بحث" : "Search")}
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Result */}
                            {scannedFood && (
                                <div className="bg-zinc-800 rounded-2xl p-4 space-y-3 border border-[#59f20d]/30">
                                    <div className="flex items-start gap-3">
                                        {scannedFood.image && (
                                            <img src={scannedFood.image} alt={scannedFood.nameEn}
                                                className="w-14 h-14 object-contain rounded-xl bg-white" />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <CheckCircle className="text-[#59f20d]" size={16} />
                                                <span className="text-xs text-[#59f20d] font-semibold">{isAr ? "تم المسح بنجاح" : "Scanned successfully"}</span>
                                            </div>
                                            <h3 className="font-bold text-white leading-tight">{isAr ? scannedFood.nameAr : scannedFood.nameEn}</h3>
                                            {scannedFood.brand && (
                                                <span className="text-xs text-zinc-400">{scannedFood.brand}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Macros */}
                                    <div className="grid grid-cols-4 gap-2 text-center" dir={isAr ? "rtl" : "ltr"}>
                                        {[
                                            { label: isAr ? "سعرات" : "Cal", val: scannedFood.calories, color: "text-[#59f20d]" },
                                            { label: isAr ? "بروتين" : "Pro", val: `${scannedFood.protein}g`, color: "text-blue-400" },
                                            { label: isAr ? "كارب" : "Carb", val: `${scannedFood.carbs}g`, color: "text-yellow-400" },
                                            { label: isAr ? "دهون" : "Fat", val: `${scannedFood.fat}g`, color: "text-orange-400" },
                                        ].map(({ label, val, color }) => (
                                            <div key={label} className="bg-zinc-900 rounded-xl p-2">
                                                <div className={`text-sm font-bold ${color}`}>{val}</div>
                                                <div className="text-[10px] text-zinc-500">{label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Meal selector */}
                                    <select
                                        value={selectedMeal}
                                        onChange={e => setSelectedMeal(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm"
                                        dir={isAr ? "rtl" : "ltr"}
                                    >
                                        <option value="breakfast">{isAr ? "فطور" : "Breakfast"}</option>
                                        <option value="lunch">{isAr ? "غداء" : "Lunch"}</option>
                                        <option value="dinner">{isAr ? "عشاء" : "Dinner"}</option>
                                        <option value="snack">{isAr ? "سناك" : "Snack"}</option>
                                    </select>

                                    <button
                                        onClick={handleAddToMeal}
                                        className="w-full py-3 rounded-2xl bg-[#59f20d] text-black font-bold flex items-center justify-center gap-2 hover:bg-[#4ed10a] transition"
                                    >
                                        <Plus size={18} />
                                        {isAr ? "أضف للوجبة" : "Add to Meal"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
