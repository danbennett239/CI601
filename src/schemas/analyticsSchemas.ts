import { z } from "zod";

export const analyticsDateSchema = z
  .string()
  .refine((date) => new Date(date) <= new Date(), {
    message: "Unpopulated or future dates are not allowed.",
  });