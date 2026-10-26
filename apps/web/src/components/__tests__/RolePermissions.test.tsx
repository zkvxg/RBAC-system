import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RolePermissions from "../roles/RolePermissions";
import { renderWithProviders } from "../../test/render";

const role = { id: 4, name: "Auditor", permissions: ["reports.view"] };

describe("<RolePermissions>", () => {
  it("starts from the role's current permissions", () => {
    renderWithProviders(
      <RolePermissions role={role} onSave={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByLabelText("View Reports")).toBeChecked();
    expect(screen.getByLabelText("Export Reports")).not.toBeChecked();
  });

  it("saves toggled permissions", async () => {
    const onSave = vi.fn();
    renderWithProviders(
      <RolePermissions role={role} onSave={onSave} onCancel={vi.fn()} />,
    );
    await userEvent.click(screen.getByLabelText("Export Reports"));
    await userEvent.click(screen.getByLabelText("View Reports"));
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(["reports.export"]);
  });
});
