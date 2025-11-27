import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";

const createUserZodSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: "Full name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email("Please provide a valid email address")
      .transform((val) => val.trim())
      .refine((val) => val === val.toLowerCase(), {
        message: "Email must be lowercase",
      }),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    profileImage: z.string().optional(),
    contactNumber: z
      .string()
      .optional()
      .refine((val) => !val || /^\+?\d{7,15}$/.test(val), {
        message: "Please provide a valid contact number",
      }),
    address: z.string().optional(),
    country: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    fcmToken: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export const updateUserZodSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    // email: z.string().email().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    country: z.string().optional(),
    profileImage: z.string().optional(),
  }),
});

export const userValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
