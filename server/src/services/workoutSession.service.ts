import WorkoutSession from "../models/workoutSession.model.js";
import WorkoutTemplate from "../models/workoutTemplate.model.js";
import {
  IWorkoutSessionService,
  CreateSessionDto,
  AddExerciseToSessionDto,
  LogSetDto,
} from "../types/workout.service.interfaces.js";
import { IWorkoutSession } from "../types/workout.types.js";
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";

class MongoWorkoutSessionService implements IWorkoutSessionService {
  createSession = async (
    userId: string,
    dto: CreateSessionDto,
  ): Promise<IWorkoutSession> => {
    const name = dto.name ?? `Session - ${new Date().toLocaleDateString()}`;
    const { templateUsed, notes } = dto;

    // Pre-fill exercises from template if provided
    let exercises: {
      exerciseId: Types.ObjectId;
      notes?: string;
      sets: never[];
    }[] = [];
    if (templateUsed) {
      const template = await WorkoutTemplate.findById(templateUsed);
      if (template) {
        exercises = template.exercises.map((e) => ({
          exerciseId: new Types.ObjectId(e.exerciseId),
          notes: e.notes,
          sets: [],
        }));
      }
    }

    const createdSession = await WorkoutSession.create({
      userId,
      name,
      templateUsed,
      notes,
      status: "active",
      date: Date.now(),
      exercises,
    });

    return createdSession;
  };

  addExerciseToSession = async (
    sessionId: string,
    userId: string,
    dto: AddExerciseToSessionDto,
  ): Promise<IWorkoutSession> => {
    const session = await WorkoutSession.findById(sessionId);

    if (!session) {
      throw new ApiError(400, "Session not found");
    }

    if (!session.userId.equals(userId)) {
      throw new ApiError(403, "Unauthorized");
    }

    if (session.status === "completed") {
      throw new ApiError(400, "Cannot modify a completed session");
    }

    session.exercises.push({
      exerciseId: new Types.ObjectId(dto.exerciseId),
      notes: dto.notes,
      sets: [],
    });
    session.markModified("exercises");
    await session.save();

    return session;
  };

  logSet = async (
    sessionId: string,
    userId: string,
    dto: LogSetDto,
  ): Promise<IWorkoutSession> => {
    const session = await WorkoutSession.findById(sessionId);

    if (!session) {
      throw new ApiError(400, "Session not found");
    }

    if (!session.userId.equals(userId)) {
      throw new ApiError(403, "Unauthorized");
    }

    if (session.status === "completed") {
      throw new ApiError(400, "Cannot modify a completed session");
    }

    const exercise = session.exercises.find((e) =>
      e.exerciseId.equals(dto.exerciseId),
    );

    if (!exercise) {
      throw new ApiError(400, "Exercise not found");
    }

    const { exerciseId, ...setData } = dto;

    exercise.sets.push(setData);
    session.markModified("exercises");
    await session.save();

    return session;
  };

  completeSession = async (
    sessionId: string,
    userId: string,
    exerciseSets?: { exerciseId: string; sets: Omit<LogSetDto, 'exerciseId'>[]; notes?: string }[],
  ): Promise<IWorkoutSession> => {
    const session = await WorkoutSession.findById(sessionId);

    if (!session) {
      throw new ApiError(400, "Session not found");
    }

    if (!session.userId.equals(userId)) {
      throw new ApiError(403, "Unauthorized");
    }

    if (session.status === "completed") {
      throw new ApiError(400, "Session is already completed");
    }

    // Bulk-save sets if provided
    if (exerciseSets && exerciseSets.length > 0) {
      for (const entry of exerciseSets) {
        const exercise = session.exercises.find((e) =>
          e.exerciseId.equals(entry.exerciseId),
        );
        if (exercise) {
          exercise.sets = entry.sets as any;
          if (entry.notes) exercise.notes = entry.notes;
        }
      }
      session.markModified("exercises");
    }

    const duration = Math.round(
      (Date.now() - session.date.getTime()) / 1000 / 60,
    );

    session.status = "completed";
    session.duration = duration;

    await session.save();

    return session;
  };

  getSessionById = async (
    sessionId: string,
    userId: string,
  ): Promise<IWorkoutSession | null> => {
    const session = await WorkoutSession.findById(sessionId).populate(
      "exercises.exerciseId",
      "name category muscleGroup",
    );

    if (!session) {
      throw new ApiError(400, "Session not found");
    }

    if (!session.userId.equals(userId)) {
      throw new ApiError(403, "Unauthorized");
    }

    return session;
  };

  getUserSessions = async (
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    sessions: IWorkoutSession[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      WorkoutSession.find({ userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      WorkoutSession.countDocuments({ userId }),
    ]);

    return { sessions, total, page, totalPages: Math.ceil(total / limit) };
  };

  deleteSession = async (sessionId: string, userId: string): Promise<void> => {
    const session = await WorkoutSession.findById(sessionId);

    if (!session) {
      throw new ApiError(400, "Session not found");
    }

    if (!session.userId.equals(userId)) {
      throw new ApiError(403, "Unauthorized");
    }

    await session.deleteOne();

    return;
  };

  removeExerciseFromSession = async (
    sessionId: string,
    userId: string,
    exerciseId: string,
  ): Promise<IWorkoutSession> => {
    const session = await WorkoutSession.findById(sessionId);

    if (!session) {
      throw new ApiError(400, "Session not found");
    }

    if (!session.userId.equals(userId)) {
      throw new ApiError(403, "Unauthorized");
    }

    if (session.status === "completed") {
      throw new ApiError(400, "Cannot modify a completed session");
    }

    session.exercises = session.exercises.filter(
      (e) => !e.exerciseId.equals(exerciseId),
    );
    session.markModified("exercises");
    await session.save();

    return session;
  };

  removeSetFromSession = async (
    sessionId: string,
    userId: string,
    exerciseId: string,
    setIndex: number,
  ): Promise<IWorkoutSession> => {
    const session = await WorkoutSession.findById(sessionId);

    if (!session) {
      throw new ApiError(400, "Session not found");
    }

    if (!session.userId.equals(userId)) {
      throw new ApiError(403, "Unauthorized");
    }

    if (session.status === "completed") {
      throw new ApiError(400, "Cannot modify a completed session");
    }

    const exercise = session.exercises.find((e) =>
      e.exerciseId.equals(exerciseId),
    );

    if (!exercise) {
      throw new ApiError(400, "Exercise not found");
    }

    exercise.sets.splice(setIndex, 1);
    session.markModified("exercises");
    await session.save();

    return session;
  };
}

export default new MongoWorkoutSessionService();
