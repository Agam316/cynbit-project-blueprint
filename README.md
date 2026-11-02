# Cynbit Project Blueprint

A focused improvement to Cynbit's discovery journey: turn a business goal into an explainable service recommendation and a useful project brief before asking for personal information.

**Demo:** deployment URL will be recorded after verification.  
**Technical report:** [docs/TECHNICAL_REPORT.md](docs/TECHNICAL_REPORT.md)

## Run locally

Use Node.js **22.13+** (tested with 22.23.1), npm, and Git. No API keys, account, database, or environment file is required.

```sh
npm ci
npm run dev -- --port 4173
```

Open the local URL printed by the server (normally `http://127.0.0.1:4173`). Port 4173 avoids a reserved port range on the assessment Windows machine. The first development request compiles the application.

For a production build and local Worker preview:

```sh
npm run build
npm start -- --port 4173
```

Stop the development server before starting the production preview on the same port.

## Verify

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

The browser suite starts a preview automatically. With an existing server, it reuses port 4173. Set `TEST_BASE_URL` to test a different running origin. To use an already installed Chrome on Windows, set `$env:PLAYWRIGHT_CHANNEL='chrome'` before the browser command. CI installs Chromium and tests the production build.

`npm run format` formats authored application files. Test output is written to ignored `test-results/`. Tests cover all service paths, validation boundaries, API errors, draft recovery, keyboard controls, failure/retry, downloaded content, XSS escaping, responsive overflow, and automated accessibility checks.

## Try the improvement

1. Choose **Automate my operations**.
2. Select **An existing product or process**, **Lead follow-up**, and **Connect existing tools**.
3. Keep an open budget and flexible timing. Create the blueprint.
4. Review the recommendation and discovery questions; download, copy, or print the brief.
5. Edit the answers, try a broad scope with a one-month deadline, and observe the phased-scope guidance.

The email link opens a draft in the visitor's own mail app. It does not send email, book a call, create a CRM lead, or claim that Cynbit received an inquiry. Use Copy or Download if a mail app is unavailable.

## Architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| Presentation | `app/page.tsx`, `app/globals.css`, `components/` | Responsive, accessible discovery and result views |
| Interaction state | `hooks/use-discovery.ts` | Step transitions, focus, request lifecycle, download and print |
| Draft persistence | `lib/draft.ts` | Versioned, validated, expiring browser draft |
| Domain contract | `lib/blueprint.ts` | Service catalog, input/output schemas, explainable rules, text serializer |
| HTTP boundary | `app/api/blueprint/route.ts` | Same-origin checks, bounded streaming body, server validation, no-store response |
| Hosting adapter | `worker/`, `scripts/vite/`, `.openai/hosting.json` | Maintained Sites/Vinext Worker integration |

React 19 + TypeScript use Next.js App Router conventions through Vinext/Vite for the supplied Cloudflare Workers hosting environment. The UI uses native controls and authored CSS, without a component-library dependency. The domain functions are framework-independent. No database or LLM service is needed for this deterministic workflow.

### API

`POST /api/blueprint` with `Content-Type: application/json`:

```json
{
  "goal": "automate",
  "stage": "existing",
  "features": ["leads", "integration"],
  "context": "Route qualified leads into our CRM.",
  "budget": "discuss",
  "timing": "flexible"
}
```

Returns `{ "blueprint": { ... } }`. See the exported Zod schemas for the complete contract. Errors: `400` malformed/missing JSON; `403` mismatched browser origin; `413` body above 8 KiB; `415` unsupported content type; `422` invalid fields. Requests are never written to a database or logged by application code. The origin check is a browser boundary, not authentication or bot protection.

## GitHub handoff and deployment

The source repository has incremental commits. The accompanying `.bundle` preserves full Git history; `git clone cynbit-blueprint.bundle cynbit-blueprint` restores it. The ZIP contains source without dependencies or local runtime state.

Create an empty GitHub repository, then run from this repository:

```sh
git remote add origin https://github.com/YOUR_ACCOUNT/cynbit-project-blueprint.git
git push -u origin main
```

No GitHub credentials are included. GitHub Actions verifies changes but never publishes automatically. The live assessment demo is hosted through Sites. Its exact identity is tracked in `.openai/hosting.json`; preserve it when updating this demo. For a separate deployment, register a new Site and use its returned identity rather than copying this one. Build output lives in ignored `dist/`.

## Scope and production integration

This is an independent assessment prototype, not Cynbit's production website. Replace or supplement the current contact-page form with this journey; preserve a direct-contact option. Have Cynbit approve service rules and copy, then connect an authenticated inquiry endpoint/CRM only after consent, spam controls, retention rules, and operational ownership are defined. A/B testing is needed before claiming conversion uplift.

Drafts are local to one browser and expire after seven days of inactivity when reopened; Clear draft removes them immediately. Avoid confidential information on shared devices. No cookies or analytics SDK are added. See [asset provenance](docs/ASSETS.md), [audit evidence](docs/AUDIT.md), and [technical report](docs/TECHNICAL_REPORT.md).
