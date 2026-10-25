import type { Browser } from "@e2e-dev/web";

/**
 * noKodr's Angular email control ignores many automation fills.
 * This sets the value with native input/change events so Continue enables.
 * Used so prompt-based agent steps can continue past email — not a test locator API.
 */
export async function typeEmailNative(
  browser: Browser,
  email: string,
): Promise<void> {
  await browser.evaluate((value: string) => {
    const input =
      document.querySelector<HTMLInputElement>(
        'input[placeholder="example@gmail.com"]',
      ) ??
      document.querySelector<HTMLInputElement>('input[type="email"]') ??
      Array.from(document.querySelectorAll("input")).find(
        (el) => el.type === "text" || el.type === "email",
      );

    if (!input) throw new Error("email input not found for native type");

    input.focus();
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(
      new KeyboardEvent("keyup", { bubbles: true, key: "Tab" }),
    );
    input.blur();
  }, email);
}
