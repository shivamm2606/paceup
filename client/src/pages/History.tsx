import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import type { ApiSuccessResponse } from "../types/apiErrorResponse";
import type {
  PaginatedSessions,
  IWorkoutSession,
  IStrengthSet,
} from "../types/workoutSession.types";

function useHistory(page: number) {
  return useQuery({
    queryKey: ["AllWorkoutSessions", page],
    queryFn: (): Promise<ApiSuccessResponse<PaginatedSessions>> =>
      api
        .get("/workout-session/", { params: { page, limit: 20 } })
        .then((r) => r.data as ApiSuccessResponse<PaginatedSessions>),
    select: (r) => r.data,
  });
}

function fmtDuration(mins?: number) {
  if (!mins) return "—";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function totalVolume(s: IWorkoutSession) {
  let vol = 0;
  for (const ex of s.exercises) {
    for (const set of ex.sets) {
      if (set.type === "strength") vol += set.weight * set.reps;
    }
  }
  return vol;
}

function totalSets(s: IWorkoutSession) {
  return s.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
}

function fmtVolume(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

function groupByMonth(sessions: IWorkoutSession[]) {
  const groups: { label: string; sessions: IWorkoutSession[] }[] = [];
  let current = "";
  for (const s of sessions) {
    const label = new Date(s.date).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    if (label !== current) {
      current = label;
      groups.push({ label, sessions: [] });
    }
    groups[groups.length - 1].sessions.push(s);
  }
  return groups;
}

function SessionDetail({ session }: { session: IWorkoutSession }) {
  return (
    <div className="px-4 pb-4 pt-0.5 space-y-2">
      {session.exercises.map((ex, i) => {
        const exInfo =
          typeof ex.exerciseId === "object"
            ? (ex.exerciseId as { name?: string })
            : null;
        const name = exInfo?.name ?? "Exercise";

        return (
          <div
            key={i}
            className="bg-[#0e0e14] border border-[#1a1a22] rounded-[12px] px-3.5 py-3"
          >
            <p className="text-[12px] font-extrabold text-[#f0f0f5] tracking-tight mb-2">
              {name}
            </p>
            {ex.sets.length === 0 ? (
              <p className="text-[11px] text-[#55556a]">No sets logged</p>
            ) : (
              <div className="grid grid-cols-[20px_1fr] gap-x-2 gap-y-[5px]">
                {ex.sets.map((set, si) => {
                  if (set.type !== "strength") return null;
                  const s = set as IStrengthSet;
                  const marker = s.isWarmup
                    ? "W"
                    : s.isDropSet
                      ? "D"
                      : s.isFailure
                        ? "F"
                        : null;
                  const markerColor = s.isWarmup
                    ? "#c8a247"
                    : s.isDropSet
                      ? "#a78bfa"
                      : s.isFailure
                        ? "#ef4444"
                        : "";
                  return (
                    <div key={si} className="contents">
                      <span
                        className="text-[11px] font-bold text-center tabular-nums"
                        style={{ color: marker ? markerColor : "#55556a" }}
                      >
                        {marker ?? si + 1}
                      </span>
                      <span className="text-[12px] text-[#c0c0d0] font-semibold tabular-nums">
                        {s.weight} {s.unit} × {s.reps}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {session.notes && (
        <p className="text-[11px] text-[#7b9dff]/70 italic px-1 pt-1">
          📝 {session.notes}
        </p>
      )}
    </div>
  );
}

export default function History() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useHistory(page);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completed = useMemo(
    () =>
      (data?.sessions ?? [])
        .filter((s) => s.status === "completed")
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [data],
  );

  const groups = useMemo(() => groupByMonth(completed), [completed]);

  return (
    <div
      className="bg-[#0b0b10] bg-[radial-gradient(140%_90%_at_50%_0%,_rgba(70,80,120,0.16),_rgba(11,11,16,0)_55%),linear-gradient(180deg,_rgba(12,12,18,1)_0%,_rgba(10,10,16,1)_100%)] text-[#f4f4f6] min-h-screen"
      style={{ paddingBottom: "calc(82px + env(safe-area-inset-bottom))" }}
    >
      {/* header */}
      <div
        className="px-5 pb-2"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <p className="text-[11px] font-bold text-[#44445a] tracking-[0.1em] uppercase mb-1.5">
          Activity
        </p>
        <h1 className="text-[30px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
          History
        </h1>
        {data && (
          <p className="text-[13px] text-[#6b6b80] mt-1.5">
            {data.total} workout{data.total !== 1 ? "s" : ""} completed
          </p>
        )}
      </div>

      {/* loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg
            className="animate-spin"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="#1e1e28" strokeWidth="3" />
            <path
              d="M12 2a10 10 0 019.8 8"
              stroke="#7b9dff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-[13px] text-[#44445a]">Loading sessions…</p>
        </div>
      )}

      {/* empty */}
      {!isLoading && completed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-3">
          <div className="w-14 h-14 rounded-[18px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="#44445a"
              strokeWidth="1.6"
            >
              <path d="M4 17V5" strokeLinecap="round" />
              <path d="M4 17h14" strokeLinecap="round" />
              <path
                d="M6.5 14l3-3 3 2.5 3.5-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[15px] font-bold text-[#f0f0f5]">
            No workouts yet
          </p>
          <p className="text-[12px] text-[#55556a] text-center max-w-[220px]">
            Complete your first workout and it'll show up here
          </p>
        </div>
      )}

      {/* sessions */}
      {!isLoading && groups.length > 0 && (
        <div className="px-5 pt-4 space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              {/* month */}
              <p className="text-[11px] font-bold text-[#44445a] tracking-[0.08em] uppercase mb-3 px-0.5">
                {group.label}
              </p>

              <div className="flex flex-col gap-[10px]">
                {group.sessions.map((s) => {
                  const isExpanded = expandedId === s._id;
                  const sets = totalSets(s);
                  const vol = totalVolume(s);

                  return (
                    <div
                      key={s._id}
                      className={`bg-[#13131a] border rounded-[16px] transition-all duration-200 ${
                        isExpanded
                          ? "border-[#2a2a36] shadow-[0_2px_16px_rgba(0,0,0,0.3)]"
                          : "border-[#1e1e28]"
                      }`}
                    >
                      {/* card */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : s._id)}
                        className="w-full px-4 py-3.5 flex items-center gap-3.5 text-left"
                      >
                        {/* date */}
                        <div className="w-11 h-11 rounded-[12px] bg-[rgba(123,157,255,0.08)] border border-[rgba(123,157,255,0.12)] flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-[#7b9dff]/60 uppercase leading-none">
                            {new Date(s.date).toLocaleDateString(undefined, {
                              weekday: "short",
                            })}
                          </span>
                          <span className="text-[15px] font-black text-[#7b9dff] leading-tight">
                            {new Date(s.date).getDate()}
                          </span>
                        </div>

                        {/* info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-extrabold text-[#f0f0f5] truncate tracking-tight">
                            {s.name || "Workout"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-[3px] flex-wrap">
                            <span className="text-[11px] text-[#8b8b9a] font-medium">
                              {fmtDuration(s.duration)}
                            </span>
                            <span className="text-[6px] text-[#33334a]">●</span>
                            <span className="text-[11px] text-[#8b8b9a] font-medium">
                              {s.exercises.length} exercise
                              {s.exercises.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[6px] text-[#33334a]">●</span>
                            <span className="text-[11px] text-[#8b8b9a] font-medium">
                              {sets} sets
                            </span>
                          </div>
                        </div>

                        {/* volume */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          {vol > 0 && (
                            <div className="text-right">
                              <p className="text-[13px] font-black text-[#f0f0f5] tabular-nums leading-tight">
                                {fmtVolume(vol)}
                              </p>
                              <p className="text-[8px] font-bold text-[#55556a] uppercase tracking-wider">
                                kg vol
                              </p>
                            </div>
                          )}
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`text-[#44445a] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path
                              d="M6 9l6 6 6-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* detail */}
                      {isExpanded && (
                        <div className="border-t border-[#1e1e28]">
                          <SessionDetail session={s} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* pages */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-[7px] rounded-[10px] bg-[#13131a] border border-[#1e1e28] text-[12px] font-bold text-[#8b8b9a] disabled:opacity-30 hover:bg-[#1a1a24] hover:border-[#2a2a38] hover:text-[#f0f0f5] transition-all"
              >
                ← Prev
              </button>
              <span className="text-[12px] font-bold text-[#55556a] tabular-nums">
                {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="px-4 py-[7px] rounded-[10px] bg-[#13131a] border border-[#1e1e28] text-[12px] font-bold text-[#8b8b9a] disabled:opacity-30 hover:bg-[#1a1a24] hover:border-[#2a2a38] hover:text-[#f0f0f5] transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
