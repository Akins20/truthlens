import { test, expect } from "@playwright/test";

const MOCK_ANALYSIS = {
  verdict: "False",
  credibilityScore: 8,
  biasRating: "Unknown",
  summary:
    "This claim is false. No scientific evidence supports this assertion and it contradicts established consensus.",
  keyClaims: [
    {
      claim: "Vaccines cause autism",
      verdict: "False",
      explanation: "Debunked by hundreds of large-scale studies.",
    },
  ],
  redFlags: ["No credible source cited", "Contradicts scientific consensus"],
  whatIsAccurate: ["Vaccines do exist"],
  recommendation: "Consult WHO and CDC for accurate vaccine information.",
};

const MOCK_RESPONSE = {
  analysis: MOCK_ANALYSIS,
  sources: [
    { title: "who.int", url: "https://www.who.int" },
    { title: "cdc.gov", url: "https://www.cdc.gov" },
  ],
};

test.describe("TruthLens", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the analyze API so tests don't consume quota
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RESPONSE),
      });
    });
  });

  test("homepage loads with correct heading and tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Is it true?" })).toBeVisible();
    await expect(page.locator("span.font-semibold", { hasText: "TruthLens" })).toBeVisible();
    await expect(page.getByText(/cross-references/i).first()).toBeVisible();
  });

  test("all three input mode tabs are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /text/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /url/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /image/i })).toBeVisible();
  });

  test("switching to URL mode shows URL input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /url/i }).click();
    await expect(page.getByPlaceholder(/https:\/\/example/i)).toBeVisible();
  });

  test("switching to Image mode shows drop zone", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /image/i }).click();
    await expect(page.getByText(/drop a screenshot/i)).toBeVisible();
  });

  test("analyze button is disabled when input is empty", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("button", { name: /analyze/i }).last();
    await expect(btn).toBeDisabled();
  });

  test("example claims are clickable and populate the input", async ({ page }) => {
    await page.goto("/");
    const firstExample = page.getByText(/apple cider vinegar/i);
    await expect(firstExample).toBeVisible();
    await firstExample.click();
    const textarea = page.locator("textarea");
    await expect(textarea).toHaveValue(/apple cider vinegar/i);
  });

  test("analyze button enables when text is entered", async ({ page }) => {
    await page.goto("/");
    await page.locator("textarea").fill("vaccines cause autism");
    const btn = page.getByRole("button", { name: /analyze/i }).last();
    await expect(btn).toBeEnabled();
  });

  test("submits analysis and shows verdict", async ({ page }) => {
    await page.goto("/");
    await page.locator("textarea").fill("vaccines cause autism");
    await page.getByRole("button", { name: /analyze/i }).last().click();
    await expect(page.getByRole("heading", { name: "False" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Verdict", { exact: true })).toBeVisible();
  });

  test("results show credibility score", async ({ page }) => {
    await page.goto("/");
    await page.locator("textarea").fill("vaccines cause autism");
    await page.getByRole("button", { name: /analyze/i }).last().click();
    await expect(page.getByText(/credibility/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("8/100")).toBeVisible();
  });

  test("results show key claims section", async ({ page }) => {
    await page.goto("/");
    await page.locator("textarea").fill("vaccines cause autism");
    await page.getByRole("button", { name: /analyze/i }).last().click();
    await expect(page.getByText(/claims examined/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Vaccines cause autism")).toBeVisible();
  });

  test("results show sources", async ({ page }) => {
    await page.goto("/");
    await page.locator("textarea").fill("vaccines cause autism");
    await page.getByRole("button", { name: /analyze/i }).last().click();
    await expect(page.getByText(/sources searched/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("who.int")).toBeVisible();
  });

  test("share button copies link to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.locator("textarea").fill("vaccines cause autism");
    await page.getByRole("button", { name: /analyze/i }).last().click();
    await expect(page.getByRole("button", { name: /share/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /share/i }).click();
    await expect(page.getByText(/copied/i)).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain("/share?d=");
  });

  test("analyze another button resets to input", async ({ page }) => {
    await page.goto("/");
    await page.locator("textarea").fill("vaccines cause autism");
    await page.getByRole("button", { name: /analyze/i }).last().click();
    await expect(page.getByRole("heading", { name: "False" })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /analyze another/i }).click();
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("shows error message when API fails", async ({ page }) => {
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Rate limited — please wait." }),
      });
    });
    await page.goto("/");
    await page.locator("textarea").fill("test claim here");
    await page.getByRole("button", { name: /analyze/i }).last().click();
    await expect(page.getByText(/analysis failed/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/rate limited/i)).toBeVisible();
  });

  test("share page decodes and displays shared result", async ({ page }) => {
    const encoded = btoa(JSON.stringify(MOCK_RESPONSE));
    await page.goto(`/share?d=${encoded}`);
    await expect(page.getByRole("heading", { name: "False" })).toBeVisible();
    await expect(page.getByText(/shared analysis/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /fact-check something/i })).toBeVisible();
  });

  test("share page shows error for invalid link", async ({ page }) => {
    await page.goto("/share?d=notvalidbase64!!!");
    await expect(page.getByText(/invalid share link/i)).toBeVisible();
  });
});
