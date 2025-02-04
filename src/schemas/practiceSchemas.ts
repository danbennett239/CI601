// /schemas/practiceSchemas.ts
import { z } from "zod";

const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];

export const practiceRegistrationSchema = z
  .object({
    practiceName: z.string().min(1, "Practice name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    repeatPassword: z.string().min(1, "Please confirm your password"),
    phoneNumber: z.string().optional(),
    photo: z
      .instanceof(File, { message: "Photo is required" })
      .refine((file) => file.size <= 10 * 1024 * 1024, {
        message: "File size must be less than 10MB",
      })
      .refine((file) => allowedImageTypes.includes(file.type), {
        message: "File must be a PNG or JPEG image",
      }),
    address: z.object({
      line1: z.string().min(1, "Address Line 1 is required"),
      line2: z.string().optional(),
      line3: z.string().optional(),
      city: z.string().min(1, "City/Town is required"),
      county: z.string().optional(),
      postcode: z.string().min(1, "Postcode is required"),
      country: z.string().min(1, "Country is required"),
    }),
    openingHours: z
      .array(
        z.object({
          dayName: z.string(),
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean(),
        })
      )
      .refine((hours) => hours.some((day) => !day.closed), {
        message: "At least one day must be open",
        path: ["openingHours"],
      })
      .refine(
        (hours) => {
          const timeRegex = /^\d{2}:\d{2}$/;
          for (const day of hours) {
            if (!day.closed) {
              if (!day.open || !day.close) return false;
              if (!timeRegex.test(day.open) || !timeRegex.test(day.close)) return false;
              const [oh, om] = day.open.split(":").map(Number);
              const [ch, cm] = day.close.split(":").map(Number);
              if (ch * 60 + cm <= oh * 60 + om) return false;
            }
          }
          return true;
        },
        {
          message:
            "For open days, ensure opening and closing times are valid and closing time is after opening time",
          path: ["openingHours"],
        }
      ),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });
