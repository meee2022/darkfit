import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import FitBotDisclaimer from "./FitBotDisclaimer";
import { Id } from "../../convex/_generated/dataModel";

export default function FitBot() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatHistory = useQuery(api.fitbot.getChatHistory);
  const remainingInfo = useQuery(api.fitbot.getRemainingQuestions);
  const sendMessage = useMutation(api.fitbot.sendMessage);
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
      alert(error.message || "حدث خطأ");
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

  const quickQuestions = [
    "ما أفضل تمارين لتقوية البطن؟",
    "كيف أبني عضلات الذراعين بدون أوزان؟",
    "ما الأطعمة الغنية بالبروتين؟",
    "كيف أبدأ برنامج لياقة للمبتدئين؟",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Disclaimer */}
        <FitBotDisclaimer />

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              🤖
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                فِتْبوت
              </h1>
              <p className="text-gray-600 mt-1">مساعدك الذكي للياقة والتغذية</p>
            </div>
            {remainingInfo && (
              <div className="text-center bg-blue-50 px-6 py-3 rounded-xl border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-600">
                  {remainingInfo.remaining}
                </div>
                <div className="text-xs text-gray-600">أسئلة متبقية اليوم</div>
              </div>
            )}
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>💡 يمكنني مساعدتك في:</strong> التمارين، التغذية، بناء العضلات، خسارة الوزن، نصائح اللياقة
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 bg-gray-50">
            {chatHistory?.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👋</div>
                <p className="text-2xl font-bold text-gray-700 mb-2">
                  مرحباً بك!
                </p>
                <p className="text-gray-500">
                  اسألني أي سؤال عن اللياقة والتغذية
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
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm px-6 py-3 max-w-[75%] shadow-lg">
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
                        className={`rounded-2xl rounded-tl-sm px-6 py-4 shadow-lg ${
                          msg.isBlocked
                            ? "bg-red-50 border-2 border-red-300"
                            : "bg-white border-2 border-gray-200"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
                          {msg.response}
                        </div>
                        
                        {/* Rating Buttons */}
                        {!msg.isBlocked && (
                          <div className="flex gap-2 mt-4 pt-3 border-t">
                            <button
                              onClick={() => handleRate(msg._id, "good")}
                              className={`px-3 py-1 rounded-lg text-sm transition ${
                                msg.rating === "good"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 hover:bg-green-100 text-gray-600"
                              }`}
                            >
                              👍 مفيد
                            </button>
                            <button
                              onClick={() => handleRate(msg._id, "bad")}
                              className={`px-3 py-1 rounded-lg text-sm transition ${
                                msg.rating === "bad"
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-100 hover:bg-red-100 text-gray-600"
                              }`}
                            >
                              👎 غير مفيد
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
                <div className="bg-white rounded-2xl rounded-tl-sm px-6 py-4 shadow-lg border-2 border-gray-200">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 p-6 bg-white">
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
                placeholder="اكتب سؤالك هنا... (مثل: ما أفضل تمارين للصدر؟)"
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                rows={2}
                disabled={isLoading || (remainingInfo?.remaining === 0)}
                maxLength={500}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || (remainingInfo?.remaining === 0)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition font-bold shadow-lg"
                >
                  {isLoading ? "⏳" : "إرسال 📤"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("هل تريد مسح سجل المحادثات؟")) {
                      clearHistory();
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm shadow-lg transition"
                  title="مسح السجل"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-left">
              {input.length}/500 حرف
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            أسئلة سريعة:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInput(q)}
                className="text-right px-4 py-3 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition text-sm"
              >
                <span className="text-blue-600 font-bold">•</span> {q}
              </button>
            ))}
          </div>
        </div>

        {/* Beta Badge */}
        <div className="mt-6 text-center">
          <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold border-2 border-yellow-300">
            🚧 نسخة تجريبية (Beta) - ساعدنا بتقييم الإجابات
          </span>
        </div>
      </div>
    </div>
  );
}
