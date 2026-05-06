import { useState } from "react";
import { useGetExercises } from "../../hooks/exercises/useGetExercises";
import {
  getMuscleColor,
  formatMuscle,
  MUSCLE_GROUPS,
  CATEGORIES,
} from "./templateUtils";
import type { Exercise } from "../../hooks/exercises/useGetExercises";

interface Props {
  alreadyAddedIds: string[];
  onAdd: (exercises: Exercise[]) => void;
  onBack: () => void;
}

export function ExercisePicker({ alreadyAddedIds, onAdd, onBack }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [openFilter, setOpenFilter] = useState<"muscle" | "category" | null>(
    null,
  );

  const {
    data: exercises = [],
    isLoading,
    isError,
  } = useGetExercises({
    search: search || undefined,
    muscleGroup: selectedMuscle || undefined,
    category: selectedCategory || undefined,
  });

  const handleToggleExercise = (exercise: Exercise) => {
    if (selected.find((s) => s._id === exercise._id)) {
      setSelected(selected.filter((s) => s._id !== exercise._id));
    } else {
      setSelected([...selected, exercise]);
    }
  };

  const handleSelectFilter = (value: string) => {
    if (openFilter === "muscle") {
      setSelectedMuscle(selectedMuscle === value ? "" : value);
    } else {
      setSelectedCategory(selectedCategory === value ? "" : value);
    }
    setOpenFilter(null);
  };

  const handleClearFilter = () => {
    if (openFilter === "muscle") setSelectedMuscle("");
    else setSelectedCategory("");
    setOpenFilter(null);
  };

  const filterItems =
    openFilter === "muscle" ? [...MUSCLE_GROUPS] : [...CATEGORIES];
  const activeFilter =
    openFilter === "muscle" ? selectedMuscle : selectedCategory;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1.5 pt-2.5 pb-4 shrink-0">
        <div>
          <p className="text-[11px] font-bold text-[#44445a] tracking-[0.1em] uppercase mb-1.5">
            Select
          </p>
          <h2 className="text-[24px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
            Add Exercises
          </h2>
        </div>
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-[12px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center text-[#8b8b9a] hover:text-[#f0f0f5] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M11 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 mb-3">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="#44445a" strokeWidth="2" />
            <path
              d="M20 20l-4-4"
              stroke="#44445a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="w-full bg-[#13131a] border border-[#1e1e28] rounded-[12px] pl-10 pr-4 py-[10px] text-[13px] text-[#f0f0f5] placeholder-[#44445a] outline-none focus:border-[#2a2a38] transition-colors"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="shrink-0 mb-3 flex gap-[8px] relative">
        <button
          onClick={() =>
            setOpenFilter(openFilter === "muscle" ? null : "muscle")
          }
          className={`flex items-center gap-1.5 text-[11px] font-bold tracking-tight px-3 py-[7px] rounded-[10px] border transition-all duration-150 ${
            selectedMuscle
              ? "bg-[rgba(123,157,255,0.12)] text-[#7b9dff] border-[rgba(123,157,255,0.25)]"
              : "bg-[#13131a] text-[#6b6b80] border-[#1e1e28]"
          }`}
        >
          {selectedMuscle ? formatMuscle(selectedMuscle) : "Body Part"}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={() =>
            setOpenFilter(openFilter === "category" ? null : "category")
          }
          className={`flex items-center gap-1.5 text-[11px] font-bold tracking-tight px-3 py-[7px] rounded-[10px] border transition-all duration-150 ${
            selectedCategory
              ? "bg-[rgba(123,157,255,0.12)] text-[#7b9dff] border-[rgba(123,157,255,0.25)]"
              : "bg-[#13131a] text-[#6b6b80] border-[#1e1e28]"
          }`}
        >
          {selectedCategory ? formatMuscle(selectedCategory) : "Category"}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {openFilter && (
          <>
            <div
              className="fixed inset-0 z-[70]"
              onClick={() => setOpenFilter(null)}
            />
            <div className="absolute top-[42px] left-0 z-[71] bg-[#16161e] border border-[#24242e] rounded-[12px] p-1.5 w-[140px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <button
                onClick={handleClearFilter}
                className={`w-full text-left px-3 py-[7px] rounded-[8px] text-[12px] font-bold transition-colors ${
                  !activeFilter
                    ? "text-[#7b9dff] bg-[rgba(123,157,255,0.08)]"
                    : "text-[#8b8b9a] hover:bg-[#1a1a24]"
                }`}
              >
                All
              </button>
              {filterItems.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSelectFilter(item)}
                  className={`w-full text-left px-3 py-[7px] rounded-[8px] text-[12px] font-bold transition-colors ${
                    activeFilter === item
                      ? "text-[#7b9dff] bg-[rgba(123,157,255,0.08)]"
                      : "text-[#8b8b9a] hover:bg-[#1a1a24]"
                  }`}
                >
                  {formatMuscle(item)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Exercise List */}
      <div className="overflow-y-auto flex-1">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-[13px] text-[#44445a]">Loading exercises…</p>
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-[13px] text-[#ef4444]">
              Failed to load exercises
            </p>
            <p className="text-[11px] text-[#6b6b80]">Check your connection</p>
          </div>
        )}

        {!isLoading && !isError && exercises.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-[13px] text-[#44445a]">No exercises found</p>
          </div>
        )}

        {exercises.length > 0 && (
          <div className="flex flex-col gap-[2px]">
            {exercises.map((ex) => {
              const alreadyAdded = alreadyAddedIds.includes(ex._id);
              const checked = selected.some((s) => s._id === ex._id);
              const muscleColor = getMuscleColor(ex.muscleGroup);

              return (
                <button
                  key={ex._id}
                  onClick={() => !alreadyAdded && handleToggleExercise(ex)}
                  disabled={alreadyAdded}
                  className={`w-full flex items-center gap-3 py-[12px] px-[14px] rounded-[12px] text-left transition-all duration-150 ${
                    alreadyAdded
                      ? "opacity-35 cursor-not-allowed"
                      : checked
                        ? "bg-[rgba(123,157,255,0.06)]"
                        : "hover:bg-[#15151d]"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-[6px] border shrink-0 flex items-center justify-center transition-all duration-150 ${
                      alreadyAdded
                        ? "bg-[#1a1a24] border-[#24242e]"
                        : checked
                          ? "bg-[#7b9dff] border-[#7b9dff]"
                          : "bg-[#13131a] border-[#24242e]"
                    }`}
                  >
                    {(checked || alreadyAdded) && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke={alreadyAdded ? "#44445a" : "#0b0b10"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Name + muscle tag */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#e0e0ea] tracking-tight truncate">
                      {ex.name}
                    </p>
                    <span
                      className="inline-block mt-1 text-[8.5px] font-bold tracking-[0.04em] uppercase px-[6px] py-[1.5px] rounded-[5px] border"
                      style={{
                        background: muscleColor.bg,
                        color: muscleColor.text,
                        borderColor: muscleColor.border,
                      }}
                    >
                      {formatMuscle(ex.muscleGroup)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="shrink-0 pt-4 pb-2">
        <button
          onClick={() => selected.length > 0 && onAdd(selected)}
          disabled={selected.length === 0}
          className={`
            w-full py-[14px] rounded-[14px] text-[14px] font-extrabold tracking-tight
            transition-all duration-150
            ${
              selected.length > 0
                ? "bg-[#7b9dff] text-[#0b0b10] hover:bg-[#8daeff] active:scale-[0.98]"
                : "bg-[#1a1a24] text-[#44445a] cursor-not-allowed"
            }
          `}
        >
          {selected.length > 0
            ? `Add ${selected.length} Exercise${selected.length !== 1 ? "s" : ""}`
            : "Select exercises"}
        </button>
      </div>
    </div>
  );
}
