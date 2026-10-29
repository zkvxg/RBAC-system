import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserForm from "../users/UserForm";
import { renderWithProviders } from "../../test/render";

vi.mock("../../hooks/queries", () => ({
  useRoles: () => ({
    data: [
      { id: 1, name: "Admin" },
      { id: 3, name: "Employee" },
    ],
  }),
  useDepartments: () => ({
    data: [
      { id: "1", name: "IT", status: "Active" },
      { id: "2", name: "Legacy", status: "Inactive" },
    ],
  }),
}));

const renderForm = (props: Partial<Parameters<typeof UserForm>[0]> = {}) => {
  const onSubmit = vi.fn();
  renderWithProviders(
    <UserForm onSubmit={onSubmit} onCancel={vi.fn()} {...props} />,
  );
  document.querySelector("form")!.noValidate = true;
  return { onSubmit };
};

describe("<UserForm>", () => {
  it("shows validation messages and does not submit an empty form", async () => {
    const { onSubmit } = renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Create User" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Location is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits normalised values", async () => {
    const { onSubmit } = renderForm();
    await userEvent.type(screen.getByLabelText(/Full Name/), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/^Email/), "ada@example.com");
    await userEvent.selectOptions(screen.getByLabelText(/Department/), "IT");
    await userEvent.type(screen.getByLabelText(/Phone Number/), "12a3-456 789");
    await userEvent.type(screen.getByLabelText(/Location/), "London");
    await userEvent.click(screen.getByRole("button", { name: "Create User" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: "Admin",
      department: "IT",
      phone: "123456789",
      password: "",
    });
  });

  it("only offers active departments", () => {
    renderForm();
    expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Legacy" }),
    ).not.toBeInTheDocument();
  });

  it("hides the password field when editing", () => {
    renderForm({ user: { name: "Ada", email: "ada@example.com" } });
    expect(screen.queryByLabelText(/Initial Password/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update User" }),
    ).toBeInTheDocument();
  });
});
