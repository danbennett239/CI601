import { z } from "zod";

const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];
const ukPostcodeRegex = /^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKPSTUW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$/i;

export const practiceRegistrationSchema = z
  .object({
    practiceName: z.string().min(1, "Practice name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    repeatPassword: z.string().min(1, "Please confirm your password"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    photo: z
      .instanceof(File, { message: "Practice photo is required" })
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
      postcode: z.string().regex(ukPostcodeRegex, "Invalid UK postcode"),
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
          return hours.every((day) => {
            if (!day.closed) {
              return (
                day.open &&
                day.close &&
                timeRegex.test(day.open) &&
                timeRegex.test(day.close) &&
                timeToMinutes(day.close) > timeToMinutes(day.open)
              );
            }
            return true;
          });
        },
        {
          message: "For open days, both opening and closing times are required and closing must be after opening",
          path: ["openingHours"],
        }
      ),
    practice_services: z.record(z.string(), z.number().nonnegative("Price must be non-negative")).refine(
      (services) => Object.keys(services).length > 0,
      { message: "At least one service must be selected with a price" }
    ),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

function timeToMinutes(t: string): number {
  const [hh, mm] = t.split(":");
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}