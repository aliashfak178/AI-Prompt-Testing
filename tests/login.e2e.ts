import { test, beforeEach } from "@e2e-dev/web";
import { expect, credentials } from "e2e";
import { openLoginPage } from "./support/openLogin.js";
import { typeEmailNative } from "./support/typeEmailNative.js";

/**
 * Prompt-based login suite (agent.act / agent.assert / agent.waitFor).
 * No getByRole / XPath in the scenarios.
 *
 * Note: this Angular login ignores many agent fills on the email field.
 * typeEmailNative() only bridges that app quirk so Continue can enable;
 * everything after that is natural-language agent steps.
 */

beforeEach(async ({ app, browser }) => {
  await openLoginPage(app, browser);
});

test(
  "successful login with NOKODR_TEST credentials",
  { tags: ["smoke", "login", "ai"] },
  async ({ agent, browser }) => {
    const user = credentials.user("nokodr");

    await typeEmailNative(browser, user.username);

    await agent.act(
      "The email is already filled. Click Continue. When the password field appears, type the password and submit the login form (Continue or Log in).",
      {
        params: { password: user.password },
        maxModelCalls: 20,
        maxSteps: 25,
      },
    );

    // Dashboard may stay on "Loading" — URL change is the reliable auth signal
    await expect(browser).not.toHaveURL(/#\/login\/?$/, { timeout: 60_000 });
    await expect(browser).toHaveURL(/dashboard/i, { timeout: 60_000 });
  },
);

test(
  "invalid password is rejected once",
  { tags: ["login", "ai"] },
  async ({ agent, browser }) => {
    const user = credentials.user("nokodr");

    await typeEmailNative(browser, user.username);

    await agent.act(
      "The email is already filled. Click Continue. When the password field appears, type the password and submit the login form.",
      {
        params: { password: "DefinitelyWrongPass1!" },
        maxModelCalls: 18,
        maxSteps: 22,
      },
    );

    await agent.assert(
      "login failed: an error or validation message is shown, and the user is still on the auth or login flow (not a dashboard)",
    );

    await expect(browser).toHaveURL(/login|auth/i);
    await expect(browser).not.toHaveURL(/dashboard/i);
  },
);

test(
  "empty email keeps Continue disabled",
  { tags: ["login", "validation", "ai"] },
  async ({ agent }) => {
    await agent.assert(
      "On the login page, Continue is disabled (or not usable) while no real email has been entered. Placeholder text like example@gmail.com does not count as a filled email.",
    );

    await agent.act(
      "Do not type any email or password. Do not force Continue. Leave the form as-is.",
      { maxModelCalls: 6, maxSteps: 8 },
    );

    await agent.assert(
      "Continue is still disabled and the password step has not appeared",
    );
  },
);
