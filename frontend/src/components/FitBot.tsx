import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import FitBotDisclaimer from "./FitBotDisclaimer";
import { Id } from "../../convex/_generated/dataModel";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export default function FitBot({ onBack }: { onBack?: () => void }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const chatHistory = useQuery(api.fitbot.getChatHistory, {});
  const remainingInfo = useQuery(api.fitbot.getRemainingQuestions);
  const sendMessage = useAction(api.fitbot.sendMessage);
  const rateAnswer = useMutation(api.fitbot.rateAnswer);
  const clearHistory = useMutation(api.fitbot.clearChatHistory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    setIsLoading(true);
    try {
      await sendMessage({ message });
    } catch (error: any) {
      alert(error.message || t("err_generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (chatId: Id<"fitbotChats">, rating: "good" | "bad") => {
    try {
      await rateAnswer({ chatId, rating });
    } catch (error: any) {
      console.error("Rating error:", error);
    }
  };

  const quickQuestions = isAr
    ? [
        "ما أفضل تمارين لتقوية البطن؟",
        "كيف أبني عضلات الذراعين بدون أوزان؟",
        "ما الأطعمة الغنية بالبروتين؟",
        "كيف أبدأ برنامج لياقة للمبتدئين؟",
      ]
    : [
        "Best exercises for abs?",
        "How to build arm muscles without weights?",
        "What foods are high in protein?",
        "How do I start a beginner fitness program?",
      ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] p-4 text-zinc-100" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto">
        {/* Disclaimer */}
        <FitBotDisclaimer />

        {/* Header */}
        <div className="bg-[#111] rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-zinc-800/50 p-8 mb-6 relative">
          {onBack && (
            <button
              onClick={onBack}
              title={t("fitbot_back")}
              className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-[#39ff14] bg-zinc-800 hover:bg-zinc-700 rounded-full transition"
            >
              <ArrowRight className={`w-4 h-4 ${isAr ? "" : "rotate-180"}`} />
            </button>
          )}
          <div className="flex items-center gap-4 mb-4 mt-6 sm:mt-0">
            <div className="w-16 h-16 bg-[#0d0d0d] border-2 border-[#39ff14]/30 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              🤖
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#39ff14]">
                {t("fitbot_title")}
              </h1>
              <p className="text-zinc-400 mt-1">{t("fitbot_subtitle")}</p>
            </div>
            {remainingInfo && (
              <div className="text-center bg-[#1a1a1a] px-6 py-3 rounded-xl border border-[#39ff14]/30">
                <div className="text-3xl font-bold text-[#39ff14]">
                  {remainingInfo.remaining}
                </div>
                <div className="text-xs text-zinc-400">{t("fitbot_remaining")}</div>
              </div>
            )}
          </div>

          <div className="bg-[rgba(57,255,20,0.05)] border-l-4 border-[#39ff14] p-4 rounded-lg">
            <p className="text-sm text-zinc-300">
              <strong className="text-[#39ff14]">💡 {isAr ? "يمكنني مساعدتك في:" : "I can help with:"}</strong> {t("fitbot_help")}
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-[#111] rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-zinc-800/50 overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 bg-[#0d0d0d]">
            {chatHistory?.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👋</div>
                <p className="text-2xl font-bold text-zinc-200 mb-2">
                  {t("fitbot_welcome")}
                </p>
                <p className="text-zinc-500">
                  {t("fitbot_ask")}
                </p>
              </div>
            )}

            <AnimatePresence>
              {chatHistory?.map((msg) => (
                <div key={msg._id} className="space-y-4">
                  {/* User Message */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-end"
                  >
                    <div className="bg-gradient-to-r from-[#1a4d1a] to-[#2d7a2d] text-white rounded-[18px_18px_4px_18px] px-6 py-3 max-w-[75%] shadow-lg">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </motion.div>

                  {/* AI Response */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[75%]">
                      <div
                        className={`rounded-[18px_18px_18px_4px] px-6 py-4 shadow-lg ${
                          msg.isBlocked
                            ? "bg-red-950/30 border border-red-500/40"
                            : "bg-[#1a1a1a] border border-[#2a3a2a]"
                        }`}
                      >
                        <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-zinc-200">
                          {msg.response}
                        </div>

                        {/* Rating Buttons */}
                        {!msg.isBlocked && (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-700/50">
                            <button
                              onClick={() => handleRate(msg._id, "good")}
                              className={`px-3 py-1 rounded-lg text-sm transition ${
                                msg.rating === "good"
                                  ? "bg-[#39ff14] text-black font-bold"
                                  : "bg-zinc-800 hover:bg-[#39ff14]/20 text-zinc-400 hover:text-[#39ff14]"
                              }`}
                            >
                              👍 {t("fitbot_useful")}
                            </button>
                            <button
                              onClick={() => handleRate(msg._id, "bad")}
                              className={`px-3 py-1 rounded-lg text-sm transition ${
                                msg.rating === "bad"
                                  ? "bg-red-600 text-white"
                                  : "bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400"
                              }`}
                            >
                              👎 {t("fitbot_not_useful")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-[#1a1a1a] rounded-[18px_18px_18px_4px] px-6 py-4 shadow-lg border border-[#2a3a2a]">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-[#39ff14] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#39ff14] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-[#39ff14] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area — sticky bottom */}
          <div className="sticky bottom-0 border-t border-zinc-800/50 p-4 sm:p-6 bg-[#111]" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t("fitbot_placeholder")}
                className="flex-1 p-4 bg-[#1a1a1a] text-zinc-100 placeholder:text-zinc-600 border border-[#2a4a2a] rounded-xl resize-none focus:ring-2 focus:ring-[#39ff14]/30 focus:border-[#39ff14] focus:outline-none focus:shadow-[0_0_12px_rgba(57,255,20,0.3)] transition"
                rows={2}
                disabled={isLoading || (remainingInfo?.remaining === 0)}
                maxLength={500}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || (remainingInfo?.remaining === 0)}
                  className="px-8 py-4 bg-gradient-to-r from-[#39ff14] to-[#22c55e] text-black rounded-xl hover:brightness-110 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition font-bold shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                >
                  {isLoading ? "⏳" : `${t("fitbot_send")} 📤`}
                </button>
                <button
                  onClick={() => {
                    if (confirm(t("fitbot_clear_confirm"))) {
                      clearHistory();
                    }
                  }}
                  className="px-4 py-2 bg-[#333] text-[#ff4444] rounded-xl hover:bg-[#444] text-sm shadow-lg transition"
                  title={t("fitbot_clear")}
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="text-xs text-zinc-500 mt-2 text-left">
              {input.length}/500 {t("fitbot_chars")}
            </div>
          </div>
        </div>

        {/* Quick Questions — Horizontal Scroll */}
        <div className="mt-6 bg-[#111] rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-zinc-800/50 p-6">
          <h4 className="font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            {t("fitbot_quick")}
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInput(q)}
                className="flex-shrink-0 whitespace-nowrap text-right px-4 py-3 bg-transparent border border-[#39ff14]/50 rounded-xl hover:border-[#39ff14] hover:bg-[#39ff14]/10 hover:shadow-[0_0_12px_rgba(57,255,20,0.2)] transition text-sm text-[#39ff14] font-medium"
              >
                <span className="text-[#39ff14] font-bold">•</span> {q}
              </button>
            ))}
          </div>
          <style dangerouslySetInnerHTML={{ __html: `.flex.gap-3.overflow-x-auto::-webkit-scrollbar { display: none; }` }} />
        </div>

        {/* Beta Badge */}
        <div className="mt-6 text-center">
          <span className="inline-block bg-[#0d1a0d] text-[#86efac] px-4 py-2 rounded-full text-sm font-bold border border-dashed border-[#39ff14]/50">
            🚧 {t("fitbot_beta")}
          </span>
        </div>
      </div>
    </div>
  );
}
