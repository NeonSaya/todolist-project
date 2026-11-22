import { expect, test } from "@playwright/test";

test("跟随系统配色并保留手动选择", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveClass("dark");
  await page.getByRole("button", { name: "浅色", exact: true }).click();
  await expect(html).toHaveClass("light");
  await page.reload();
  await expect(html).toHaveClass("light");
  await page.getByRole("button", { name: "跟随系统", exact: true }).click();
  await expect(html).toHaveClass("dark");
});

test("窄窗口可打开任务视图和主题菜单", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /切换主题/ }).click();
  await page.getByRole("menuitemradio", { name: "深色", exact: true }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.getByRole("textbox", { name: "新任务标题" })).toBeVisible();
  const documentOverflows = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(documentOverflows).toBe(false);
});

test("桌面窗口变矮时仍可滚动到完整的主题开关", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 440 });
  await page.goto("/");
  const systemTheme = page.getByRole("button", {
    name: "跟随系统",
    exact: true,
  });
  await systemTheme.click();
  const labelFits = await systemTheme
    .getByText("跟随系统")
    .evaluate((label) => label.scrollWidth <= label.clientWidth);
  expect(labelFits).toBe(true);
  await expect(systemTheme).toBeInViewport();
});
