import { z } from "zod";

const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];
const ukPostcodeRegex = /^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKPSTUW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$/i;

export const practiceRegistrationSchema = z
  .object({
    practiceName: z.string().min(1, "Practice name is required"),
    email: z.string().email("Invalid email address"),
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
          message:
            "For open days, both opening and closing times are required and closing must be after opening",
          path: ["openingHours"],
        }
      ),
    practice_services: z
      .record(z.string(), z.number().nonnegative("Price must be non-negative"))
      .refine((services) => Object.keys(services).length > 0, {
        message: "At least one service must be selected with a price",
      }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });



// Schema for create appointment in Practice Dashboard
export const createAppointmentSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  services: z.record(z.string(), z.number().nonnegative("Price must be non-negative")).refine(
    (services) => Object.keys(services).length > 0,
    { message: "At least one appointment type must be selected" }
  ),
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: "End time must be after start time",
});

// Schema for edit appointment in Practice Dashboard
export const editAppointmentSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  services: z.record(z.string(), z.number().nonnegative("Price must be non-negative")).refine(
    (services) => Object.keys(services).length > 0,
    { message: "At least one service must be selected" }
  ),
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: "End time must be after start time",
});

// Schema for practice settings in Practice Dashboard
export const practiceSettingsSchema = z.object({
  practice_name: z.string().min(1, "Practice name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  photo: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10MB",
    })
    .refine((file) => !file || allowedImageTypes.includes(file.type), {
      message: "File must be a PNG or JPEG image",
    }),
  opening_hours: z
    .array(
      z.object({
        dayName: z.string(),
        open: z.string(),
        close: z.string(),
      })
    )
    .refine((hours) => hours.some((day) => day.open !== "closed" && day.close !== "closed"), {
      message: "At least one day must be open",
      path: ["opening_hours"],
    })
    .refine(
      (hours) => {
        const timeRegex = /^\d{2}:\d{2}$/;
        return hours.every((day) => {
          if (day.open !== "closed" && day.close !== "closed") {
            return (
              day.open &&
              day.close &&
              timeRegex.test(day.open) &&
              timeRegex.test(day.close) &&
              timeToMinutes(day.close) > timeToMinutes(day.open)
            );
          }
          return day.open === "closed" && day.close === "closed";
        });
      },
      {
        message: "For open days, both opening and closing times are required and closing must be after opening",
        path: ["opening_hours"],
      }
    ),
  servicesOffered: z.array(
    z.object({
      name: z.string(),
      enabled: z.boolean(),
      price: z.number().nonnegative("Price must be non-negative").nullable(),
    })
  ).refine(
    (services) => {
      const enabledServices = services.filter(s => s.enabled);
      return enabledServices.length > 0 && enabledServices.every(s => s.price !== null);
    },
    { message: "All enabled services must have a non-negative price" }
  ),
});

function timeToMinutes(t: string): number {
  const [hh, mm] = t.split(":");
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}