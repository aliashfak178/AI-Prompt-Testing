import { openai } from "@ai-sdk/openai";
import { web } from "@e2e-dev/web";
import type { E2EConfig } from "e2e";

// e2e does not auto-load .env — load before reading credentials / URL
process.loadEnvFile(".env");

/**
 * e2e rejects fragments in app.url (INVALID_APP_URL).
 * Document URL goes here; tests set #/login after open (hash SPA).
 */
const documentUrl =
  process.env.NOKODR_TEST_URL?.trim().replace(/#.*$/, "") ||
  "https://app-qa.nokodr.com/super/apps/auth/v1/index.html";

/** Prefer OPENAI_MODEL from .env; must support tool calls + images for the agent. */
const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

export default {
  tests: "tests/**/*.e2e.ts",
  targets: [
    {
      name: "chromium",
      engine: web({
        browser: "chromium",
        viewport: { width: 1280, height: 800 },
      }),
      app: { url: documentUrl },
    },
  ],
  agents: {
    default: {
      model: openai(modelId),
      maxSteps: 40,
      maxModelCalls: 40,
      context: `You are testing the noKodr QA login SPA (Angular / Salesforce-style inputs).
Prefer Email mode over Mobile.
When filling fields: click the field, clear it, then type the COMPLETE value in a single keyboard type/fill action (not one keystroke per turn — that wastes the action budget). Then press Tab to blur.
If Continue stays disabled after email, clear and re-type the full email once, Tab, then click Continue.
For password: click the field, type the full password in one action, then click Continue / Log in.
Do not invent credentials. Use only values from params.`,
    },
  },
  credentials: {
    nokodr: {
      username: process.env.NOKODR_TEST_USERNAME?.trim() || "",
      password: () => process.env.NOKODR_TEST_PASSWORD?.trim() || "",
    },
  },
  timeout: 180_000,
  workers: 1,
  retries: 0,
  video: "retain-on-failure",
  reporters: ["list"],
} satisfies E2EConfig;
