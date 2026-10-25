import type { App } from "e2e";
import type { Browser } from "@e2e-dev/web";

/** e2e forbids # in app.url — open the document, then set the hash route. */
export async function openLoginPage(app: App, browser: Browser): Promise<void> {
  await app.open();
  await browser.evaluate(() => {
    window.location.hash = "/login";
  });
  // SPA router settle
  await browser.waitForURL(/#\/login/, { timeout: 30_000 });
}
