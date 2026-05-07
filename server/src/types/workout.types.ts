import { Types } from "mongoose";

interface IStrengthSet {
  type: "strength";
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
  isWarmup: boolean;
  isDropSet?: boolean;
  isFailure?: boolean;
}

interface ICardioSet {
  type: "cardio";
  duration: number;
  distance?: number;
  unit?: "km" | "mi";
  avgHeartRate?: number;
}

interface IFlexibilitySet {
  type: "flexibility";
  duration: number;
}

type ISetLog = IStrengthSet | ICardioSet | IFlexibilitySet;

interface IExerciseLog {
  sets: ISetLog[];
  notes?: string;
  exerciseId: Types.ObjectId;
}

interface IWorkoutSession {
  userId: Types.ObjectId;
  name?: string;
  date: Date;
  status: "active" | "completed";
  exercises: IExerciseLog[];
  duration?: number;
  notes?: string;
  templateUsed?: Types.ObjectId;
}

type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "full_body"
  | "upper_body"
  | "lower_body";

interface IExercise {
  name: string;
  category: "strength" | "cardio" | "flexibility";
  muscleGroup: MuscleGroup;
  isCustom: boolean;
  createdBy?: Types.ObjectId;
}

interface IWorkoutTemplate {
  name: string;
  userId: Types.ObjectId;
  exercises: {
    exerciseId: Types.ObjectId;
    targetSets?: number;
    notes?: string;
  }[];
}

export {
  IStrengthSet,
  ICardioSet,
  IFlexibilitySet,
  ISetLog,
  IExerciseLog,
  IWorkoutSession,
  IExercise,
  IWorkoutTemplate,
};
