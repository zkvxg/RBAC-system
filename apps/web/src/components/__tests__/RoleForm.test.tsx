import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoleForm from "../roles/RoleForm";
import { renderWithProviders } from "../../test/render";

const renderForm = (role?: Parameters<typeof RoleForm>[0]["role"]) => {
  const onSubmit = vi.fn();
  renderWithProviders(
    <RoleForm role={role} onSubmit={onSubmit} onCancel={vi.fn()} />,
  );
  document.querySelector("form")!.noValidate = true;
  return { onSubmit };
};

describe("<RoleForm>", () => {
  it("requires a name and description", async () => {
    const { onSubmit } = renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Create Role" }));
    expect(
      await screen.findByText("Role name is required"),
    ).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps the existing permissions when editing details", async () => {
    const { onSubmit } = renderForm({
      name: "Auditor",
      description: "Reads reports",
      permissions: ["reports.view"],
    });
    const description = screen.getByLabelText(/Description/);
    await userEvent.clear(description);
    await userEvent.type(description, "Reads and exports reports");
    await userEvent.click(screen.getByRole("button", { name: "Update Role" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]![0]).toEqual({
      name: "Auditor",
      description: "Reads and exports reports",
      permissions: ["reports.view"],
      status: "Active",
    });
  });
});
