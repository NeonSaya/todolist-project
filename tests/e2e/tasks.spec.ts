import { type Page, expect, test } from "@playwright/test";

const SUNDAY = new Date("2026-11-22T14:00:00+08:00");

async function addTask(page: Page, title: string) {
  await page.getByRole("textbox", { name: "新任务标题" }).fill(title);
  await page.getByRole("button", { name: "添加", exact: true }).click();
}

const taskButton = (page: Page, title: string) =>
  page.getByRole("button", { name: title, exact: true });

test("新建、编辑日期和备注、完成、撤销、重载、删除", async ({ page }) => {
  await page.clock.setFixedTime(SUNDAY);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "今天", exact: true }),
  ).toBeVisible();
  await addTask(page, "整理测试文件");
  await taskButton(page, "整理测试文件").click();
  const edit = page.getByRole("dialog", { name: "编辑任务" });
  await edit.getByLabel("标题", { exact: true }).fill("提交周报");
  await edit.getByLabel(/^备注/).fill("附上会议纪要");
  await edit.getByTestId("tasks.edit.date.open_modal_button").click();
  await page.getByTestId("tasks.edit.date.input").fill("2026-11-23");
  await page.getByRole("button", { name: "应用日期" }).click();
  await edit.getByRole("button", { name: "保存", exact: true }).click();
  await expect(edit).toBeHidden();
  await expect(taskButton(page, "提交周报")).toHaveCount(0);

  await page.getByTestId("nav.view.upcoming.link").click();
  await expect(taskButton(page, "提交周报")).toBeVisible();
  await expect(page.getByText("附上会议纪要", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "标记为完成：提交周报" }).click();
  await expect(taskButton(page, "提交周报")).toHaveCount(0);
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await expect(taskButton(page, "提交周报")).toBeVisible();
  await page.getByRole("button", { name: "标记为完成：提交周报" }).click();
  await page.getByTestId("nav.view.completed.link").click();
  await expect(taskButton(page, "提交周报")).toBeVisible();
  await page.reload();
  await expect(taskButton(page, "提交周报")).toBeVisible();

  await taskButton(page, "提交周报").hover();
  await page.getByRole("button", { name: "删除：提交周报" }).click();
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await expect(taskButton(page, "提交周报")).toBeVisible();
  await taskButton(page, "提交周报").hover();
  await page.getByRole("button", { name: "删除：提交周报" }).click();
  await page.getByRole("button", { name: "确认删除" }).click();
  await page.getByTestId("nav.view.all.link").click();
  await expect(taskButton(page, "提交周报")).toHaveCount(0);
});

test("标记完成后立即切换视图，仍然保存完成状态", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?view=upcoming");
  await addTask(page, "寄出快递");
  await expect(taskButton(page, "寄出快递")).toBeVisible();
  await page.evaluate(() => {
    document
      .querySelector<HTMLButtonElement>(
        'button[aria-label="标记为完成：寄出快递"]',
      )
      ?.click();
    document
      .querySelector<HTMLAnchorElement>('[data-ocid="nav.view.completed.link"]')
      ?.click();
  });
  await expect(taskButton(page, "寄出快递")).toBeVisible();
});

test("程序跨过本地午夜后刷新今天与逾期视图", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-22T23:59:30+08:00") });
  await page.goto("/");
  await addTask(page, "月底对账");
  await expect(taskButton(page, "月底对账")).toBeVisible();
  await page.clock.fastForward(31_000);
  await expect(page.getByText("11月23日 周一", { exact: true })).toBeVisible();
  await expect(taskButton(page, "月底对账")).toHaveCount(0);
  await page.getByTestId("nav.view.overdue.link").click();
  await expect(taskButton(page, "月底对账")).toBeVisible();
});

test("两个窗口离线同时添加任务，重新打开都在", async ({ context, page }) => {
  await page.goto("/?view=all");
  const other = await context.newPage();
  await other.goto("/?view=all");
  await expect(
    other.getByRole("heading", { name: "全部", exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await Promise.all([
    addTask(page, "报销交通费"),
    addTask(other, "准备明日便当"),
  ]);
  await expect(taskButton(page, "报销交通费")).toBeVisible();
  await expect(taskButton(other, "准备明日便当")).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(taskButton(page, "报销交通费")).toBeVisible();
  await expect(taskButton(page, "准备明日便当")).toBeVisible();
});

test("本地写入失败后保留表单，重试只创建一次", async ({ page }) => {
  await page.goto("/?view=upcoming");
  const title = page.getByRole("textbox", { name: "新任务标题" });
  await title.fill("续借图书");
  await page.getByRole("button", { name: "高优先级" }).click();
  const date = page.getByTestId("tasks.add.date.open_modal_button");
  await date.click();
  await page.getByRole("button", { name: /^一周后/ }).click();
  const selectedDate = await date.getAttribute("aria-label");
  await page.getByRole("button", { name: "备注", exact: true }).click();
  await page
    .getByRole("textbox", { name: "备注", exact: true })
    .fill("带借书证");
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      if (this.name !== "lists") return put.apply(this, args);
      IDBObjectStore.prototype.put = put;
      throw new DOMException("测试本地存储写入失败", "QuotaExceededError");
    };
  });

  const submit = page.getByRole("button", { name: "添加", exact: true });
  await submit.click();
  await expect(page.getByTestId("tasks.add.field_error")).toBeVisible();
  await expect(title).toHaveValue("续借图书");
  await expect(
    page.getByRole("textbox", { name: "备注", exact: true }),
  ).toHaveValue("带借书证");
  await expect(date).toHaveAttribute("aria-label", selectedDate ?? "");
  await expect(page.getByRole("button", { name: "高优先级" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(taskButton(page, "续借图书")).toHaveCount(0);
  await submit.click();
  await expect(taskButton(page, "续借图书")).toHaveCount(1);
});
