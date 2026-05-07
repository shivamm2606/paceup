import { useState } from "react";
import { useCreateTemplate } from "../../hooks/workoutTemplate/useCreateTemplate";
import { useUpdateTemplate } from "../../hooks/workoutTemplate/useUpdateTemplate";
import { ExercisePicker } from "./ExercisePicker";
import { getMuscleColor, formatMuscle } from "./templateUtils";
import type { Exercise } from "../../hooks/exercises/useGetExercises";
import type {
  WorkoutTemplate,
  PopulatedExercise,
} from "../../types/workoutTemplate.types";

interface AddedExercise {
  exercise: Exercise;
  targetSets: number;
  notes: string;
}

interface Props {
  onClose: () => void;
  editTemplate?: WorkoutTemplate;
}

function getExercisesFromTemplate(template: WorkoutTemplate): AddedExercise[] {
  return template.exercises
    .filter((ex) => typeof ex.exerciseId === "object")
    .map((ex) => {
      const populated = ex.exerciseId as PopulatedExercise;
      return {
        exercise: {
          _id: populated._id,
          name: populated.name,
          muscleGroup: populated.muscleGroup,
          category: populated.category,
          isCustom: false,
        },
        targetSets: ex.targetSets ?? 3,
        notes: ex.notes ?? "",
      };
    });
}

export function CreateTemplateSheet({ onClose, editTemplate }: Props) {
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
  const isPending = isCreating || isUpdating;
  const isEditMode = !!editTemplate;

  const [name, setName] = useState(() => editTemplate?.name ?? "");
  const [exercises, setExercises] = useState<AddedExercise[]>(() =>
    editTemplate ? getExercisesFromTemplate(editTemplate) : [],
  );
  const [showPicker, setShowPicker] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<number | null>(null);

  const canSave = name.trim().length > 0 && exercises.length > 0;

  const handleClose = () => {
    if (isPending) return;
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const updateExercise = (index: number, patch: Partial<AddedExercise>) =>
    setExercises(
      exercises.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const handleAddExercises = (picked: Exercise[]) =>
    setExercises([
      ...exercises,
      ...picked.map((ex) => ({ exercise: ex, targetSets: 3, notes: "" })),
    ]);

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
    if (expandedNotes === index) setExpandedNotes(null);
  };

  const handleDragReorder = () => {
    if (
      dragIndex != null &&
      dragOverIndex != null &&
      dragIndex !== dragOverIndex
    ) {
      const reordered = [...exercises];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(dragOverIndex, 0, moved);
      setExercises(reordered);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getPayload = () => ({
    name: name.trim(),
    exercises: exercises.map(({ exercise, targetSets, notes }) => ({
      exerciseId: exercise._id,
      targetSets,
      ...(notes.trim() && { notes: notes.trim() }),
    })),
  });

  const handleSave = () => {
    if (!canSave) return;

    if (isEditMode) {
      updateTemplate(
        { templateId: editTemplate._id, data: getPayload() },
        { onSuccess: handleClose },
      );
    } else {
      createTemplate(getPayload(), { onSuccess: handleClose });
    }
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-250 ${closing ? "opacity-0" : "opacity-100"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-panel w-full max-w-[520px] mx-auto bg-[#0d0d12] border-t border-l border-r border-[#1e1e28] rounded-t-[28px] px-5 pb-[90px] max-h-[90vh] flex flex-col"
        style={{
          animation: closing
            ? "sheetDown 0.25s ease-in forwards"
            : "sheetUp 0.34s cubic-bezier(0.22, 1.08, 0.36, 1)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-[14px] pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#2a2a36]" />
        </div>

        {showPicker ? (
          <ExercisePicker
            alreadyAddedIds={exercises.map((e) => e.exercise._id)}
            onAdd={(picked) => {
              handleAddExercises(picked);
              setShowPicker(false);
            }}
            onBack={() => setShowPicker(false)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-1.5 pt-2.5 pb-4 shrink-0">
              <div>
                <p className="text-[11px] font-bold text-[#44445a] tracking-[0.1em] uppercase mb-1.5">
                  {isEditMode ? "Edit" : "New"}
                </p>
                <h2 className="text-[24px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
                  {isEditMode ? "Edit Template" : "Create Template"}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-[12px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center text-[#8b8b9a] hover:text-[#f0f0f5] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Name Input */}
            <div className="shrink-0 mb-4">
              <label className="text-[11px] font-bold text-[#6b6b80] uppercase tracking-[0.06em] mb-2 block">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Push Day"
                maxLength={100}
                className="w-full bg-[#13131a] border border-[#1e1e28] rounded-[14px] px-4 py-[12px] text-[14px] text-[#f0f0f5] placeholder-[#33334a] outline-none focus:border-[#2a2a38] transition-colors"
              />
            </div>

            {/* Exercises List */}
            <div className="overflow-y-auto flex-1 mb-4">
              <label className="text-[11px] font-bold text-[#6b6b80] uppercase tracking-[0.06em] mb-2 block">
                Exercises ({exercises.length})
              </label>

              {exercises.length === 0 && (
                <p className="text-[12px] text-[#44445a] py-4 text-center">
                  No exercises added yet
                </p>
              )}

              <div className="flex flex-col gap-[6px]">
                {exercises.map((item, i) => {
                  const c = getMuscleColor(item.exercise.muscleGroup);
                  const notesOpen = expandedNotes === i;

                  return (
                    <div key={item.exercise._id}>
                      <div
                        draggable
                        onDragStart={() => setDragIndex(i)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverIndex(i);
                        }}
                        onDragEnd={handleDragReorder}
                        className={`flex items-center gap-2 py-[12px] px-[14px] rounded-[14px] bg-[#0f0f15] transition-all duration-100 ${
                          dragOverIndex === i && dragIndex !== i
                            ? "border-t-2 border-[#7b9dff]"
                            : "border-t-2 border-transparent"
                        } ${dragIndex === i ? "opacity-40" : ""}`}
                      >
                        {/* Drag handle */}
                        <div className="shrink-0 cursor-grab active:cursor-grabbing touch-none py-1 px-0.5">
                          <svg
                            width="10"
                            height="16"
                            viewBox="0 0 10 16"
                            fill="none"
                          >
                            <circle cx="2.5" cy="2.5" r="1.2" fill="#44445a" />
                            <circle cx="7.5" cy="2.5" r="1.2" fill="#44445a" />
                            <circle cx="2.5" cy="8" r="1.2" fill="#44445a" />
                            <circle cx="7.5" cy="8" r="1.2" fill="#44445a" />
                            <circle cx="2.5" cy="13.5" r="1.2" fill="#44445a" />
                            <circle cx="7.5" cy="13.5" r="1.2" fill="#44445a" />
                          </svg>
                        </div>

                        {/* Exercise info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#e0e0ea] tracking-tight truncate">
                            {item.exercise.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="inline-block text-[8.5px] font-bold tracking-[0.04em] uppercase px-[6px] py-[1.5px] rounded-[5px] border"
                              style={{
                                background: c.bg,
                                color: c.text,
                                borderColor: c.border,
                              }}
                            >
                              {formatMuscle(item.exercise.muscleGroup)}
                            </span>
                            {/* Notes toggle */}
                            <button
                              onClick={() =>
                                setExpandedNotes(notesOpen ? null : i)
                              }
                              className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                                item.notes
                                  ? "text-[#7b9dff]"
                                  : "text-[#44445a] hover:text-[#6b6b80]"
                              }`}
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M12 20h9M16.376 3.622a2.121 2.121 0 113 3L7.5 18.5 3 20l1.5-4.5L16.376 3.622z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {item.notes ? "Note" : "Add note"}
                            </button>
                          </div>
                        </div>

                        {/* Sets stepper */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() =>
                              updateExercise(i, {
                                targetSets: Math.max(1, item.targetSets - 1),
                              })
                            }
                            className="w-7 h-7 rounded-[8px] bg-[#1a1a24] border border-[#24242e] flex items-center justify-center text-[#6b6b80] hover:text-[#f0f0f5] transition-colors"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 12h14"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                          <span className="w-6 text-center text-[14px] font-black text-[#f0f0f5] tabular-nums">
                            {item.targetSets}
                          </span>
                          <button
                            onClick={() =>
                              updateExercise(i, {
                                targetSets: Math.min(10, item.targetSets + 1),
                              })
                            }
                            className="w-7 h-7 rounded-[8px] bg-[#1a1a24] border border-[#24242e] flex items-center justify-center text-[#6b6b80] hover:text-[#f0f0f5] transition-colors"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M12 5v14M5 12h14"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveExercise(i)}
                          className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#44445a] hover:text-[#ef4444] transition-colors"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M18 6L6 18M6 6l12 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* notes */}
                      {notesOpen && (
                        <div
                          className="mx-[14px] mt-1 mb-1"
                          style={{ animation: "fadeSlideUp 0.15s ease-out" }}
                        >
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) =>
                              updateExercise(i, { notes: e.target.value })
                            }
                            placeholder="e.g. Slow eccentric, pause at bottom…"
                            maxLength={500}
                            className="w-full bg-[#13131a] border border-[#1e1e28] rounded-[10px] px-3 py-[8px] text-[12px] text-[#f0f0f5] placeholder-[#33334a] outline-none focus:border-[#2a2a38] transition-colors"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Exercise Button */}
              <button
                onClick={() => setShowPicker(true)}
                className="w-full mt-3 py-[12px] rounded-[14px] border border-dashed border-[#24242e] text-[#7b9dff] text-[13px] font-bold tracking-tight flex items-center justify-center gap-2 hover:bg-[rgba(123,157,255,0.05)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Add Exercise
              </button>
            </div>

            {/* Save Button */}
            <div className="shrink-0 pt-2 pb-2">
              <button
                onClick={handleSave}
                disabled={!canSave || isPending}
                className={`
                  w-full py-[15px] rounded-[14px] text-[15px] font-extrabold tracking-tight
                  transition-all duration-150
                  ${
                    canSave && !isPending
                      ? "bg-[#4ade80] text-[#0b0b10] hover:bg-[#5eebb0] active:scale-[0.98]"
                      : "bg-[#1a1a24] text-[#44445a] cursor-not-allowed"
                  }
                `}
              >
                {isPending
                  ? "Saving…"
                  : isEditMode
                    ? "Save Changes"
                    : "Save Template"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
