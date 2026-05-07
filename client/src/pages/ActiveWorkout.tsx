import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/sessions/useSession";
import { useAddExerciseToSession } from "../hooks/sessions/useAddExerciseToSession";
import { useRemoveExercise } from "../hooks/sessions/useRemoveExercise";
import { useCompleteSession } from "../hooks/sessions/useCompleteSession";
import { useDeleteSession } from "../hooks/sessions/useDeleteSession";
import { usePreviousExerciseData } from "../hooks/sessions/usePreviousExerciseData";
import { ExercisePicker } from "../components/templates/ExercisePicker";
import {
  getMuscleColor,
  formatMuscle,
} from "../components/templates/templateUtils";

interface PopulatedExercise {
  _id: string;
  name: string;
  category: string;
  muscleGroup: string;
}

type SetMarker = "normal" | "warmup" | "dropset" | "failure";

interface SetRowDraft {
  weight: string;
  reps: string;
  done: boolean;
  marker: SetMarker;
}

function formatTimer(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

function getExInfo(ex: unknown): {
  id: string;
  name: string;
  muscle: string;
  category: string;
} {
  const d = ex as PopulatedExercise;
  if (typeof d === "string")
    return { id: d, name: "Exercise", muscle: "", category: "strength" };
  return {
    id: d._id,
    name: d.name,
    muscle: d.muscleGroup ?? "",
    category: d.category ?? "strength",
  };
}

function getMarker(set: {
  type: string;
  isWarmup?: boolean;
  isDropSet?: boolean;
  isFailure?: boolean;
}): SetMarker {
  if (set.type === "strength" && set.isWarmup) return "warmup";
  if (set.type === "strength" && set.isDropSet) return "dropset";
  if (set.type === "strength" && set.isFailure) return "failure";
  return "normal";
}

function ActiveWorkout() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const sid = sessionId ?? "";

  const { data: session, isLoading, isError } = useSession(sid);
  const { mutate: addExercise } = useAddExerciseToSession(sid);
  const { mutate: removeExercise } = useRemoveExercise(sid);
  const { mutate: completeSession, isPending: isCompleting } =
    useCompleteSession(sid);
  const { mutate: deleteSession, isPending: isDeleting } =
    useDeleteSession(sid);

  const { previousMap } = usePreviousExerciseData();

  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [editingName, setEditingName] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameInitialized = useRef(false);

  // menus
  const [exerciseMenu, setExerciseMenu] = useState<string | null>(null);
  const [confirmRemoveEx, setConfirmRemoveEx] = useState<string | null>(null);
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>(
    {},
  );
  const [editingNoteEx, setEditingNoteEx] = useState<string | null>(null);

  // type picker
  const [setTypePicker, setSetTypePicker] = useState<{
    exId: string;
    draftIdx: number;
  } | null>(null);

  // drafts
  const [draftRows, setDraftRows] = useState<Record<string, SetRowDraft[]>>({});
  const setsInitialized = useRef(false);

  // rest
  const [restTimer, setRestTimer] = useState(0);
  const [restTarget, setRestTarget] = useState(120);
  const [restOver, setRestOver] = useState(false);

  useEffect(() => {
    if (restTimer <= 0) return;
    const id = setInterval(() => {
      setRestTimer((t) => {
        const next = Math.max(0, t - 1);
        if (next === 0) {
          setRestOver(true);

          setTimeout(() => setRestOver(false), 3000);

          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restTimer]);

  // sync name
  useEffect(() => {
    if (session?.name && !nameInitialized.current) {
      setWorkoutName(session.name);
      nameInitialized.current = true;
    }
  }, [session?.name]);

  // init drafts
  useEffect(() => {
    if (!session || setsInitialized.current) return;
    setsInitialized.current = true;
    const initial: Record<string, SetRowDraft[]> = {};
    for (const exLog of session.exercises) {
      const exId = getExInfo(exLog.exerciseId).id;
      initial[exId] = exLog.sets.map((s) => ({
        weight: s.type === "strength" ? String(s.weight) : "",
        reps: s.type === "strength" ? String(s.reps) : "",
        done: true,
        marker: getMarker(s),
      }));
    }
    setDraftRows(initial);
  }, [session]);

  // elapsed
  useEffect(() => {
    if (!session?.date) return;
    const start = new Date(session.date).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.date]);

  useEffect(() => {
    if (session?.status === "completed")
      navigate(`/workout/${sid}/complete`, { replace: true });
  }, [session?.status, sid, navigate]);

  const addedIds = useMemo(() => {
    if (!session) return [];
    return session.exercises.map((e) => getExInfo(e.exerciseId).id);
  }, [session]);

  const getRows = (exId: string): SetRowDraft[] => draftRows[exId] ?? [];

  const addDraftRow = (exId: string, prefillWeight = "", prefillReps = "") => {
    setDraftRows((prev) => ({
      ...prev,
      [exId]: [
        ...(prev[exId] ?? []),
        {
          weight: prefillWeight,
          reps: prefillReps,
          done: false,
          marker: "normal",
        },
      ],
    }));
  };

  const updateDraftRow = (
    exId: string,
    idx: number,
    patch: Partial<SetRowDraft>,
  ) => {
    setDraftRows((prev) => {
      const rows = [...(prev[exId] ?? [])];
      rows[idx] = { ...rows[idx], ...patch };
      return { ...prev, [exId]: rows };
    });
  };

  const handleAddExercises = (exercises: { _id: string }[]) => {
    exercises.forEach((ex) => addExercise({ exerciseId: ex._id }));

    // prefill from prev
    setDraftRows((prev) => {
      const next = { ...prev };
      for (const ex of exercises) {
        if (next[ex._id]?.length) continue;
        const prevSets = previousMap.get(ex._id);
        if (prevSets && prevSets.length > 0) {
          next[ex._id] = prevSets.map((s) => ({
            weight: s.type === "strength" ? String(s.weight) : "",
            reps: s.type === "strength" ? String(s.reps) : "",
            done: false,
            marker: getMarker(s),
          }));
        } else {
          next[ex._id] = [
            { weight: "", reps: "", done: false, marker: "normal" },
          ];
        }
      }
      return next;
    });

    setShowPicker(false);
  };

  // incomplete count
  const incompleteSets = useMemo(() => {
    return Object.values(draftRows).reduce(
      (sum, rows) =>
        sum + rows.filter((r) => !r.done && (r.weight || r.reps)).length,
      0,
    );
  }, [draftRows]);

  const handleFinishClick = () => {
    if (incompleteSets > 0) {
      setConfirmFinish(true);
    } else {
      doFinish();
    }
  };

  const doFinish = () => {
    setConfirmFinish(false);
    if (!session) return;

    // build payload
    const exercisesPayload = session.exercises.map((exLog) => {
      const exId = getExInfo(exLog.exerciseId).id;
      const rows = draftRows[exId] ?? [];
      const doneSets = rows
        .filter((r) => r.done && r.weight && r.reps)
        .map((r) => ({
          type: "strength" as const,
          weight: parseFloat(r.weight),
          reps: parseInt(r.reps, 10),
          unit,
          isWarmup: r.marker === "warmup",
          isDropSet: r.marker === "dropset" || undefined,
          isFailure: r.marker === "failure" || undefined,
        }));
      return {
        exerciseId: exId,
        sets: doneSets,
        notes: exerciseNotes[exId] || undefined,
      };
    });

    completeSession(
      { exercises: exercisesPayload },
      {
        onSuccess: () =>
          navigate(`/workout/${sid}/complete`, { replace: true }),
      },
    );
  };

  const handleDiscard = () => {
    setIsDiscarding(true);
    deleteSession(undefined, {
      onSuccess: () => window.location.replace("/dashboard"),
    });
  };

  // loading
  if (isLoading || isDiscarding) {
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

  if ((isError || !session) && !isDiscarding) {
    return (
      <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[15px] font-bold text-[#f0f0f5]">
            Session not found
          </p>
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="px-6 py-[10px] rounded-[12px] bg-[#1a1a24] border border-[#24242e] text-[13px] font-bold text-[#8b8b9a]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (showPicker) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#0b0b10]">
        <div
          className="h-full max-w-[520px] mx-auto px-5"
          style={{
            paddingTop: "calc(16px + env(safe-area-inset-top))",
            paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
          }}
        >
          <ExercisePicker
            alreadyAddedIds={addedIds}
            onAdd={handleAddExercises}
            onBack={() => setShowPicker(false)}
          />
        </div>
      </div>
    );
  }

  const totalSets = session.exercises.reduce((s, e) => s + e.sets.length, 0);
  const totalVol = session.exercises.reduce(
    (s, e) =>
      s +
      e.sets.reduce(
        (a, st) => (st.type === "strength" ? a + st.weight * st.reps : a),
        0,
      ),
    0,
  );

  return (
    <div className="min-h-screen bg-[#0b0b10] text-[#f0f0f5]">
      {/* header */}
      <div className="sticky top-0 z-30 bg-[#0b0b10]/95 backdrop-blur-md border-b border-[#1a1a22]">
        <div
          className="max-w-[520px] mx-auto px-4 pb-3 flex items-center justify-between"
          style={{ paddingTop: "calc(12px + env(safe-area-inset-top))" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmDiscard(true)}
              className="text-[13px] font-bold text-[#ef4444] hover:text-[#ff6b6b] transition-colors"
            >
              Cancel
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[13px] font-bold text-[#4ade80] tabular-nums">
                {formatTimer(elapsed)}
              </span>
            </div>
          </div>
          <button
            onClick={handleFinishClick}
            disabled={isCompleting}
            className="px-5 py-[9px] rounded-[12px] bg-[#4ade80] text-[#0b0b10] text-[13px] font-extrabold tracking-tight hover:bg-[#5ae88d] active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {isCompleting ? "Finishing…" : "Finish"}
          </button>
        </div>
      </div>

      {/* name */}
      <div className="max-w-[520px] mx-auto px-4 pt-4 pb-1">
        {editingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingName(false);
            }}
            autoFocus
            className="w-full bg-transparent text-[20px] font-black text-[#f0f0f5] tracking-tight outline-none border-b border-[#8b8b9a]/40 pb-1"
          />
        ) : (
          <button
            onClick={() => {
              setEditingName(true);
              setTimeout(() => nameInputRef.current?.focus(), 50);
            }}
            className="text-left w-full"
          >
            <h1 className="text-[20px] font-black text-[#f0f0f5] tracking-tight">
              {workoutName || session.name || "Workout"}
            </h1>
          </button>
        )}
        <p className="text-[11px] text-[#8b8b9a] font-semibold mt-1">
          {new Date(session.date).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          {" · Started "}
          {new Date(session.date).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* stats */}
      <div className="max-w-[520px] mx-auto px-4 pt-3 pb-1 flex gap-[10px]">
        <StatPill label="Exercises" value={session.exercises.length} />
        <StatPill label="Sets" value={totalSets} />
        <StatPill
          label="Volume"
          value={totalVol > 0 ? `${(totalVol / 1000).toFixed(1)}k` : "0"}
          sub="kg"
        />
      </div>

      {/* unit */}
      <div className="max-w-[520px] mx-auto px-4 pt-2 pb-1 flex items-center gap-1">
        <span className="text-[10px] font-semibold text-[#8b8b9a] mr-1">
          Unit:
        </span>
        {(["kg", "lbs"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-2.5 py-[3px] rounded-[6px] text-[10px] font-bold uppercase tracking-wider transition-all ${unit === u ? "bg-[#f0f0f5]/10 text-[#f0f0f5] border border-[#f0f0f5]/20" : "text-[#8b8b9a] border border-transparent"}`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* rest timer */}
      {(restTimer > 0 || restOver) && (
        <div className="max-w-[520px] mx-auto px-4 pt-2">
          <div
            className={`border rounded-[12px] px-4 py-2.5 flex items-center justify-between ${restOver ? "bg-[#4ade80]/10 border-[#4ade80]/25" : "bg-[#1a1a24] border-[#24242e]"}`}
          >
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke={restOver ? "#4ade80" : "#7b9dff"}
                  strokeWidth="1.8"
                />
                <path
                  d="M12 8v4l2 2"
                  stroke={restOver ? "#4ade80" : "#7b9dff"}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`text-[13px] font-bold ${restOver ? "text-[#4ade80]" : "text-[#7b9dff]"}`}
              >
                {restOver
                  ? "Rest Over - Start Next Set!"
                  : `Rest: ${formatTimer(restTimer)}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {!restOver && (
                <>
                  <button
                    onClick={() => setRestTimer((t) => Math.max(0, t - 15))}
                    className="px-2 py-[3px] rounded-[6px] text-[10px] font-bold text-[#7b9dff] bg-[#7b9dff]/10 border border-[#7b9dff]/20 hover:bg-[#7b9dff]/20 transition-colors"
                  >
                    -15s
                  </button>
                  <button
                    onClick={() => setRestTimer((t) => t + 15)}
                    className="px-2 py-[3px] rounded-[6px] text-[10px] font-bold text-[#7b9dff] bg-[#7b9dff]/10 border border-[#7b9dff]/20 hover:bg-[#7b9dff]/20 transition-colors"
                  >
                    +15s
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setRestTimer(0);
                  setRestOver(false);
                }}
                className="text-[11px] font-bold text-[#8b8b9a] hover:text-[#f0f0f5] ml-1"
              >
                {restOver ? "Dismiss" : "Skip"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* exercises */}
      <div
        className="max-w-[520px] mx-auto px-4 pt-3"
        style={{ paddingBottom: "calc(140px + env(safe-area-inset-bottom))" }}
      >
        {session.exercises.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#13131a] border border-[#1e1e28] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="#8b8b9a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[14px] font-bold text-[#f0f0f5]">
              No exercises yet
            </p>
            <p className="text-[12px] text-[#8b8b9a]">
              Tap below to add exercises
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {session.exercises.map((exLog, exIdx) => {
            const ex = getExInfo(exLog.exerciseId);
            const mc = getMuscleColor(ex.muscle);
            const rows = getRows(ex.id);

            // prev sets
            const prevSets = previousMap.get(ex.id) ?? [];
            const getPrev = (idx: number): string => {
              if (idx < prevSets.length) {
                const s = prevSets[idx];
                if (s.type === "strength") return `${s.weight} × ${s.reps}`;
              }
              if (prevSets.length > 0) {
                const last = prevSets[prevSets.length - 1];
                if (last.type === "strength")
                  return `${last.weight} × ${last.reps}`;
              }
              return "-";
            };

            return (
              <div
                key={`${ex.id}-${exIdx}`}
                className="bg-[#13131a] border border-[#1e1e28] rounded-[18px]"
              >
                {/* title */}
                <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-[14px] font-extrabold text-[#f0f0f5] tracking-tight truncate">
                      {ex.name}
                    </p>
                    {ex.muscle && (
                      <span
                        className="shrink-0 text-[8px] font-bold tracking-[0.04em] uppercase px-[5px] py-[1.5px] rounded-[5px] border"
                        style={{
                          background: mc.bg,
                          color: mc.text,
                          borderColor: mc.border,
                        }}
                      >
                        {formatMuscle(ex.muscle)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setExerciseMenu(exerciseMenu === ex.id ? null : ex.id)
                      }
                      className="w-7 h-7 rounded-[8px] bg-[#1a1a24] border border-[#24242e] flex items-center justify-center text-[#8b8b9a] hover:text-[#f0f0f5] transition-colors"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                      </svg>
                    </button>

                    {/* menu */}
                    {exerciseMenu === ex.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setExerciseMenu(null)}
                        />
                        <div className="absolute right-0 top-9 z-50 w-[180px] bg-[#1a1a24] border border-[#2a2a36] rounded-[14px] shadow-xl overflow-hidden animate-fade-in">
                          <button
                            onClick={() => {
                              setEditingNoteEx(
                                editingNoteEx === ex.id ? null : ex.id,
                              );
                              setExerciseMenu(null);
                            }}
                            className="w-full px-4 py-[11px] text-left text-[13px] font-semibold text-[#e0e0ea] hover:bg-[#24242e] transition-colors flex items-center gap-2.5"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M12 20h9"
                                stroke="#7b9dff"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                              <path
                                d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                                stroke="#7b9dff"
                                strokeWidth="1.8"
                              />
                            </svg>
                            {editingNoteEx === ex.id
                              ? "Hide Notes"
                              : exerciseNotes[ex.id]
                                ? "Edit Note"
                                : "Add Note"}
                          </button>
                          <div className="h-px bg-[#2a2a36]" />
                          <button
                            onClick={() => {
                              setConfirmRemoveEx(ex.id);
                              setExerciseMenu(null);
                            }}
                            className="w-full px-4 py-[11px] text-left text-[13px] font-semibold text-[#ef4444] hover:bg-[#24242e] transition-colors flex items-center gap-2.5"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Remove Exercise
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* notes */}
                {editingNoteEx === ex.id && (
                  <div className="px-4 pb-2">
                    <textarea
                      value={exerciseNotes[ex.id] ?? ""}
                      onChange={(e) =>
                        setExerciseNotes((prev) => ({
                          ...prev,
                          [ex.id]: e.target.value,
                        }))
                      }
                      placeholder="Add a note for this exercise…"
                      rows={2}
                      autoFocus
                      className="w-full bg-[#0d0d12] border border-[#24242e] rounded-[10px] px-3 py-2 text-[12px] text-[#e0e0ea] placeholder-[#555568] outline-none focus:border-[#7b9dff]/50 transition-colors resize-none"
                    />
                  </div>
                )}

                {/* saved note */}
                {editingNoteEx !== ex.id && exerciseNotes[ex.id] && (
                  <div className="px-4 pb-2">
                    <p className="text-[11px] text-[#7b9dff]/80 italic leading-snug">
                      📝 {exerciseNotes[ex.id]}
                    </p>
                  </div>
                )}

                {/* confirm remove */}
                {confirmRemoveEx === ex.id && (
                  <div className="px-4 pb-2">
                    <div className="bg-[#ef4444]/[0.06] border border-[#ef4444]/20 rounded-[12px] px-4 py-3 flex items-center justify-between">
                      <span className="text-[12px] text-[#ef4444] font-bold">
                        Remove this exercise?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmRemoveEx(null)}
                          className="px-3 py-[5px] rounded-[8px] bg-[#1a1a24] border border-[#24242e] text-[11px] font-bold text-[#8b8b9a]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            removeExercise(ex.id);
                            setConfirmRemoveEx(null);
                          }}
                          className="px-3 py-[5px] rounded-[8px] bg-[#ef4444] text-white text-[11px] font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* table */}
                <div className="px-3">
                  {/* header */}
                  <div className="grid grid-cols-[36px_1fr_1fr_1fr_36px] gap-1 py-2 border-b border-[#1e1e28]">
                    <span className="text-[10px] font-bold text-[#8b8b9a] text-center">
                      SET
                    </span>
                    <span className="text-[10px] font-bold text-[#8b8b9a] text-center">
                      PREVIOUS
                    </span>
                    <span className="text-[10px] font-bold text-[#8b8b9a] text-center uppercase">
                      {unit}
                    </span>
                    <span className="text-[10px] font-bold text-[#8b8b9a] text-center">
                      REPS
                    </span>
                    <span className="text-[10px] font-bold text-[#8b8b9a] text-center">
                      ✓
                    </span>
                  </div>

                  {/* rows */}
                  {rows.map((row, ri) => {
                    return (
                      <div
                        key={`row-${ri}`}
                        className={`grid grid-cols-[36px_1fr_1fr_1fr_36px] gap-1 items-center py-[8px] border-b border-[#1a1a22] ${row.done ? "bg-[#f0f0f5]/[0.03] rounded-[6px]" : ""}`}
                      >
                        {/* set # */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setSetTypePicker(
                                setTypePicker?.exId === ex.id &&
                                  setTypePicker?.draftIdx === ri
                                  ? null
                                  : { exId: ex.id, draftIdx: ri },
                              )
                            }
                            className={`text-[13px] font-bold text-center w-full rounded-[6px] py-0.5 transition-all ${
                              row.marker === "warmup"
                                ? "text-[#c8a247] bg-[#c8a247]/12"
                                : row.marker === "dropset"
                                  ? "text-[#a78bfa] bg-[#a78bfa]/12"
                                  : row.marker === "failure"
                                    ? "text-[#ef4444] bg-[#ef4444]/12"
                                    : "text-[#8b8b9a]"
                            }`}
                          >
                            {row.marker === "warmup"
                              ? "W"
                              : row.marker === "dropset"
                                ? "D"
                                : row.marker === "failure"
                                  ? "F"
                                  : ri + 1}
                          </button>
                          {setTypePicker?.exId === ex.id &&
                            setTypePicker?.draftIdx === ri && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setSetTypePicker(null)}
                                />
                                <div className="absolute left-0 top-8 z-50 w-[140px] bg-[#1a1a24] border border-[#2a2a36] rounded-[12px] shadow-xl overflow-hidden animate-fade-in">
                                  {[
                                    {
                                      key: "warmup" as SetMarker,
                                      label: "Warmup",
                                      color: "#c8a247",
                                      icon: "W",
                                    },
                                    {
                                      key: "dropset" as SetMarker,
                                      label: "Drop Set",
                                      color: "#a78bfa",
                                      icon: "D",
                                    },
                                    {
                                      key: "failure" as SetMarker,
                                      label: "Failure",
                                      color: "#ef4444",
                                      icon: "F",
                                    },
                                  ].map((opt) => (
                                    <button
                                      key={opt.key}
                                      onClick={() => {
                                        updateDraftRow(ex.id, ri, {
                                          marker:
                                            row.marker === opt.key
                                              ? "normal"
                                              : opt.key,
                                        });
                                        setSetTypePicker(null);
                                      }}
                                      className={`w-full px-3 py-[9px] text-left text-[12px] font-semibold hover:bg-[#24242e] transition-colors flex items-center gap-2.5 ${
                                        row.marker === opt.key
                                          ? "bg-[#24242e]"
                                          : ""
                                      }`}
                                      style={{ color: opt.color }}
                                    >
                                      <span
                                        className="w-5 h-5 rounded-[5px] flex items-center justify-center text-[10px] font-extrabold"
                                        style={{
                                          background: `${opt.color}20`,
                                          color: opt.color,
                                        }}
                                      >
                                        {opt.icon}
                                      </span>
                                      {opt.label}
                                      {row.marker === opt.key && (
                                        <svg
                                          className="ml-auto"
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                        >
                                          <path
                                            d="M5 13l4 4L19 7"
                                            stroke={opt.color}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                        </div>
                        <span className="text-[11px] text-[#8b8b9a] text-center truncate">
                          {getPrev(ri)}
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={row.weight}
                          onChange={(e) =>
                            updateDraftRow(ex.id, ri, {
                              weight: e.target.value,
                            })
                          }
                          className={`w-full rounded-[8px] px-1 py-[6px] text-[14px] font-bold text-[#f0f0f5] text-center placeholder-[#555568] outline-none transition-colors tabular-nums ${
                            row.done
                              ? "bg-transparent border border-transparent focus:border-[#7b9dff]/30 focus:bg-[#0d0d12]"
                              : "bg-[#0d0d12] border border-[#24242e] focus:border-[#7b9dff]/40"
                          }`}
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          value={row.reps}
                          onChange={(e) =>
                            updateDraftRow(ex.id, ri, { reps: e.target.value })
                          }
                          className={`w-full rounded-[8px] px-1 py-[6px] text-[14px] font-bold text-[#f0f0f5] text-center placeholder-[#555568] outline-none transition-colors tabular-nums ${
                            row.done
                              ? "bg-transparent border border-transparent focus:border-[#7b9dff]/30 focus:bg-[#0d0d12]"
                              : "bg-[#0d0d12] border border-[#24242e] focus:border-[#7b9dff]/40"
                          }`}
                        />
                        <button
                          onClick={() => {
                            updateDraftRow(ex.id, ri, { done: !row.done });
                            if (!row.done) setRestTimer(restTarget);
                          }}
                          disabled={!row.weight || !row.reps}
                          className={`w-[34px] h-[34px] rounded-full flex items-center justify-center mx-auto transition-all ${
                            row.done
                              ? "bg-[#4ade80]/15 text-[#4ade80] active:scale-90"
                              : row.weight && row.reps
                                ? "bg-[#1a1a24] border border-[#24242e] text-[#8b8b9a] hover:border-[#e0e0ea] hover:text-[#e0e0ea] active:scale-90"
                                : "bg-[#1a1a24] border border-[#1e1e28] text-[#3a3a4a]"
                          }`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}

                  {/* add set */}
                  <button
                    onClick={() => {
                      const lastRow = rows[rows.length - 1];
                      const pw = lastRow?.weight ?? "";
                      const pr = lastRow?.reps ?? "";
                      addDraftRow(ex.id, pw, pr);
                    }}
                    className="w-full py-[10px] text-[12px] font-bold text-[#8b8b9a] hover:text-[#e0e0ea] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Add Set{" "}
                    {restTarget > 0
                      ? `(${Math.floor(restTarget / 60)}:${String(restTarget % 60).padStart(2, "0")})`
                      : ""}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* add exercise */}
        <button
          onClick={() => setShowPicker(true)}
          className="w-full mt-5 py-[14px] rounded-[16px] bg-[#7b9dff]/10 border border-[#7b9dff]/25 text-[14px] font-extrabold text-[#7b9dff] hover:bg-[#7b9dff]/18 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          Add Exercises
        </button>

        {/* rest config */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-[10px] font-semibold text-[#8b8b9a]">
            Rest timer:
          </span>
          {[60, 90, 120, 180].map((t) => (
            <button
              key={t}
              onClick={() => setRestTarget(t)}
              className={`px-2 py-[2px] rounded-[6px] text-[10px] font-bold transition-all ${restTarget === t ? "bg-[#7b9dff]/15 text-[#7b9dff] border border-[#7b9dff]/30" : "text-[#8b8b9a] border border-transparent"}`}
            >
              {`${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`}
            </button>
          ))}
        </div>
      </div>

      {/* discard */}
      {confirmDiscard && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={() => setConfirmDiscard(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-[#13131a] border border-[#1e1e28] rounded-[20px] p-6"
          >
            <p className="text-[16px] font-extrabold text-[#f0f0f5] mb-1">
              Discard workout?
            </p>
            <p className="text-[13px] text-[#8b8b9a] mb-5">
              This will permanently delete this session and all logged sets.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDiscard(false)}
                className="flex-1 py-[11px] rounded-[12px] bg-[#1a1a24] border border-[#24242e] text-[13px] font-bold text-[#8b8b9a]"
              >
                Keep Going
              </button>
              <button
                onClick={handleDiscard}
                disabled={isDeleting}
                className="flex-1 py-[11px] rounded-[12px] bg-[#ef4444] text-white text-[13px] font-extrabold active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Discard"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* incomplete warning */}
      {confirmFinish && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={() => setConfirmFinish(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-[#13131a] border border-[#1e1e28] rounded-[20px] p-6"
          >
            <p className="text-[16px] font-extrabold text-[#f0f0f5] mb-1">
              Incomplete Sets
            </p>
            <p className="text-[13px] text-[#8b8b9a] mb-5">
              You have {incompleteSets} set{incompleteSets !== 1 ? "s" : ""}{" "}
              that haven't been logged. What do you want to do?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmFinish(false)}
                className="flex-1 py-[11px] rounded-[12px] bg-[#4ade80] text-[#0b0b10] text-[13px] font-extrabold active:scale-[0.97] transition-all"
              >
                Keep Going
              </button>
              <button
                onClick={doFinish}
                disabled={isCompleting}
                className="flex-1 py-[11px] rounded-[12px] bg-[#1a1a24] border border-[#24242e] text-[13px] font-bold text-[#8b8b9a] active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {isCompleting ? "Finishing…" : "Finish Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex-1 bg-[#13131a] border border-[#1e1e28] rounded-[12px] px-3 py-2.5 text-center">
      <p className="text-[9px] font-bold text-[#8b8b9a] tracking-widest uppercase mb-0.5">
        {label}
      </p>
      <p className="text-[16px] font-black text-[#f0f0f5] tabular-nums tracking-tight">
        {value}
        {sub && (
          <span className="text-[10px] font-bold text-[#8b8b9a] ml-0.5">
            {sub}
          </span>
        )}
      </p>
    </div>
  );
}

export default ActiveWorkout;
