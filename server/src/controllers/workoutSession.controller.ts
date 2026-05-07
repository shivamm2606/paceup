import MongoWorkoutSessionService from "../services/workoutSession.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createSession = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  const createdSession = await MongoWorkoutSessionService.createSession(
    userId,
    req.body,
  );

  res
    .status(201)
    .json(new ApiResponse(201, createdSession, "Session created successfully"));
});

export const deleteSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId as string;
  const userId = req.user._id.toString();

  await MongoWorkoutSessionService.deleteSession(sessionId, userId);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Session deleted successfully"));
});

export const getSessionById = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId as string;
  const userId = req.user._id.toString();

  const session = await MongoWorkoutSessionService.getSessionById(
    sessionId,
    userId,
  );

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session fetched successfully"));
});

export const getAllSessions = asyncHandler(async (req, res) => {
  const { page, limit } = req.query as unknown as {
    page: number;
    limit: number;
  };
  const userId = req.user._id.toString();

  const allSessions = await MongoWorkoutSessionService.getUserSessions(
    userId,
    page,
    limit,
  );

  res.json(
    new ApiResponse(200, allSessions, "All Sessions fetched successfully"),
  );
});

export const addExerciseToSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId as string;
  const userId = req.user._id.toString();

  const updatedSession = await MongoWorkoutSessionService.addExerciseToSession(
    sessionId,
    userId,
    req.body,
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedSession, "Exercise added successfully"));
});

export const logSet = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId as string;
  const userId = req.user._id.toString();

  const updatedSession = await MongoWorkoutSessionService.logSet(
    sessionId,
    userId,
    req.body,
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedSession, "Set logged successfully"));
});

export const completeSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId as string;
  const userId = req.user._id.toString();

  const session = await MongoWorkoutSessionService.completeSession(
    sessionId,
    userId,
    req.body?.exercises,
  );

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session completed successfully"));
});

export const removeExerciseFromSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId as string;
  const exerciseId = req.params.exerciseId as string;
  const userId = req.user._id.toString();

  const session = await MongoWorkoutSessionService.removeExerciseFromSession(
    sessionId,
    userId,
    exerciseId,
  );

  res
    .status(200)
    .json(new ApiResponse(200, session, "Exercise removed successfully"));
});

export const removeSetFromSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId as string;
  const exerciseId = req.params.exerciseId as string;
  const setIndex = Number(req.params.setIndex); // Already validated as non-negative int by Zod
  const userId = req.user._id.toString();

  const session = await MongoWorkoutSessionService.removeSetFromSession(
    sessionId,
    userId,
    exerciseId,
    setIndex,
  );

  res
    .status(200)
    .json(new ApiResponse(200, session, "Set removed successfully"));
});
