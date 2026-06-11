import { render, screen } from "@testing-library/react";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the shipped CanvasPage entrypoint", async () => {
    render(<HomePage />);

    expect(
      await screen.findByRole("heading", { name: "项目画布" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "核心闭环验证" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "运行工作流" })).toBeInTheDocument();
  });
});
