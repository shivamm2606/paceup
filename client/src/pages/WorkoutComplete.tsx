import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/sessions/useSession";
import {
  getMuscleColor,
  formatMuscle,
} from "../components/templates/templateUtils";
import type { ISetLog } from "../types/workoutSession.types";

interface PopulatedExercise {
  _id: string;
  name: string;
  category: string;
  muscleGroup: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function WorkoutComplete() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(sessionId ?? "");

  const stats = useMemo(() => {
    if (!session)
      return { totalSets: 0, totalVolume: 0, totalReps: 0, exercises: 0 };
    let totalSets = 0;
    let totalVolume = 0;
    let totalReps = 0;

    session.exercises.forEach((ex) => {
      totalSets += ex.sets.length;
      ex.sets.forEach((set: ISetLog) => {
        if (set.type === "strength") {
          totalVolume += set.weight * set.reps;
          totalReps += set.reps;
        }
      });
    });

    return {
      totalSets,
      totalVolume,
      totalReps,
      exercises: session.exercises.length,
    };
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center">
        <svg
          className="animate-spin"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="#1e1e28" strokeWidth="2.5" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="#4ade80"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center">
        <button
          onClick={() => navigate("/dashboard", { replace: true })}
          className="text-[#8b8b9a] text-[13px] font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-[#f0f0f5] flex flex-col items-center px-5">
      <style>{`
        @keyframes scaleIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>

      <div className="w-full max-w-[420px] flex flex-col items-center pt-16">
        {/* Animated Checkmark */}
        <div className="relative mb-6">
          <div
            className="absolute inset-[-12px] rounded-full border-2 border-[#4ade80]/20"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          <div
            className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.25)]"
            style={{
              animation: "scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#0b0b10"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div
          className="text-center mb-8"
          style={{ animation: "fadeUp 0.5s ease-out 0.3s both" }}
        >
          <h1 className="text-[24px] font-black tracking-tight mb-1">
            Workout Complete!
          </h1>
          <p className="text-[13px] text-[#6b6b80] font-semibold">
            {session.name ?? "Session"}
          </p>
        </div>

        {/* Stats Grid */}
        <div
          className="w-full grid grid-cols-2 gap-[10px] mb-6"
          style={{ animation: "fadeUp 0.5s ease-out 0.45s both" }}
        >
          <SummaryCard
            label="Duration"
            value={formatDuration(session.duration ?? 0)}
          />
          <SummaryCard label="Exercises" value={stats.exercises} />
          <SummaryCard label="Total Sets" value={stats.totalSets} />
          <SummaryCard
            label="Volume"
            value={
              stats.totalVolume > 0
                ? `${(stats.totalVolume / 1000).toFixed(1)}k kg`
                : "0"
            }
          />
        </div>

        {/* Exercise Breakdown */}
        <div
          className="w-full mb-8"
          style={{ animation: "fadeUp 0.5s ease-out 0.6s both" }}
        >
          <p className="text-[11px] font-bold text-[#44445a] tracking-[0.08em] uppercase mb-3">
            Exercises
          </p>
          <div className="flex flex-col gap-[6px]">
            {session.exercises.map((ex, i) => {
              const exData = ex.exerciseId as unknown as PopulatedExercise;
              const name =
                typeof exData === "string" ? "Exercise" : exData.name;
              const muscle =
                typeof exData === "string" ? "" : exData.muscleGroup;
              const muscleColor = getMuscleColor(muscle);
              const strengthSets = ex.sets.filter(
                (s: ISetLog) => s.type === "strength",
              );
              const bestSet = strengthSets.reduce<{
                weight: number;
                reps: number;
              } | null>((best, s) => {
                if (s.type !== "strength") return best;
                if (!best || s.weight > best.weight)
                  return { weight: s.weight, reps: s.reps };
                return best;
              }, null);

              return (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#13131a] border border-[#1e1e28] rounded-[12px] px-4 py-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-[13px] font-bold text-[#e0e0ea] truncate">
                      {name}
                    </p>
                    {muscle && (
                      <span
                        className="shrink-0 text-[7.5px] font-bold tracking-[0.03em] uppercase px-[5px] py-[1px] rounded-[4px] border"
                        style={{
                          background: muscleColor.bg,
                          color: muscleColor.text,
                          borderColor: muscleColor.border,
                        }}
                      >
                        {formatMuscle(muscle)}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[12px] font-bold text-[#8b8b9a]">
                      {ex.sets.length} set{ex.sets.length !== 1 ? "s" : ""}
                    </p>
                    {bestSet && (
                      <p className="text-[10px] text-[#44445a]">
                        Best: {bestSet.weight}kg × {bestSet.reps}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate("/dashboard", { replace: true })}
          className="w-full py-[14px] rounded-[14px] bg-[#4ade80] text-[#0b0b10] text-[15px] font-extrabold tracking-tight hover:bg-[#5ae88d] active:scale-[0.98] transition-all duration-150 mb-10"
          style={{ animation: "fadeUp 0.5s ease-out 0.75s both" }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-[#13131a] border border-[#1e1e28] rounded-[14px] px-4 py-4 text-center">
      <p className="text-[9px] font-bold text-[#44445a] tracking-widest uppercase mb-1">
        {label}
      </p>
      <p className="text-[20px] font-black text-[#f0f0f5] tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

export default WorkoutComplete;
