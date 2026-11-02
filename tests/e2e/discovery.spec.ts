import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("degraded browser storage does not block the workflow", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await complete(page);
  await expect(page.getByText("Browser storage is unavailable.")).toBeVisible();
});
test("malformed successful responses are recoverable errors", async ({
  page,
}) => {
  await priorities(page);
  await page.route("**/api/blueprint", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        blueprint: { version: "1.0", service: "Incomplete" },
      }),
    }),
  );
  await page
    .getByRole("button", { name: "Create my blueprint", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("could not be read");
  await expect(
    page.getByRole("heading", { name: "Here’s your starting point." }),
  ).toHaveCount(0);
});
test("print view includes scope, constraints, and unsent status", async ({
  page,
}) => {
  await complete(page);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".print-summary")).toContainText(
    "Connect existing tools",
  );
  await expect(page.locator(".print-summary")).toContainText(
    "Help me define a budget",
  );
  await expect(page.locator(".print-summary")).toContainText("not been sent");
  await expect(page.locator(".site-header")).not.toBeVisible();
});

async function scope(page: Page) {
  await page.goto("/");
  await page.getByRole("radio", { name: /Automate my operations/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("radio", { name: "An existing product or process" })
    .check();
  await page.getByRole("checkbox", { name: "Lead follow-up" }).check();
  await page.getByRole("checkbox", { name: "Connect existing tools" }).check();
}
async function priorities(page: Page) {
  await scope(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
async function complete(page: Page) {
  await priorities(page);
  await page
    .getByRole("button", { name: "Create my blueprint", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Here’s your starting point." }),
  ).toBeVisible();
}
test("guards progression, retains selections, and moves keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Choose a goal, or select")).toBeVisible();
  await page.getByRole("radio", { name: /Build a digital product/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What does your project need?" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText("Choose your starting point.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Choose at least one focus area.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: /Build a digital product/ }),
  ).toBeChecked();
});
test("recovers a draft after refresh and clears stale features after changing goal", async ({
  page,
}) => {
  await scope(page);
  await page.getByLabel("Anything else").fill("A useful lead workflow.");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("cynbit-blueprint-draft-v1")),
    )
    .toContain("A useful lead workflow.");
  await page.reload();
  await expect(page.getByText("Welcome back.")).toBeVisible();
  await page.getByRole("radio", { name: /Build a digital product/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("input[type=checkbox]:checked")).toHaveCount(0);
  await expect(page.getByLabel("Anything else")).toHaveValue(
    "A useful lead workflow.",
  );
});
test("generates a real response and a complete downloadable brief", async ({
  page,
}) => {
  await complete(page);
  await expect(
    page.getByRole("heading", { name: "AI & workflow automation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Here’s your starting point." }),
  ).toBeFocused();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download brief", exact: true })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("cynbit-project-blueprint.txt");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  expect(text).toContain("Connect existing tools");
  expect(text).toContain("not been sent to Cynbit");
  const email = await page
    .getByRole("link", { name: /Open email draft/ })
    .getAttribute("href");
  expect(email).toContain("mailto:opportunities@cynbit.in?");
  expect(decodeURIComponent(email!)).toContain("AI & workflow automation");
});
test("server failure keeps input and supports successful retry", async ({
  page,
}) => {
  await priorities(page);
  await page.route("**/api/blueprint", (r) =>
    r.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Temporarily unavailable. Please retry." }),
    }),
  );
  await page
    .getByRole("button", { name: "Create my blueprint", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Temporarily unavailable",
  );
  await expect(
    page.getByRole("button", { name: "Create my blueprint", exact: true }),
  ).toBeEnabled();
  await page.unroute("**/api/blueprint");
  await page
    .getByRole("button", { name: "Create my blueprint", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "AI & workflow automation" }),
  ).toBeVisible();
});
test("clear draft requires confirmation and removes local data", async ({
  page,
}) => {
  await scope(page);
  await page.getByRole("button", { name: "Clear draft", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Lead follow-up" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Clear draft", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Clear draft", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: /Automate my operations/ }),
  ).not.toBeChecked();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("cynbit-blueprint-draft-v1"),
    ),
  ).toBeNull();
});
test("untrusted context renders as text, never executable HTML", async ({
  page,
}) => {
  await scope(page);
  await page.getByLabel("Anything else").fill("<img src=x onerror=alert(1)>");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Create my blueprint", exact: true })
    .click();
  await expect(page.locator(".your-context")).toContainText(
    "<img src=x onerror=alert(1)>",
  );
  await expect(page.locator(".your-context img")).toHaveCount(0);
});
test("keyboard-only selection and native dialog focus work", async ({
  page,
}) => {
  await page.goto("/");
  const first = page.getByRole("radio", { name: /Automate my operations/ });
  await expect(first).toBeEnabled();
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: /Build a digital product/ }),
  ).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "What does your project need?" }),
  ).toBeFocused();
});
for (const width of [320, 390, 768, 1440])
  test(`responsive layout at ${width}px has no horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await complete(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("WCAG automated checks pass on every step and result", async ({
  page,
}) => {
  await page.goto("/");
  for (let step = 0; step < 4; step++) {
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations, JSON.stringify(audit.violations, null, 2)).toEqual(
      [],
    );
    if (step === 0) {
      await page.getByRole("radio", { name: /Automate my operations/ }).check();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
    } else if (step === 1) {
      await page
        .getByRole("radio", { name: "An existing product or process" })
        .check();
      await page.getByRole("checkbox", { name: "Lead follow-up" }).check();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
    } else if (step === 2) {
      await page
        .getByRole("button", { name: "Create my blueprint", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Here’s your starting point." }),
      ).toBeVisible();
    }
  }
});
