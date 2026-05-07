export interface IStrengthSet {
  type: "strength";
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
  isWarmup: boolean;
  isDropSet?: boolean;
  isFailure?: boolean;
}

export interface ICardioSet {
  type: "cardio";
  duration: number;
  distance?: number;
  unit?: "km" | "mi";
  avgHeartRate?: number;
}

export interface IFlexibilitySet {
  type: "flexibility";
  duration: number;
}

export type ISetLog = IStrengthSet | ICardioSet | IFlexibilitySet;

export interface IExerciseLog {
  sets: ISetLog[];
  notes?: string;
  exerciseId: string;
}

export interface IWorkoutSession {
  _id: string;
  userId: string;
  name?: string;
  date: string;
  status: "active" | "completed";
  exercises: IExerciseLog[];
  duration?: number;
  notes?: string;
  templateUsed?: string;
}

export interface PaginatedSessions {
  sessions: IWorkoutSession[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateSessionPayload {
  name?: string;
  templateUsed?: string;
  notes?: string;
}

export interface AddExercisePayload {
  exerciseId: string;
  notes?: string;
}

export interface LogSetPayload {
  exerciseId: string;
  notes?: string;
}

export type StrengthSetPayload = IStrengthSet & LogSetPayload;
export type CardioSetPayload = ICardioSet & LogSetPayload;
export type FlexibilitySetPayload = IFlexibilitySet & LogSetPayload;
