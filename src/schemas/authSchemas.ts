// /schemas/authSchemas.ts
import { z } from "zod";

export const userLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Invalid email address",
    }),
  password: z.string().min(1, { message: "Password is required" }),
});




export const userRegistrationSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Invalid email address",
      }),
      password: z
      .string()
      .refine(
        (val) =>
          val.length >= 8 &&
          /[!@#$%^&*(),.?":{}|<>]/.test(val),
        {
          message: "Password must be at least 8 characters long and contain a special character",
        }
      ),
    
    repeatPassword: z.string().min(1, "Please confirm your password"),
    role: z.literal("user"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: "Invalid email address",
  }),
});

