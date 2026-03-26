import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Send, Image as ImageIcon, Paperclip, X, User, MessageSquare, Search, ChevronLeft, MoreVertical, CheckCheck } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

export function CoachChat() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const conversations = useQuery(api.messages.getMyConversations) || [];
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const messages = useQuery(api.messages.getMessages, selectedConv ? { conversationId: selectedConv._id } : "skip") || [];
  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markRead);
  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const currentUserId = userProfile?.userId;
  
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConv) {
      markRead({ conversationId: selectedConv._id });
    }
  }, [selectedConv, messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedConv) return;
    const text = inputText;
    setInputText("");
    await sendMessage({
      conversationId: selectedConv._id,
      text,
    });
  };

  return (
    <div className="flex bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] overflow-hidden h-[700px] shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-400/5 to-purple-500/5 pointer-events-none"></div>

      {/* Sidebar: Conversations */}
      <div className={`w-full md:w-80 border-white/5 bg-black/40 backdrop-blur-md flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'} Ar:border-l border-r`}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon-400" />
            {isAr ? "المحادثات" : "Messages"}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder={isAr ? "بحث..." : "Search..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-neon-400 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c: any) => (
            <button
              key={c._id}
              onClick={() => setSelectedConv(c)}
              className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${
                selectedConv?._id === c._id ? 'bg-neon-400/10 border border-neon-400/20' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                  {c.partnerImage ? <img src={c.partnerImage} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-zinc-600" />}
                </div>
                {((isAr ? c.unreadCountClient : c.unreadCountCoach) > 0) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-neon-400 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                    {isAr ? c.unreadCountClient : c.unreadCountCoach}
                  </div>
                )}
              </div>
              <div className="flex-1 text-start overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-white text-sm truncate">{c.partnerName}</span>
                  <span className="text-[10px] text-zinc-500">{new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-zinc-500 truncate font-medium">{c.lastMessageText || (isAr ? "بدء محادثة..." : "Start chatting...")}</p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center p-6">
              <MessageSquare className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-500 font-bold">{isAr ? "لا توجد محادثات نشطة" : "No active conversations"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/20">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between backdrop-blur-xl bg-black/40">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 text-zinc-400 hover:text-white">
                  <ChevronLeft className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                  {selectedConv.partnerImage ? <img src={selectedConv.partnerImage} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-zinc-600" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{selectedConv.partnerName}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-neon-400 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-neon-400 uppercase tracking-widest">{isAr ? "متصل" : "Online"}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((m: any, i) => {
                const isMe = m.senderId === currentUserId;
                return (
                  <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                        isMe ? 'bg-neon-400 text-black rounded-tr-none' : 'bg-white/5 text-white border border-white/10 rounded-tl-none'
                      }`}>
                        {m.text}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 px-1">
                        <span className="text-[10px] text-zinc-500 font-bold">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 text-neon-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-black/40 backdrop-blur-2xl border-t border-white/5">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pl-4 focus-within:border-neon-400/50 transition-all shadow-inner">
                <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isAr ? "اكتب رسالتك..." : "Type a message..."}
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-neon-400 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-neon-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">{isAr ? "ابدأ التواصل مع مدربك" : "Chat with your Coach"}</h3>
            <p className="text-sm text-zinc-500 max-w-xs font-medium leading-relaxed">
              {isAr ? "احصل على توجيهات مباشرة، اسأل عن التمارين، وشارك تقدمك للحصول على نتائج أفضل." : "Get direct guidance, ask about exercises, and share your progress for better results."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
