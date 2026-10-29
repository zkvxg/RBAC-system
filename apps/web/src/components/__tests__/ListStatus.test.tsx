import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListStatus from "../common/ListStatus";
import { renderWithProviders } from "../../test/render";

describe("<ListStatus>", () => {
  it("offers a retry when loading failed", async () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <ListStatus kind="error" entity="users" onRetry={onRetry} />,
    );
    expect(screen.getByText("Could not load users.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("distinguishes an empty list from filters with no match", () => {
    const { rerender } = renderWithProviders(
      <ListStatus kind="empty" entity="roles" />,
    );
    expect(screen.getByText("No roles yet")).toBeInTheDocument();
    rerender(<ListStatus kind="no-match" entity="roles" />);
    expect(
      screen.getByText("No roles found matching the filters"),
    ).toBeInTheDocument();
  });
});
