import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";

export const createSessionSchema = z.object({
  name: z.string().trim().max(100).optional(),
  templateUsed: mongoIdSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const addExerciseToSessionSchema = z.object({
  exerciseId: mongoIdSchema,
  notes: z.string().max(500).optional(),
});

const strengthSetSchema = z.object({
  exerciseId: mongoIdSchema,
  type: z.literal("strength"),
  reps: z.int().min(0),
  weight: z.number().min(0),
  unit: z.enum(["kg", "lbs"]),
  isWarmup: z.boolean(),
  isDropSet: z.boolean().optional(),
  isFailure: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

const cardioSetSchema = z.object({
  exerciseId: mongoIdSchema,
  type: z.literal("cardio"),
  duration: z.number().positive(),
  distance: z.number().positive().optional(),
  unit: z.enum(["km", "mi"]).optional(),
  avgHeartRate: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

const flexibilitySetSchema = z.object({
  exerciseId: mongoIdSchema,
  type: z.literal("flexibility"),
  duration: z.number().positive(),
  notes: z.string().max(500).optional(),
});

export const logSetSchema = z.discriminatedUnion("type", [
  strengthSetSchema,
  cardioSetSchema,
  flexibilitySetSchema,
]);

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type AddExerciseToSessionDto = z.infer<
  typeof addExerciseToSessionSchema
>;
export type LogSetDto = z.infer<typeof logSetSchema>;
