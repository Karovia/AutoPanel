import { expect, test } from "./playwright.setup";

test("user can search brand context and generate an image through ComfyUI", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /文本输入/ }).click();
  await page.getByLabel("文本输入").fill("暖调极简客厅");
  await page.getByRole("button", { exact: true, name: "品牌检索" }).click();
  await page.getByRole("button", { name: "运行工作流" }).click();

  await expect(page.getByText("生成完成")).toBeVisible();
  await expect(page.getByText("使用暖石色中性色调")).toBeVisible();
  await expect(page.getByText(/提示 ID：prompt_1/)).toBeVisible();
  await expect(page.getByText(/输出文件名：living-room\.png/)).toBeVisible();
  await expect(page.getByRole("img", { name: "工作流输出" })).toBeVisible();
});
