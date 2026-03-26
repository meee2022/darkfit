import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { History, Search, Filter, Dumbbell, Flame, Calendar, ChevronDown, ChevronUp, Trophy } from "lucide-react";

export function WorkoutHistory() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const history = useQuery(api.workout.getUserWorkoutHistory);
  const [search, setSearch] = useState("");
  const [filterRange, setFilterRange] = useState<"week" | "month" | "all">("month");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cutoff = useMemo(() => {
    const d = new Date();
    if (filterRange === "week") d.setDate(d.getDate() - 7);
    else if (filterRange === "month") d.setMonth(d.getMonth() - 1);
    else return "";
    return d.toISOString().split("T")[0];
  }, [filterRange]);

  const filtered = useMemo(() => {
    if (!history) return [];
    return history.filter((s) => {
      if (cutoff && s.date < cutoff) return false;
      if (search && !s.exerciseId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [history, cutoff, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const s of filtered) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const totalVolume = useMemo(
    () => filtered.reduce((sum, s) => sum + (s.totalVolume || 0), 0),
    [filtered]
  );

  if (history === undefined) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-white/5 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{isAr ? "سجل التمارين" : "Workout History"}</h3>
            <p className="text-xs text-zinc-500">
              {isAr
                ? `${filtered.length} جلسة • ${totalVolume.toLocaleString()} كجم حجم`
                : `${filtered.length} sessions • ${totalVolume.toLocaleString()} kg volume`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث عن تمرين..." : "Search exercise..."}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>

        {/* Filter range tabs */}
        <div className="flex gap-2">
          {[
            { id: "week", label: isAr ? "أسبوع" : "Week" },
            { id: "month", label: isAr ? "شهر" : "Month" },
            { id: "all", label: isAr ? "الكل" : "All" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterRange(f.id as any)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRange === f.id
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "bg-white/5 text-zinc-500 border border-white/5 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      <div className="px-4 pb-5 space-y-4 max-h-[600px] overflow-y-auto">
        {grouped.length === 0 ? (
          <div className="py-10 text-center">
            <Dumbbell className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              {isAr ? "لم تسجل أي تمارين بعد في هذه الفترة" : "No workouts logged in this period"}
            </p>
          </div>
        ) : (
          grouped.map(([date, sessions]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs font-bold text-zinc-500">{date}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Sessions of this date */}
              <div className="space-y-2">
                {sessions.map((session) => {
                  const isExpanded = expandedId === session._id;
                  const maxWeight = session.sets.length > 0
                    ? Math.max(...session.sets.map((s: any) => s.weight || 0))
                    : 0;
                  const hasPR = session.sets.some((s: any) => s.isPR);

                  return (
                    <div
                      key={session._id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : session._id)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.03] transition-colors"
                      >
                        {/* Exercise icon */}
                        <div className="w-9 h-9 rounded-xl bg-[#59f20d]/10 border border-[#59f20d]/20 flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="w-4 h-4 text-[#59f20d]" />
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white truncate">
                              {session.exerciseId}
                            </p>
                            {hasPR && (
                              <span className="flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                PR 🏆
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                            <span>{session.sets.length} {isAr ? "مج" : "sets"}</span>
                            {maxWeight > 0 && (
                              <span>
                                {maxWeight} {isAr ? "كجم" : "kg"} max
                              </span>
                            )}
                            <span className="flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-orange-400" />
                              1RM: {Math.round(session.estimatedOneRepMax)} kg
                            </span>
                          </div>
                        </div>

                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                        }
                      </button>

                      {/* Expanded sets detail */}
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-white/5">
                          <div className="mt-2 space-y-1">
                            {/* Column headers */}
                            <div className="grid grid-cols-4 text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2 pb-1">
                              <span>{isAr ? "مج" : "Set"}</span>
                              <span>{isAr ? "وزن" : "Weight"}</span>
                              <span>{isAr ? "تكرار" : "Reps"}</span>
                              <span>1RM</span>
                            </div>
                            {session.sets.map((set: any, idx: number) => (
                              <div
                                key={idx}
                                className={`grid grid-cols-4 px-2 py-1.5 rounded-lg text-xs ${
                                  set.isPR ? "bg-amber-500/10 border border-amber-500/20" :
                                  set.isWarmup ? "bg-white/[0.02] border border-white/5 opacity-60" :
                                  "bg-white/[0.02] border border-white/5"
                                }`}
                              >
                                <span className="font-bold text-zinc-400">
                                  {set.isWarmup ? "W" : set.setNumber}
                                </span>
                                <span className="font-black text-white">{set.weight}kg</span>
                                <span className="text-zinc-300">{set.reps}</span>
                                <span className={set.isPR ? "text-amber-400 font-black" : "text-zinc-500"}>
                                  {set.isPR ? "🏆 PR" : `${Math.round(set.weight * (1 + 0.0333 * set.reps))}kg`}
                                </span>
                              </div>
                            ))}
                          </div>

                          {session.notes && (
                            <p className="mt-2 text-xs text-zinc-500 px-2 italic">
                              {session.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
