import { z } from "zod";

// For the invite route
export const inviteUserSchema = z.object({
  email: z.string().email("Must be a valid email"),
});

// For finalizing (token + password)
export const finalizeInviteSchema = z.object({
  token: z.string().min(1, "Missing token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
