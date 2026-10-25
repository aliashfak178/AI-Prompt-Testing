# AI Prompt Testing — noKodr Login (tester-army/e2e)

AI-assisted end-to-end tests for the **noKodr QA login** page using the open-source [tester-army/e2e](https://github.com/tester-army/e2e) framework and your **OpenAI API** credits.

This repository is a **standalone test project**. It does not contain the Angular noKodr application. Tests hit the remote QA URL.

## Prerequisites

- Node.js **24.8+** (or **22.22.3+** on Node 22)
- npm
- Chromium for the web engine (installed via `@e2e-dev/web`)
- An OpenAI API key with available credits

Official docs note that on Windows you may need **WSL**. Native Windows is attempted first in this project.

## Setup

```bash
npm install
npx e2e-web install chromium
cp .env.example .env
```

Edit `.env`:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required for agent steps) |
| `OPENAI_MODEL` | Model id for `@ai-sdk/openai` (default `gpt-4o-mini`) |
| `NOKODR_TEST_URL` | QA login URL (keep quotes around `#/login`) |
| `NOKODR_TEST_USERNAME` | QA email |
| `NOKODR_TEST_PASSWORD` | QA password |

**Do not** commit `.env`. **Do not** use ChatGPT subscription login for this suite — use API credits via `OPENAI_API_KEY`.

### API cost note

Agent steps (`agent.act` / `agent.assert`) call the model and **consume OpenAI credits**. Deterministic `screen` / `expect` steps do not. After a verified `agent.act` + later assertion, e2e may **replay from cache** (no model call) until the UI changes — that reduces but does **not** eliminate all charges. Use `npm run test:e2e:no-cache` only when you intentionally want live model calls.

## Run tests

```bash
npm test                 # all e2e tests
npm run test:e2e:login   # login file only
npm run test:e2e:headed  # watch the browser
npm run test:e2e:no-cache
npm run test:e2e:last-failed
```

## Layout

```text
e2e.config.ts          # Chromium target, OpenAI agent, credentials
tests/login.e2e.ts     # success / invalid / empty-field cases
tests/support/login.ts # shared locators
.env.example
```

## Reports and debugging

After a run, check the e2e output under `.e2e/` / `results/` (see the run summary). Failures retain screenshots/video when configured (`video: retain-on-failure`). Reports redact credential secrets that were filled as Secret handles.

## Login flow under test

1. Open document URL, then set `#/login` (e2e forbids `#` in `app.url`).
2. Enter email (key events / native input dispatch — Angular ignores a plain `fill`).
3. Continue → password → submit.
4. Success = URL reaches a `dashboard` route (not `#/login`).

## Hybrid AI usage

| Step | Approach |
|------|----------|
| Email entry / Continue enable | Deterministic locators + input workaround |
| Password fill | Deterministic `input[type=password]` + Secret handle |
| Submit label fallback | Optional short `agent.act` if Continue tap fails |
| Empty-field check | Deterministic `toBeDisabled` only (no model) |

Agent steps use OpenAI (`OPENAI_MODEL`, default `gpt-4o-mini`) and incur API charges when not cache-replayed.
