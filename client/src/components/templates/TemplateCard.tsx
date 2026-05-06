import type {
  WorkoutTemplate,
  PopulatedExercise,
} from "../../types/workoutTemplate.types";
import { getMuscleColor, formatMuscle } from "./templateUtils";

interface TemplateCardProps {
  template: WorkoutTemplate;
  onClick: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const uniqueMuscleGroups: string[] = [];
  for (const ex of template.exercises) {
    if (typeof ex.exerciseId === "object" && ex.exerciseId !== null) {
      const group = (ex.exerciseId as PopulatedExercise).muscleGroup;
      if (group && !uniqueMuscleGroups.includes(group))
        uniqueMuscleGroups.push(group);
    }
    if (uniqueMuscleGroups.length >= 4) break;
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-[#121216] hover:bg-[#15151d] border border-[#1a1a20] hover:border-[#2a2a38] rounded-[18px] p-[18px] text-left transition-all duration-150 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-extrabold text-[#f0f0f5] tracking-tight leading-snug truncate">
            {template.name}
          </p>
          <p className="text-[12px] text-[#6b6b80] mt-1">
            {template.exercises.length} exercise
            {template.exercises.length !== 1 ? "s" : ""}
          </p>

          {uniqueMuscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-[5px] mt-2.5">
              {uniqueMuscleGroups.map((group) => {
                const muscleColor = getMuscleColor(group);
                return (
                  <span
                    key={group}
                    className="text-[9px] font-bold tracking-[0.04em] uppercase px-[7px] py-[2.5px] rounded-md border"
                    style={{
                      background: muscleColor.bg,
                      color: muscleColor.text,
                      borderColor: muscleColor.border,
                    }}
                  >
                    {formatMuscle(group)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-7 h-7 rounded-[9px] bg-[#1a1a24] border border-[#24242e] flex items-center justify-center shrink-0 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7h8M7 3l4 4-4 4"
              stroke="#55556a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}
