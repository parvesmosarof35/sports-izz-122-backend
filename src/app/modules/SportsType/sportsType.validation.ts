import { z } from "zod";

const createSportsTypeSchema = z.object({
  body: z.object({
    sportName: z
      .string({
        required_error: "Sport name is required",
        invalid_type_error: "Sport name must be a string",
      })
      .min(1, "Sport name cannot be empty")
      .max(100, "Sport name cannot exceed 100 characters"),
  }),
});

const updateSportsTypeSchema = z.object({
  body: z.object({
    sportName: z
      .string({
        invalid_type_error: "Sport name must be a string",
      })
      .min(1, "Sport name cannot be empty")
      .max(100, "Sport name cannot exceed 100 characters")
      .optional(),
  }),
});

export const SportsTypeValidation = {
  createSportsTypeSchema,
  updateSportsTypeSchema,
};
