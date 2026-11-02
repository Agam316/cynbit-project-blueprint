# Cynbit Project Blueprint — Technical report

**Assessment:** Full Stack Developer Intern · **Author:** Agampal Singh · **Date:** November 3, 2026 (IST)

## Problem and decision

Cynbit's homepage sends discovery traffic to a contact form requiring name, email, and an open-ended message. Company and industry are optional. The inspected form offers no structured goal, scope, budget, or timing inputs. Visitors must translate a business problem into a technical inquiry themselves, while the receiving team must clarify those details later. Five controls also lacked associated HTML labels and `aria-label`/`aria-labelledby` attributes. [Audit and alternatives](AUDIT.md) include the evidence and limits of this read-only review.

The chosen improvement is a **Guided Project Blueprint**: three short steps that turn a goal into a service recommendation, phased approach, discovery questions, and a portable brief. This targets the existing discovery journey, gives visitors immediate value, and can improve the completeness of future inquiries. It has a clearer, testable purpose than a generic chatbot and can be integrated without redesigning the whole site.

## Working behavior

1. **Goal:** automation, new software, modernization, digital growth, or exploratory discovery.
2. **Scope:** starting point, relevant focus areas, and optional context.
3. **Priorities:** budget and timing, including explicit undecided options.

The server validates these answers and returns an explainable recommendation. For example, a broad scope with a one-month deadline produces a focused-pilot recommendation and a question about what can wait. Payment features add provider/webhook planning; document or support automation adds data and human-escalation considerations. Suggestions are clearly distinguished from Cynbit-approved prices or commitments.

Visitors can edit answers, restore a browser draft, download text/JSON, copy the brief, print it, or open a prefilled email draft. Opening the email link does not send anything. A direct-contact route remains available. No identity details are required to generate a blueprint.

## Stack and implementation

| Choice | Reason |
| --- | --- |
| React 19 and TypeScript | Explicit state and types for a multi-step interaction; familiar maintenance model. |
| Next.js App Router conventions through Vinext/Vite | Shared UI/API project with the supplied Sites adapter for Cloudflare Workers. Vinext is a beta hosting dependency; validate upgrades before adopting it in Cynbit's production stack. |
| Zod | Shared domain contract, server validation, and runtime validation of successful API responses. |
| Native controls and authored CSS | Predictable keyboard behavior and a small UI dependency surface; matches Cynbit's teal, peach, typography, and logo. |
| Stateless Worker API | No database, credentials, paid AI dependency, or retained inquiry records are needed for deterministic recommendations. |

`lib/blueprint.ts` contains framework-independent rules and serialization. `lib/draft.ts` validates versioned browser storage. `hooks/use-discovery.ts` owns transitions, focus, asynchronous requests, and exports. `app/page.tsx` renders the interface; `app/api/blueprint/route.ts` is the HTTP boundary. Hosting integration is isolated in `worker/` and `scripts/`.

The POST endpoint caps the actual streamed request at **8 KiB**, rejects incompatible or duplicate scope choices and unknown fields, limits context to 600 characters, rejects mismatched browser origins, and returns `no-store` responses. It performs no external calls and application code neither stores nor logs request bodies. The origin check is not authentication or bot protection. Browser drafts expire after seven days of inactivity on the next visit and can be cleared immediately. Storage denial does not block the journey.

The client guards pre-hydration interaction, aborts requests after 12 seconds, ignores stale results, preserves inputs after failures, and checks the response schema before showing success. React renders context as text. Native radios, checkboxes, a confirmation dialog, labels, error descriptions, and deliberate focus movement support keyboard use. Fonts are self-hosted with license files; no analytics SDK or third-party font request is added.

## Verification and measured results

| Check | Observed result |
| --- | --- |
| TypeScript | `npm run typecheck` passed. |
| Domain/API tests | **17 passed**: five service paths, validation, conditional rules, exports, drafts, and HTTP error boundaries. |
| Browser tests | **15 passed** in 52.6 seconds using local Chrome against the development server; no retries. |
| Accessibility | **0 axe violations** for the selected WCAG 2 A/AA and 2.1 AA rules across three steps and the result. Keyboard selection and focus also checked. This is not a full accessibility certification or screen-reader audit. |
| Responsive layout | No horizontal overflow at **320, 390, 768, and 1440 px** on the entry and result views; desktop/mobile screenshots inspected. |
| Production build | Sites/Vinext build completed successfully. |
| Local API sample | **30 warm sequential requests: median 45.88 ms, p95 65.08 ms**, without throttling, against the development preview on this Windows machine. |
| Emitted client assets | All emitted JS: **474,565 bytes raw / 139,844 bytes gzip**. CSS: **27,390 bytes raw / 6,282 bytes gzip**. Gzip figures sum independently compressed files, not observed browser transfer. |

The browser suite also checks failed-request retry, malformed responses, blocked storage, draft refresh/reset, download contents, email-draft contents, XSS escaping, and print summary contents. See [test summary](evidence/test-summary.json), [measurement output](evidence/metrics.json), and [desktop](evidence/desktop.png), [mobile](evidence/mobile.png), and [result](evidence/result.png) captures. Run `node scripts/measure.mjs` with a server on port 4173 after building to reproduce the asset/API sample.

**Verification limits:** native esbuild directory traversal prevented the local Wrangler production preview from starting in the Windows sandbox. Local browser results therefore describe the development server. GitHub Actions is configured to build and test the production Worker on Ubuntu, but has not run on GitHub. No field performance, cold-start load test, original-site speed comparison, or conversion uplift is claimed.

## Business evaluation and integration

The measurable improvement delivered here is a completed, validated brief with structured qualification fields and a recommendation, available without supplying personal details. Whether that increases qualified inquiries remains a business hypothesis.

For a production experiment, keep the current contact path as control and offer the blueprint to a randomly assigned cohort. Define a qualified inquiry with Cynbit before launch. Use **qualified inquiries per eligible session** as the primary metric; track step completion, brief generation, export, and handoff as diagnostic events without free-text payloads. An email-draft click is only intent, not a delivered inquiry. Guardrails should include abandonment, errors, page performance, direct-contact use, and sales-team time spent clarifying scope. Establish baseline traffic and a minimum useful effect before selecting sample size and duration; report uncertainty rather than stopping when a favorable result appears.

Cynbit should review the service rules and connect consent-based inquiry submission to its existing backend/CRM if adopted. Add operational ownership, abuse controls, and retention policy at that integration boundary. The prototype's deterministic API and portable brief are complete; automated lead delivery is deliberately outside this assessment implementation.

## Delivery

Setup, API example, verification commands, and GitHub publication steps are in [README](../README.md). The source archive contains the project and evidence; the companion Git bundle preserves incremental commits. GitHub publication and assessment submission have not been performed.

Deployment verification is being finalized; the verified URL and audience will be recorded here before handoff.
