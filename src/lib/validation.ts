import { z } from "zod";

// Simulate "taken" usernames
const TAKEN_USERNAMES = ["admin", "test", "parent", "user"];

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, { message: "Oops! Please enter your email 😊" })
      .email({ message: "Hmm, that doesn't look like a valid email 💌" })
      .max(255),
    password: z
      .string()
      .min(6, { message: "Password needs at least 6 characters 🔒" })
      .max(100),
    repeatPassword: z.string().min(1, { message: "Please repeat your password 🔁" }),
    username: z
      .string()
      .trim()
      .min(3, { message: "Username must be at least 3 characters ✨" })
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, { message: "Letters, numbers and _ only please 🙏" })
      .refine((val) => !TAKEN_USERNAMES.includes(val.toLowerCase()), {
        message: "This username is already taken 😅",
      }),
    firstName: z
      .string()
      .trim()
      .min(1, { message: "First name is required 🌟" })
      .max(50),
    lastName: z
      .string()
      .trim()
      .min(1, { message: "Last name is required 🌟" })
      .max(50),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match, try again 💫",
    path: ["repeatPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
