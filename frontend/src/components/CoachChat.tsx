import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Send, Paperclip, User, MessageSquare, Search, ChevronLeft, MoreVertical, CheckCheck, Users, Plus, Star, ArrowRight } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export function CoachChat() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const conversations = useQuery(api.messages.getMyConversations) || [];
  const coaches = useQuery(api.coaches.listPublic, {}) || [];
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [showCoachList, setShowCoachList] = useState(false);
  const messages = useQuery(api.messages.getMessages, selectedConv ? { conversationId: selectedConv._id } : "skip") || [];
  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markRead);
  const startConversation = useMutation(api.messages.getOrCreateConversation);
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

  const handleStartChat = async (coachUserId: string) => {
    try {
      const convId = await startConversation({ partnerUserId: coachUserId as any });
      setShowCoachList(false);
      // Refetch conversations and select the new one
      // The query will auto-update
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  return (
    <div className="flex bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] overflow-hidden h-[700px] shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#59f20d]/5 to-purple-500/5 pointer-events-none"></div>

      {/* Sidebar: Conversations */}
      <div className={`w-full md:w-80 border-white/5 bg-black/40 backdrop-blur-md flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'} border-r border-white/5`}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#59f20d]" />
              {isAr ? "المحادثات" : "Messages"}
            </h2>
            <button
              onClick={() => setShowCoachList(true)}
              className="w-8 h-8 rounded-full bg-[#59f20d] flex items-center justify-center text-black hover:scale-105 transition-transform"
              title={isAr ? "محادثة جديدة" : "New chat"}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder={isAr ? "بحث..." : "Search..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-[#59f20d] outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c: any) => (
            <button
              key={c._id}
              onClick={() => setSelectedConv(c)}
              className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${
                selectedConv?._id === c._id ? 'bg-[#59f20d]/10 border border-[#59f20d]/20' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                  {c.partnerImage ? <img src={c.partnerImage} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-zinc-600" />}
                </div>
                {((c.unreadCountClient || 0) > 0) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#59f20d] text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                    {c.unreadCountClient}
                  </div>
                )}
              </div>
              <div className="flex-1 text-start overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-white text-sm truncate">{c.partnerName || (isAr ? "مدرب" : "Coach")}</span>
                  <span className="text-[10px] text-zinc-500">{c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                </div>
                <p className="text-xs text-zinc-500 truncate font-medium">{c.lastMessageText || (isAr ? "بدء محادثة..." : "Start chatting...")}</p>
              </div>
            </button>
          ))}
          
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-60 text-center p-6">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-400 font-bold mb-2">{isAr ? "لا توجد محادثات" : "No conversations yet"}</p>
              <p className="text-xs text-zinc-500 mb-4">{isAr ? "ابدأ محادثة مع مدرب للحصول على توجيهات" : "Start a chat with a coach for guidance"}</p>
              <button
                onClick={() => setShowCoachList(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#59f20d] text-black text-sm font-bold rounded-xl hover:brightness-110 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>{isAr ? "تواصل مع مدرب" : "Find a Coach"}</span>
              </button>
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
                  <h3 className="text-sm font-black text-white">{selectedConv.partnerName || (isAr ? "مدرب" : "Coach")}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#59f20d] animate-pulse"></div>
                    <span className="text-[10px] font-bold text-[#59f20d] uppercase tracking-widest">{isAr ? "متصل" : "Online"}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-zinc-500">{isAr ? "ابدأ المحادثة بإرسال رسالة" : "Start the conversation by sending a message"}</p>
                </div>
              )}
              {messages.map((m: any) => {
                const isMe = m.senderId === currentUserId;
                return (
                  <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                        isMe ? 'bg-[#59f20d] text-black rounded-tr-none' : 'bg-white/5 text-white border border-white/10 rounded-tl-none'
                      }`}>
                        {m.text}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 px-1">
                        <span className="text-[10px] text-zinc-500 font-bold">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 text-[#59f20d]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-black/40 backdrop-blur-2xl border-t border-white/5">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pl-4 focus-within:border-[#59f20d]/50 transition-all shadow-inner">
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
                  className="w-10 h-10 rounded-xl bg-[#59f20d] flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-[#59f20d]" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">{isAr ? "ابدأ التواصل مع مدربك" : "Chat with your Coach"}</h3>
            <p className="text-sm text-zinc-500 max-w-xs font-medium leading-relaxed mb-6">
              {isAr ? "احصل على توجيهات مباشرة، اسأل عن التمارين، وشارك تقدمك للحصول على نتائج أفضل." : "Get direct guidance, ask about exercises, and share your progress for better results."}
            </p>
            <button
              onClick={() => setShowCoachList(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#59f20d] text-black font-bold rounded-xl hover:brightness-110 transition-all"
            >
              <Users className="w-5 h-5" />
              <span>{isAr ? "اختر مدرب للتواصل" : "Choose a Coach"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Coach Selection Modal */}
      {showCoachList && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#59f20d]" />
                {isAr ? "اختر مدرب" : "Select a Coach"}
              </h3>
              <button
                onClick={() => setShowCoachList(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {coaches.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 font-bold mb-2">{isAr ? "لا يوجد مدربين حالياً" : "No coaches available"}</p>
                  <p className="text-xs text-zinc-500">{isAr ? "سيتم إضافة مدربين قريباً" : "Coaches will be added soon"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {coaches.map((coach: any) => (
                    <button
                      key={coach._id}
                      onClick={() => coach.userId && handleStartChat(coach.userId)}
                      disabled={!coach.userId}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#59f20d]/50 transition-all flex items-center gap-4 text-right disabled:opacity-50"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                        {coach.imageUrl || coach.imageResolved ? (
                          <img src={coach.imageUrl || coach.imageResolved} alt={coach.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-white truncate">{isAr ? coach.nameAr || coach.name : coach.name}</h4>
                        <p className="text-xs text-zinc-400 truncate">{isAr ? coach.specialtyAr || coach.specialty : coach.specialty}</p>
                        {coach.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-[#59f20d] fill-current" />
                            <span className="text-xs text-zinc-500">{coach.rating}</span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className={`w-5 h-5 text-zinc-500 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
