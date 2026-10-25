import type { Screen } from "e2e";
import type { Browser } from "@e2e-dev/web";

/** Shared locators for the noKodr login SPA (from the live QA page). */
export function loginLocators(screen: Screen) {
  return {
    emailMode: () => screen.getByRole("radio", "Email"),
    mobileMode: () => screen.getByRole("radio", "Mobile"),
    emailField: () => screen.getByRole("textbox", "example@gmail.com"),
    continueButton: () => screen.getByRole("button", "Continue"),
    signUp: () => screen.getByText("Sign up"),
  };
}

/**
 * Salesforce/Angular-style inputs often ignore a single fill().
 * Prefer key events, then a native value + input/change dispatch.
 */
export async function enterEmail(
  screen: Screen,
  browser: Browser,
  email: string,
): Promise<void> {
  const field = loginLocators(screen).emailField();
  await expectVisible(field);
  await field.tap();
  await field.clear();
  try {
    await field.pressSequentially(email);
  } catch {
    // fall through to native setter
  }

  if (await loginLocators(screen).continueButton().isDisabled()) {
    await browser.evaluate((value: string) => {
      const input =
        document.querySelector<HTMLInputElement>(
          'input[placeholder="example@gmail.com"]',
        ) ?? document.querySelector<HTMLInputElement>('input[type="email"]') ??
        document.querySelector<HTMLInputElement>('input[type="text"]');
      if (!input) throw new Error("email input not found");
      const proto = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      );
      proto?.set?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    }, email);
  }
}

async function expectVisible(
  field: ReturnType<ReturnType<typeof loginLocators>["emailField"]>,
): Promise<void> {
  if (await field.isHidden()) {
    throw new Error("email field is not visible");
  }
}
