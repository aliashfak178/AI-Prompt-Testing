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
      maxSteps: 20,
      maxModelCalls: 20,
      context:
        "You are testing the noKodr QA login SPA. Prefer Email mode. Do not invent credentials.",
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
