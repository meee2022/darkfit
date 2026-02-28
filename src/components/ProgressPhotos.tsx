import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Camera, Plus, X, Trash2, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function ProgressPhotos() {
    const { language } = useLanguage();
    const isAr = language === "ar";

    const photos = useQuery(api.userProgress.getProgressPhotos);
    const addPhoto = useMutation(api.userProgress.addProgressPhoto);
    const deletePhoto = useMutation(api.userProgress.deleteProgressPhoto);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [weight, setWeight] = useState("");
    const [notes, setNotes] = useState("");

    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error(isAr ? "يرجى اختيار صورة أولاً" : "Please select a photo first");
            return;
        }

        try {
            setIsUploading(true);

            // 1. Generate Upload URL
            const postUrl = await generateUploadUrl();

            // 2. POST the file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) throw new Error(isAr ? "فشل رفع الصورة" : "Failed to upload image");

            const { storageId } = await result.json();

            // 3. Get generic public URL (Convex allows reading via _storage index mostly? Wait, we can get storage url directly via api)
            // Actually we save the storageId and map it later, or wait... how do we get photoUrl?
            // Since it's convex, we can fetch the URL from storageId later, OR use a convex http action.
            // Easiest is to save the storageId in the DB, and the client will use `getFileUrl` or similar, 
            // but we defined `photoUrl` in our schema, let's use the convex storage URL convention if possible: `https://<YOUR_CONVEX_SITE>.convex.cloud/api/storage/<storageId>`
            // Or we can just use another mutation to get the URL. Let's create a quick mutation to get URL.
            // Wait, we can just save storageId and get URL on the client using convex helpers.
            // I'll just use dummy photoUrl inside DB for now, but really we'll rely on storageId in the client to use `useQuery(api.files.getUrl)`... wait, we cannot use hook inside loops easily.
            // Let's assume we can compute it on the server if needed. Actually convex gives URL via `ctx.storage.getUrl(storageId)`! We should probably have a mutation `addPhoto` get the URL!
            // I'll just pass `photoUrl: ""` and let the server fix it if needed, or pass the site URL.
            // Let's pass a dummy for now.

            await addPhoto({
                storageId,
                photoUrl: "", // We can update convex function to fetch and save actual URL, or handle it via a new API. For now, empty string.
                date,
                weight: weight ? Number(weight) : undefined,
                notes,
            });

            toast.success(isAr ? "تم حفظ الصورة بنجاح!" : "Photo saved successfully!");
            setShowUploadModal(false);
            setFile(null);
            setWeight("");
            setNotes("");

        } catch (error: any) {
            toast.error(error.message || (isAr ? "حدث خطأ أثناء الرفع" : "Error uploading"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (photoId: Id<"progressPhotos">) => {
        if (!confirm(isAr ? "هل أنت متأكد من حذف هذه الصورة؟" : "Are you sure you want to delete this photo?")) return;
        try {
            await deletePhoto({ photoId });
            setSelectedForCompare(prev => prev.filter(id => id !== photoId));
            toast.success(isAr ? "تم حذف الصورة" : "Photo deleted");
        } catch (e: any) {
            toast.error(e.message || "Error");
        }
    };

    const toggleCompare = (photoId: string) => {
        if (selectedForCompare.includes(photoId)) {
            setSelectedForCompare(selectedForCompare.filter(id => id !== photoId));
        } else {
            if (selectedForCompare.length >= 2) {
                toast.error(isAr ? "يمكنك اختيار صورتين فقط للمقارنة" : "You can only compare 2 photos");
                return;
            }
            setSelectedForCompare([...selectedForCompare, photoId]);
        }
    };

    // Replace photoUrl with Convex generic domain URL hack if empty, or we can use another React Component to resolve it.
    // Actually, wait, `useQuery(api.files.getUrl, { storageId })` works in a child component! 
    // We'll create a small `StorageImage` component.

    if (photos === undefined) {
        return <div className="text-center py-10 text-[#59f20d]">{isAr ? "جاري التحميل..." : "Loading..."}</div>;
    }

    const comparingPhotos = photos.filter(p => selectedForCompare.includes(p._id));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <Camera className="text-[#59f20d]" />
                    {isAr ? "صور التطور" : "Progress Photos"}
                </h2>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#59f20d] text-black font-bold rounded-xl hover:scale-105 transition"
                >
                    <Plus size={18} />
                    {isAr ? "إضافة صورة" : "Add Photo"}
                </button>
            </div>

            {photos.length === 0 ? (
                <div className="text-center py-16 bg-[#1a2318]/40 border border-[#59f20d]/20 rounded-3xl">
                    <Camera className="w-16 h-16 text-[#59f20d]/50 mx-auto mb-4" />
                    <p className="text-zinc-400 font-medium">
                        {isAr ? "لا توجد صور بعد. أضف صورتك الأولى لتبدأ تتبع تقدمك!" : "No photos yet. Add your first photo to track your progress!"}
                    </p>
                </div>
            ) : (
                <>
                    {/* Compare Section */}
                    {selectedForCompare.length === 2 && (
                        <div className="bg-[#1a2318]/80 backdrop-blur-xl border-2 border-[#59f20d] rounded-3xl p-6 mb-8 animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ArrowLeftRight className="text-[#59f20d]" />
                                    {isAr ? "مقارنة التطور" : "Progress Comparison"}
                                </h3>
                                <button
                                    onClick={() => setSelectedForCompare([])}
                                    className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 text-sm font-bold transition"
                                >
                                    {isAr ? "إنهاء المقارنة" : "End Compare"}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {comparingPhotos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((p, idx) => (
                                    <div key={p._id} className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-zinc-700">
                                        <StorageImage storageId={p.storageId as any} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[#59f20d] font-bold text-lg mb-1">{idx === 0 ? "Before" : "After"}</p>
                                                    <p className="text-white text-sm font-medium">{p.date}</p>
                                                </div>
                                                {p.weight && (
                                                    <div className="text-right">
                                                        <p className="text-white font-bold">{p.weight} {isAr ? "كجم" : "kg"}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Grid Section */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map(photo => {
                            const isSelected = selectedForCompare.includes(photo._id);
                            return (
                                <div
                                    key={photo._id}
                                    className={`group relative aspect-[3/4] bg-[#0a0d08] rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? "border-[#59f20d] scale-[0.98]" : "border-zinc-800 hover:border-[#59f20d]/50"
                                        }`}
                                >
                                    <StorageImage storageId={photo.storageId as any} className="w-full h-full object-cover" />

                                    <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toggleCompare(photo._id)}
                                            className={`p-2 rounded-xl backdrop-blur-sm transition ${isSelected ? "bg-[#59f20d] text-black" : "bg-black/50 text-white hover:bg-[#59f20d] hover:text-black hover:scale-110"
                                                }`}
                                            title={isAr ? "مقارنة" : "Compare"}
                                        >
                                            {isSelected ? <CheckCircle2 size={18} /> : <ArrowLeftRight size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(photo._id)}
                                            className="p-2 bg-red-500/80 text-white rounded-xl hover:bg-red-600 transition"
                                            title={isAr ? "حذف" : "Delete"}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8">
                                        <p className="text-white font-medium text-sm">{photo.date}</p>
                                        {photo.weight && <p className="text-[#59f20d] text-xs font-bold mt-1">{photo.weight} {isAr ? "كجم" : "kg"}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#0a0d08] border border-[#59f20d]/30 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">
                            {isAr ? "إضافة صورة جديدة" : "Add New Photo"}
                        </h3>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#59f20d] mb-2">{isAr ? "الصورة" : "Photo"}</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-zinc-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#59f20d]/10 file:text-[#59f20d] hover:file:bg-[#59f20d]/20 cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#59f20d] mb-2">{isAr ? "التاريخ" : "Date"}</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#1a2318] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#59f20d] mb-2">{isAr ? "الوزن (اختياري)" : "Weight (Optional)"}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder={isAr ? "مثال: 75.5" : "e.g., 75.5"}
                                    className="w-full px-4 py-3 rounded-xl bg-[#1a2318] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#59f20d] mb-2">{isAr ? "ملاحظات (اختياري)" : "Notes (Optional)"}</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#1a2318] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
                                    rows={2}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading || !file}
                                className="w-full py-4 rounded-xl bg-[#59f20d] text-black font-bold text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4"
                            >
                                {isUploading ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "حفظ الصورة" : "Save Photo")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StorageImage({ storageId, className }: { storageId: Id<"_storage">, className?: string }) {
    const url = useQuery(api.files.getUrl, { storageId });

    if (url === undefined) {
        return <div className={`animate-pulse bg-zinc-800 ${className}`}></div>;
    }

    if (url === null) {
        return <div className={`bg-zinc-900 flex items-center justify-center ${className}`}><Camera className="text-zinc-700 w-8 h-8" /></div>;
    }

    return <img src={url} alt="Progress" className={className} />;
}
