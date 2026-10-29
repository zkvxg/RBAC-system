import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyableText from "../common/CopyableText";
import { renderWithProviders } from "../../test/render";

describe("<CopyableText>", () => {
  it("copies its value and confirms it", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    renderWithProviders(<CopyableText value="admin@test.com" />);

    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Copy admin@test.com" }),
    );

    expect(writeText).toHaveBeenCalledWith("admin@test.com");
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });
});
