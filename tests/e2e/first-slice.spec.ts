import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import path from "node:path";

const fixture = readFileSync(
  path.join(
    process.cwd(),
    "docs/product/fixtures/french-reader-acceptance.txt",
  ),
  "utf8",
);

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("E-posta").fill(email);
  await page.getByRole("button", { name: "Giriş bağlantısı gönder" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("link", { name: "Yerel giriş bağlantısını aç" }).focus();
  await page.keyboard.press("Enter");
}

test("pasted text → Reader → Vocabulary → resume → Progress", async ({
  page,
}) => {
  const email = `learner-${test.info().project.name}@example.test`;
  await signIn(page, email);
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Yaklaşık seviyen").selectOption("B1");
  await page.getByRole("button", { name: "Devam et" }).click();
  await expect(page).toHaveURL(/\/library$/);

  await page.getByLabel("Fransızca metin").fill(fixture);
  await page.getByRole("button", { name: "Kütüphaneye ekle" }).click();
  await expect(
    page.getByText("Metin eklendi; arka planda hazırlanıyor."),
  ).toBeVisible();
  const read = page.getByRole("link", { name: "Oku" }).first();
  await expect(read).toBeVisible();
  await expect(page.locator(".item-card .status").first()).not.toContainText(
    "%",
  );
  await read.click();

  await expect(page.getByText("<bonjour>", { exact: false })).toBeVisible();
  await expect(page.locator("bonjour")).toHaveCount(0);
  await expect(page.locator('.reader-token[tabindex="0"]')).toHaveCount(1);
  const mange = page
    .getByRole("button", { name: "mange", exact: true })
    .first();
  await mange.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".reader-token:focus")).toHaveCount(1);
  await mange.click();
  await expect(
    page.getByRole("heading", { name: "mange", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("Türkçe:")).toBeVisible();
  await expect(page.getByText(/Kaynak: readify_cc0_fixture/u)).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    ),
  ).toEqual([]);
  const learning = page.getByRole("button", { name: "Öğreniyorum" });
  await page.route("**/api/v1/vocabulary-state-changes", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/problem+json",
      body: JSON.stringify({
        type: "urn:readify:problem:temporary_failure",
        title: "temporary_failure",
        status: 503,
        code: "temporary_failure",
        referenceId: "ref_browser_test",
      }),
    });
  });
  await learning.click();
  await expect(learning).toHaveAttribute("aria-pressed", "false");
  await page.unroute("**/api/v1/vocabulary-state-changes");
  await learning.click();
  await expect(page.getByText("Öğreniyorum olarak kaydedildi.")).toBeAttached();
  await page.getByRole("button", { name: "Son değişikliği geri al" }).click();
  await expect(
    page.getByText("Son kelime değişikliği geri alındı."),
  ).toBeAttached();
  await learning.click();

  await page.getByRole("link", { name: "Kelimeler" }).click();
  await expect(page.getByText("manger", { exact: true })).toBeVisible();
  await expect(page.getByText(/kullanım/u).first()).toBeVisible();
  await page.getByRole("link", { name: "Metinde aç" }).click();
  await expect(page.locator(".reader-token:focus")).toHaveCount(1);
  await page.getByRole("link", { name: "Kütüphane" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "Devam et" }).first().click();
  await expect(
    page.getByRole("button", { name: "mange", exact: true }).first(),
  ).toHaveClass(/token-learning/u);
  await page.getByRole("button", { name: "Nora", exact: true }).first().click();
  await expect(
    page.getByRole("button", { name: "Anlamı yeniden dene" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Anlamı yeniden dene" }).click();
  await expect(page.getByText(/doğrulanmış anlam/iu)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Bölümü tamamla" }).click();
  await page.getByRole("link", { name: "İlerleme" }).click();
  await expect(page.locator(".metrics article").first()).toContainText("1");

  await page.getByRole("button", { name: "Çıkış" }).click();
  await signIn(page, email);
  await expect(page).toHaveURL(/\/library$/);
  await page.getByRole("link", { name: "Kelimeler" }).click();
  await expect(page.getByText("manger", { exact: true })).toBeVisible();
});

test("HTTP boundary rejects malformed, oversized, replay-conflicting and cross-origin commands", async ({
  page,
}) => {
  const unauthorized = await page.request.get("/api/v1/library-items");
  expect(unauthorized.status()).toBe(401);
  await signIn(page, `boundary-${test.info().project.name}@example.test`);
  await page.getByRole("button", { name: "Devam et" }).click();

  const malformed = await page.evaluate(async () => {
    const response = await fetch("/api/v1/imports/pasted-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "malformed",
      },
      body: "{",
    });
    return { status: response.status, body: await response.json() };
  });
  expect(malformed.status).toBe(400);
  expect(malformed.body.code).toBe("malformed_json");

  const oversized = await page.evaluate(async () => {
    const response = await fetch("/api/v1/imports/pasted-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "oversized",
      },
      body: JSON.stringify({
        text: "a".repeat(530_000),
        languageMismatchAccepted: false,
      }),
    });
    return { status: response.status, body: await response.json() };
  });
  expect(oversized.status).toBe(413);
  expect(oversized.body.code).toBe("request_body_too_large");

  const first = await page.evaluate(async () => {
    const response = await fetch("/api/v1/imports/pasted-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "same-key",
      },
      body: JSON.stringify({
        text: "Bonjour au marché avec Camille et Nora. ".repeat(4),
        languageMismatchAccepted: false,
      }),
    });
    return response.status;
  });
  expect(first).toBe(202);
  const conflicting = await page.evaluate(async () => {
    const response = await fetch("/api/v1/imports/pasted-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "same-key",
      },
      body: JSON.stringify({
        text: "Camille parle avec le vendeur au café. ".repeat(4),
        languageMismatchAccepted: false,
      }),
    });
    return { status: response.status, body: await response.json() };
  });
  expect(conflicting.status).toBe(409);
  expect(conflicting.body.code).toBe("idempotency_key_reused");

  const crossOrigin = await page.request.post("/api/v1/imports/pasted-text", {
    headers: { Origin: "https://evil.example", "Idempotency-Key": "evil" },
    data: {
      text: "Bonjour au marché. ".repeat(5),
      languageMismatchAccepted: false,
    },
  });
  expect(crossOrigin.status()).toBe(403);
});

test("mobile Reader uses a bottom context surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const email = `mobile-${test.info().project.name}@example.test`;
  await signIn(page, email);
  await page.getByRole("button", { name: "Devam et" }).click();
  await page
    .getByLabel("Fransızca metin")
    .fill(
      "Bonjour au marché. Camille mange une pomme avec Nora et parle doucement.",
    );
  await page.getByRole("button", { name: "Kütüphaneye ekle" }).click();
  await page.getByRole("link", { name: "Oku" }).click();
  await page.getByRole("button", { name: "mange", exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Kelime bağlamı" });
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS("position", "fixed");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "mange", exact: true }),
  ).toBeFocused();
});
