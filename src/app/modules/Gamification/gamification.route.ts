import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { gamificationValidation } from "./gamification.validation";
import auth from "../../middlewares/auth";
import { GamificationController } from "./gamification.controller";
import { UserRole } from "@prisma/client";

const router = express.Router();

// User routes
router.get(
  "/profile",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getUserProfile
);

router.get(
  "/badges",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getUserBadges
);

router.get(
  "/achievements",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getUserAchievements
);

router.get(
  "/streaks",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getUserStreaks
);

router.get(
  "/xp-history",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getXPHistory
);

router.get(
  "/leaderboard",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getLeaderboard
);

router.post(
  "/award-xp",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(gamificationValidation.awardXPZodSchema),
  GamificationController.awardXP
);

router.post(
  "/redeem-points",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(gamificationValidation.redeemPointsZodSchema),
  GamificationController.redeemPoints
);

// Admin routes
router.post(
  "/badges",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(gamificationValidation.createBadgeZodSchema),
  GamificationController.createBadge
);

router.post(
  "/achievements",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(gamificationValidation.createAchievementZodSchema),
  GamificationController.createAchievement
);

router.get(
  "/settings",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getGamificationSettings
);

router.patch(
  "/settings",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(gamificationValidation.updateSettingsZodSchema),
  GamificationController.updateGamificationSettings
);

export const gamificationRoute = router;
