import {
  budgets,
  goals,
  scopes,
  stages,
  timings,
  type Goal,
} from "./blueprint.ts";
export type Draft = {
  goal: Goal | "";
  stage: string;
  features: string[];
  context: string;
  budget: string;
  timing: string;
};
export const empty: Draft = {
  goal: "",
  stage: "",
  features: [],
  context: "",
  budget: "discuss",
  timing: "flexible",
};
export const storageKey = "cynbit-blueprint-draft-v1";
export function safeDraft(raw: string): Draft | null {
  try {
    const value = JSON.parse(raw),
      d = value.draft;
    if (
      value.version !== 1 ||
      !Number.isFinite(value.savedAt) ||
      value.savedAt > Date.now() ||
      Date.now() - value.savedAt > 604800000
    )
      return null;
    if (
      !d ||
      !goals.some((g) => g.id === d.goal) ||
      typeof d.context !== "string" ||
      d.context.length > 600
    )
      return null;
    return {
      goal: d.goal,
      stage: stages.some((s) => s.id === d.stage) ? d.stage : "",
      features: Array.isArray(d.features)
        ? [...new Set<string>(d.features)].filter((id) =>
            scopes[d.goal as Goal].some((f) => f.id === id),
          )
        : [],
      context: d.context,
      budget: budgets.some((b) => b.id === d.budget) ? d.budget : "discuss",
      timing: timings.some((t) => t.id === d.timing) ? d.timing : "flexible",
    };
  } catch {
    return null;
  }
}
