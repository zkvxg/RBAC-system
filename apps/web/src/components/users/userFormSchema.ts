import { z } from "zod";
import { passwordSchema } from "@rbac/shared";

const PHONE_DIGITS = 9;

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email("Please enter a valid email address")),
  role: z.string().min(1, "Please select a role"),
  department: z.string().min(1, "Department is required"),
  phone: z
    .string()
    .refine(
      (value) =>
        value === "" || value.replace(/\D/g, "").length === PHONE_DIGITS,
      `Phone number must be exactly ${PHONE_DIGITS} digits`,
    ),
  location: z.string().trim().min(1, "Location is required"),
  status: z.enum(["Active", "Inactive"]),
  password: z.union([z.literal(""), passwordSchema]),
});

export type UserFormValues = z.output<typeof userFormSchema>;

export const toPhoneDigits = (value: string) =>
  value.replace(/\D/g, "").slice(0, PHONE_DIGITS);
