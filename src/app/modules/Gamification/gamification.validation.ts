import { z } from "zod";
import { GamificationAction, BadgeType, AchievementType } from "./gamification.interface";

const awardXPZodSchema = z.object({
  body: z.object({
    action: z.nativeEnum(GamificationAction, {
      required_error: "Action is required",
      invalid_type_error: "Invalid action type",
    }),
    description: z.string().optional(),
  }),
});

const redeemPointsZodSchema = z.object({
  body: z.object({
    pointsToRedeem: z
      .number({
        required_error: "Points to redeem is required",
        invalid_type_error: "Points must be a number",
      })
      .positive("Points must be greater than 0")
      .int("Points must be an integer"),
    rewardType: z.string({
      required_error: "Reward type is required",
    }),
  }),
});

const createBadgeZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Badge name is required",
    }).min(1, "Badge name cannot be empty"),
    description: z.string({
      required_error: "Badge description is required",
    }).min(1, "Badge description cannot be empty"),
    iconUrl: z.string({
      required_error: "Badge icon URL is required",
    }).url("Please provide a valid URL for the icon"),
    badgeType: z.nativeEnum(BadgeType, {
      required_error: "Badge type is required",
      invalid_type_error: "Invalid badge type",
    }),
    xpReward: z
      .number({
        invalid_type_error: "XP reward must be a number",
      })
      .nonnegative("XP reward cannot be negative")
      .int("XP reward must be an integer")
      .default(0),
    pointsReward: z
      .number({
        invalid_type_error: "Points reward must be a number",
      })
      .nonnegative("Points reward cannot be negative")
      .int("Points reward must be an integer")
      .default(0),
  }),
});

const createAchievementZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Achievement name is required",
    }).min(1, "Achievement name cannot be empty"),
    description: z.string({
      required_error: "Achievement description is required",
    }).min(1, "Achievement description cannot be empty"),
    achievementType: z.nativeEnum(AchievementType, {
      required_error: "Achievement type is required",
      invalid_type_error: "Invalid achievement type",
    }),
    targetValue: z
      .number({
        required_error: "Target value is required",
        invalid_type_error: "Target value must be a number",
      })
      .positive("Target value must be greater than 0")
      .int("Target value must be an integer"),
    xpReward: z
      .number({
        invalid_type_error: "XP reward must be a number",
      })
      .nonnegative("XP reward cannot be negative")
      .int("XP reward must be an integer")
      .default(0),
    pointsReward: z
      .number({
        invalid_type_error: "Points reward must be a number",
      })
      .nonnegative("Points reward cannot be negative")
      .int("Points reward must be an integer")
      .default(0),
  }),
});

const updateSettingsZodSchema = z.object({
  body: z.object({
    xpPerBooking: z
      .number({
        invalid_type_error: "XP per booking must be a number",
      })
      .nonnegative("XP per booking cannot be negative")
      .int("XP per booking must be an integer")
      .optional(),
    xpPerReview: z
      .number({
        invalid_type_error: "XP per review must be a number",
      })
      .nonnegative("XP per review cannot be negative")
      .int("XP per review must be an integer")
      .optional(),
    xpPerReferral: z
      .number({
        invalid_type_error: "XP per referral must be a number",
      })
      .nonnegative("XP per referral cannot be negative")
      .int("XP per referral must be an integer")
      .optional(),
    xpPerChallenge: z
      .number({
        invalid_type_error: "XP per challenge must be a number",
      })
      .nonnegative("XP per challenge cannot be negative")
      .int("XP per challenge must be an integer")
      .optional(),
    xpPerDailyLogin: z
      .number({
        invalid_type_error: "XP per daily login must be a number",
      })
      .nonnegative("XP per daily login cannot be negative")
      .int("XP per daily login must be an integer")
      .optional(),
    streakBonusXP: z
      .number({
        invalid_type_error: "Streak bonus XP must be a number",
      })
      .nonnegative("Streak bonus XP cannot be negative")
      .int("Streak bonus XP must be an integer")
      .optional(),
    referralPointsReward: z
      .number({
        invalid_type_error: "Referral points reward must be a number",
      })
      .nonnegative("Referral points reward cannot be negative")
      .int("Referral points reward must be an integer")
      .optional(),
    pointsToXPConversion: z
      .number({
        invalid_type_error: "Points to XP conversion must be a number",
      })
      .positive("Points to XP conversion must be greater than 0")
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateBadgeZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Badge name cannot be empty").optional(),
    description: z.string().min(1, "Badge description cannot be empty").optional(),
    iconUrl: z.string().url("Please provide a valid URL for the icon").optional(),
    isActive: z.boolean().optional(),
    xpReward: z
      .number()
      .nonnegative("XP reward cannot be negative")
      .int("XP reward must be an integer")
      .optional(),
    pointsReward: z
      .number()
      .nonnegative("Points reward cannot be negative")
      .int("Points reward must be an integer")
      .optional(),
  }),
});

const updateAchievementZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Achievement name cannot be empty").optional(),
    description: z.string().min(1, "Achievement description cannot be empty").optional(),
    targetValue: z
      .number()
      .positive("Target value must be greater than 0")
      .int("Target value must be an integer")
      .optional(),
    isActive: z.boolean().optional(),
    xpReward: z
      .number()
      .nonnegative("XP reward cannot be negative")
      .int("XP reward must be an integer")
      .optional(),
    pointsReward: z
      .number()
      .nonnegative("Points reward cannot be negative")
      .int("Points reward must be an integer")
      .optional(),
  }),
});

export const gamificationValidation = {
  awardXPZodSchema,
  redeemPointsZodSchema,
  createBadgeZodSchema,
  createAchievementZodSchema,
  updateSettingsZodSchema,
  updateBadgeZodSchema,
  updateAchievementZodSchema,
};
