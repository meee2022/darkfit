import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AiCoachOnboarding } from "./AiCoachOnboarding";
import { AiCoachDashboard } from "./AiCoachDashboard";
import { Brain } from "lucide-react";

export function SmartCoachSection() {
  const isActivated = useQuery(api.aiCoach.getAiCoachStatus);

  if (isActivated === undefined) {
    return (
      <div className="h-96 flex flex-col items-center justify-center animate-pulse gap-4 text-neon-400">
        <Brain className="w-16 h-16 opacity-50 absolute" />
        <div className="w-24 h-24 border-t-2 border-neon-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return isActivated ? <AiCoachDashboard /> : <AiCoachOnboarding onComplete={() => {}} />;
}
