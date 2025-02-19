import { z } from "zod";

export const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const invitedPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .nonempty("Password is required"),
    repeatPassword: z
      .string()
      .nonempty("Please confirm your password"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });
