"use client";
import { useEffect, useRef, useState } from "react";
import {
  blueprintSchema,
  formatBrief,
  type Blueprint,
  type Goal,
} from "@/lib/blueprint";
import { empty, storageKey, safeDraft, type Draft } from "@/lib/draft";
export function useDiscovery() {
  const [draft, setDraft] = useState<Draft>(empty),
    [step, setStep] = useState(0),
    [restored, setRestored] = useState(false),
    [ready, setReady] = useState(false),
    [canSave, setCanSave] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState<Blueprint | null>(null),
    [notice, setNotice] = useState(""),
    [confirmReset, setConfirmReset] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null),
    resultHeading = useRef<HTMLHeadingElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    request = useRef<AbortController | null>(null),
    focusNext = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey),
        saved = raw ? safeDraft(raw) : null;
      if (saved) {
        setDraft(saved);
        setRestored(true);
      } else if (raw) localStorage.removeItem(storageKey);
    } catch {
      setCanSave(false);
    }
    setReady(true);
    return () => request.current?.abort();
  }, []);
  useEffect(() => {
    if (!ready || !draft.goal) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ version: 1, savedAt: Date.now(), draft }),
        );
      } catch {
        setCanSave(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, ready]);
  useEffect(() => {
    if (focusNext.current) {
      (result ? resultHeading.current : heading.current)?.focus({
        preventScroll: true,
      });
      focusNext.current = false;
    }
  }, [step, result]);
  useEffect(() => {
    if (confirmReset) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirmReset]);
  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors({});
    setNotice("");
  }
  function chooseGoal(goal: Goal) {
    setDraft((d) => ({
      ...d,
      goal,
      features: d.goal === goal ? d.features : [],
    }));
    setErrors({});
  }
  function move(next: number) {
    focusNext.current = true;
    setStep(next);
    setErrors({});
    setNotice("");
  }
  function validate() {
    const e: Record<string, string> = {};
    if (step === 0 && !draft.goal)
      e.goal = "Choose a goal, or select “I’m still figuring it out.”";
    if (step === 1 && !draft.stage) e.stage = "Choose your starting point.";
    if (step === 1 && !draft.features.length)
      e.features = "Choose at least one focus area.";
    setErrors(e);
    if (Object.keys(e).length)
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>('[aria-invalid="true"] input')
          ?.focus(),
      );
    return !Object.keys(e).length;
  }
  async function generate() {
    if (busy) return;
    setBusy(true);
    setErrors({});
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
        signal: controller.signal,
      });
      const data = (await response.json()) as {
        error?: string;
        blueprint?: Blueprint;
      };
      if (!response.ok)
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      const parsed = blueprintSchema.safeParse(data.blueprint);
      if (!parsed.success)
        throw new Error("The blueprint could not be read. Please try again.");
      if (request.current !== controller) return;
      focusNext.current = true;
      setResult(parsed.data);
      setRestored(false);
    } catch (err) {
      if (request.current !== controller) return;
      setErrors({
        request:
          err instanceof Error && err.name !== "AbortError"
            ? err.message
            : "The connection took too long. Your answers are still here — please try again.",
      });
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  function reset() {
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setResult(null);
    setDraft(empty);
    setErrors({});
    setRestored(false);
    setConfirmReset(false);
    setNotice("Draft cleared. Start fresh whenever you’re ready.");
    focusNext.current = true;
    setStep(0);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setTimeout(() => heading.current?.focus({ preventScroll: true }), 50);
  }
  function download(kind: "txt" | "json") {
    if (!result) return;
    const blob = new Blob(
      [kind === "json" ? JSON.stringify(result, null, 2) : formatBrief(result)],
      {
        type: kind === "json" ? "application/json" : "text/plain;charset=utf-8",
      },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `cynbit-project-blueprint.${kind}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      "Your brief is ready to download. It has not been sent to Cynbit.",
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(formatBrief(result!));
      setNotice("Brief copied. Ready to share when you are.");
    } catch {
      setNotice(
        "Clipboard access is unavailable. Download your brief instead.",
      );
    }
  }
  return {
    ready,
    draft,
    step,
    restored,
    canSave,
    errors,
    busy,
    result,
    notice,
    confirmReset,
    heading,
    resultHeading,
    dialog,
    setConfirmReset,
    change,
    chooseGoal,
    move,
    validate,
    generate,
    reset,
    download,
    copy,
    printBrief() {
      const closed = Array.from(
        document.querySelectorAll<HTMLDetailsElement>(
          ".result-details:not([open])",
        ),
      );
      closed.forEach((d) => {
        d.open = true;
      });
      const restore = () => {
        closed.forEach((d) => {
          d.open = false;
        });
        window.removeEventListener("afterprint", restore);
      };
      window.addEventListener("afterprint", restore, { once: true });
      window.print();
    },
    editAnswers() {
      focusNext.current = true;
      setResult(null);
      setStep(2);
      setNotice("");
    },
  };
}
