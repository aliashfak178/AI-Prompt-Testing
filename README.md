# AI Prompt Testing — noKodr Login (tester-army/e2e)

Prompt-based AI E2E tests for the **noKodr QA login** page using [tester-army/e2e](https://github.com/tester-army/e2e) and your **OpenAI API** credits.

Scenarios use natural-language `agent.act` / `agent.assert` — **no XPath or UI locators** in the test steps. This repository is a standalone test project against remote QA (not the Angular app source).

## Prerequisites

- Node.js **24.8+** (or **22.22.3+** on Node 22)
- npm
- Chromium (`npx e2e-web install chromium`)
- OpenAI API key with available credits

## Setup

```bash
npm install
npx e2e-web install chromium
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required for every agent step) |
| `OPENAI_MODEL` | Model id (default `gpt-4o-mini`) |
| `NOKODR_TEST_URL` | Document URL without `#` (e2e rejects fragments in `app.url`) |
| `NOKODR_TEST_USERNAME` | QA email |
| `NOKODR_TEST_PASSWORD` | QA password |

## Run

```bash
npm run test:e2e:headed   # watch the browser
npm run test:e2e:login
npm test
npm run test:e2e:no-cache # force live model (more API cost)
```

## How AI is used

| Test | Flow |
|------|------|
| Successful login | Native email bridge → `agent.act` Continue + password + submit → URL assert |
| Invalid password | Same with wrong password → `agent.assert` still on auth |
| Empty email | `agent.assert` / `agent.act` only (no typing) |

Scenarios are written as **natural-language prompts** (`agent.act` / `agent.assert`) — no `getByRole` / XPath in the test file.

**App quirk:** this Angular email field ignores many agent fills, so `typeEmailNative()` sets the email with DOM input events first. Password + submit stay prompt-driven. Passwords use Secret `params` (redacted from the model). Success is confirmed by **URL** (dashboard may keep showing “Loading”).

`openLoginPage` only sets `#/login` (e2e forbids `#` in `app.url`).

### Cost

Agent steps call OpenAI when not cache-replayed. Use `npm run test:e2e:no-cache` only when you want live model calls.

## Layout

```text
e2e.config.ts                    # Chromium + OpenAI agent + credentials
tests/login.e2e.ts               # prompt-based scenarios
tests/support/openLogin.ts       # hash-route bootstrap
tests/support/typeEmailNative.ts # Angular email bridge only
```
