const UPPER_BODY = ["chest", "back", "shoulders", "arms", "upper_body"];
const LOWER_BODY = ["legs", "lower_body"];

export function getMuscleColor(muscle: string) {
  if (UPPER_BODY.includes(muscle)) {
    return {
      bg: "rgba(120,155,220,0.12)",
      text: "#8eaacc",
      border: "rgba(120,155,220,0.28)",
    };
  }
  if (LOWER_BODY.includes(muscle)) {
    return {
      bg: "rgba(80,200,140,0.10)",
      text: "#6bc9a0",
      border: "rgba(80,200,140,0.25)",
    };
  }
  return {
    bg: "rgba(170,140,220,0.11)",
    text: "#ab97d4",
    border: "rgba(170,140,220,0.26)",
  };
}

export function formatMuscle(raw: string) {
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full_body",
  "upper_body",
  "lower_body",
] as const;

export const CATEGORIES = ["strength", "cardio", "flexibility"] as const;
