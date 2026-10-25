import { test, beforeEach } from "@e2e-dev/web";
import { expect, credentials } from "e2e";
import { enterEmail, loginLocators } from "./support/login.js";
import { openLoginPage } from "./support/openLogin.js";

beforeEach(async ({ app, browser }) => {
  await openLoginPage(app, browser);
});

async function reachPasswordStep(
  screen: Parameters<typeof enterEmail>[0],
  browser: Parameters<typeof enterEmail>[1],
  username: string,
) {
  const ui = loginLocators(screen);
  await enterEmail(screen, browser, username);
  await expect(ui.continueButton()).toBeEnabled({ timeout: 20_000 });
  await ui.continueButton().tap();
  await expect(browser.locator('input[type="password"]')).toBeVisible({
    timeout: 30_000,
  });
}

test(
  "successful login with NOKODR_TEST credentials",
  { tags: ["smoke", "login"] },
  async ({ agent, screen, browser }) => {
    const user = credentials.user("nokodr");
    const ui = loginLocators(screen);

    await expect(ui.emailMode()).toBeVisible();
    await expect(ui.continueButton()).toBeDisabled();

    await reachPasswordStep(screen, browser, user.username);

    // Secret fill — value never appears in model prompts
    await browser.locator('input[type="password"]').fill(user.password);

    // Prefer deterministic submit; agent as fallback if the label differs
    try {
      await ui.continueButton().tap();
    } catch {
      await agent.act("Submit the login form", { maxModelCalls: 6 });
    }

    await expect(browser).not.toHaveURL(/#\/login\/?$/, { timeout: 60_000 });
    await expect(browser).toHaveURL(/dashboard/i, { timeout: 60_000 });
    const url = await browser.url();
    expect(url).toContain("nokodr.com");
  },
);

test(
  "invalid password is rejected once",
  { tags: ["login"] },
  async ({ agent, screen, browser }) => {
    await reachPasswordStep(
      screen,
      browser,
      credentials.user("nokodr").username,
    );

    await browser
      .locator('input[type="password"]')
      .fill("DefinitelyWrongPass1!");

    try {
      await loginLocators(screen).continueButton().tap();
    } catch {
      await agent.act("Submit the login form", { maxModelCalls: 6 });
    }

    await expect(browser).toHaveURL(/login|auth/i);
    await expect(browser).not.toHaveURL(/dashboard/i);
  },
);

test(
  "Continue stays disabled when email is empty",
  { tags: ["login", "validation"] },
  async ({ screen }) => {
    const ui = loginLocators(screen);

    await expect(ui.emailMode()).toBeVisible();
    await expect(ui.continueButton()).toBeVisible();
    await expect(ui.continueButton()).toBeDisabled();
  },
);
