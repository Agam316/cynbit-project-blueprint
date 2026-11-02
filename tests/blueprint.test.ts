import test from "node:test";
import assert from "node:assert/strict";
import {
  createBlueprint,
  formatBrief,
  inputSchema,
  scopes,
  type BlueprintInput,
} from "../lib/blueprint.ts";
import { POST } from "../app/api/blueprint/route.ts";
import { safeDraft } from "../lib/draft.ts";

test("draft parser rejects corrupt, obsolete, expired, and future-dated data", () => {
  for (const raw of [
    "{",
    "null",
    JSON.stringify({ version: 0 }),
    JSON.stringify({ version: 1, savedAt: 0 }),
    JSON.stringify({ version: 1, savedAt: Date.now() + 999999 }),
  ])
    assert.equal(safeDraft(raw), null);
});
test("draft parser removes incompatible features and resets invalid optional choices", () => {
  const draft = {
    goal: "automate",
    stage: "fake",
    features: ["leads", "leads", "payments"],
    context: "Draft",
    budget: "fake",
    timing: "fake",
  };
  const parsed = safeDraft(
    JSON.stringify({ version: 1, savedAt: Date.now(), draft }),
  );
  assert.deepEqual(parsed?.features, ["leads"]);
  assert.equal(parsed?.budget, "discuss");
  assert.equal(parsed?.stage, "");
});

const example: BlueprintInput = {
  goal: "automate",
  stage: "existing",
  features: ["leads", "integration"],
  context: "Route qualified leads to our CRM.",
  budget: "discuss",
  timing: "flexible",
};
const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("https://demo.example/api/blueprint", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
test("routes all five business goals to distinct service paths", () => {
  const names = new Set<string>();
  for (const goal of Object.keys(scopes) as BlueprintInput["goal"][]) {
    const input = { ...example, goal, features: [scopes[goal][0].id] };
    assert.ok(inputSchema.safeParse(input).success);
    names.add(createBlueprint(input).service);
  }
  assert.equal(names.size, 5);
});
test("refuses focus areas from a different service", () =>
  assert.equal(
    inputSchema.safeParse({ ...example, features: ["payments"] }).success,
    false,
  ));
test("requires an outcome, starting point, and at least one focus area", () => {
  for (const input of [
    { ...example, goal: "" },
    { ...example, stage: "" },
    { ...example, features: [] },
  ])
    assert.equal(inputSchema.safeParse(input).success, false);
});
test("rejects unknown fields, duplicate features, unsupported constraints, and oversized context", () => {
  for (const patch of [
    { email: "test@example.com" },
    { features: ["leads", "leads"] },
    { budget: "cheap" },
    { timing: "tomorrow" },
    { context: "x".repeat(601) },
  ])
    assert.equal(
      inputSchema.safeParse({ ...example, ...patch }).success,
      false,
    );
});
test("accepts and preserves international text; trims context", () => {
  const parsed = inputSchema.parse({
    ...example,
    context: "  नमस्ते — ₹ budget  ",
  });
  assert.equal(parsed.context, "नमस्ते — ₹ budget");
});
test("broad urgent scope produces explicit phased delivery guidance", () => {
  const b = createBlueprint({
    ...example,
    features: ["leads", "documents", "support", "integration"],
    timing: "soon",
    budget: "under1",
  });
  assert.equal(b.approach, "A focused pilot, then a phased rollout");
  assert.ok(b.considerations.some((c) => c.includes("within a month")));
  assert.ok(b.considerations.some((c) => c.includes("not Cynbit pricing")));
  assert.ok(b.considerations.some((c) => c.includes("human escalation")));
});
test("focused software build includes payment-specific planning", () => {
  const b = createBlueprint({
    ...example,
    goal: "build",
    features: ["payments"],
    budget: "3to10",
  });
  assert.ok(b.considerations.some((c) => c.includes("webhook")));
  assert.equal(b.approach, "Validate, build, and measure");
});
test("uncertain visitors receive discovery, not an invented technology prescription", () => {
  const b = createBlueprint({
    ...example,
    goal: "explore",
    features: ["unclear"],
  });
  assert.equal(b.service, "Discovery & opportunity mapping");
  assert.equal(b.approach, "Discovery before a build commitment");
});
test("export retains all planning data, unicode, and unsent status", () => {
  const b = createBlueprint(example, new Date("2026-11-02T18:00:00Z")),
    text = formatBrief(b);
  for (const value of [
    b.service,
    b.context,
    b.focus[0],
    b.stage,
    b.budget,
    b.timing,
    b.questions[0],
    b.acceptance[0],
    b.considerations[0],
    "not been sent to Cynbit",
    "2026-11-02",
  ])
    assert.ok(text.includes(value));
});
test("API returns a valid no-store blueprint", async () => {
  const response = await POST(req(example, { Origin: "https://demo.example" }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = (await response.json()) as { blueprint: { service: string } };
  assert.equal(body.blueprint.service, "AI & workflow automation");
});
test("API rejects cross-origin requests", async () =>
  assert.equal(
    (await POST(req(example, { Origin: "https://evil.example" }))).status,
    403,
  ));
test("API rejects unsupported content types", async () =>
  assert.equal(
    (await POST(req(example, { "Content-Type": "text/plain" }))).status,
    415,
  ));
test("API rejects malformed JSON", async () =>
  assert.equal(
    (
      await POST(
        new Request("https://demo.example/api/blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{",
        }),
      )
    ).status,
    400,
  ));
test("API rejects oversize UTF-8 bodies without trusting Content-Length", async () =>
  assert.equal(
    (await POST(req({ ...example, context: "字".repeat(3000) }))).status,
    413,
  ));
test("API returns field errors for invalid input", async () => {
  const response = await POST(req({ ...example, features: [] }));
  assert.equal(response.status, 422);
  const body = (await response.json()) as { fields: { features: string[] } };
  assert.ok(body.fields.features.length);
});
