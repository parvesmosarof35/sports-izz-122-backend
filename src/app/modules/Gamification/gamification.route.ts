import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { gamificationValidation } from "./gamification.validation";
import auth from "../../middlewares/auth";
import { GamificationController } from "./gamification.controller";
import { UserRole } from "@prisma/client";
import { uploadFile } from "../../../helpars/fileUploader";
import { parseBodyData } from "../../middlewares/parseNestedJson";

const router = express.Router();

// User routes
router.get(
  "/profile",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getUserProfile
);

// get user badges
router.get(
  "/badges",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getUserBadges
);

// get all badges access only admin
router.get(
  "/all-badges",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getAllBadgesForAdmin
);

// get user achievements
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

// get xp history
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

// award xp
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

// admin: create badge
router.post(
  "/badges",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadFile.iconUrl,
  parseBodyData,
  validateRequest(gamificationValidation.createBadgeZodSchema),
  GamificationController.createBadge
);

// admin: create achievement
router.post(
  "/achievements",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(gamificationValidation.createAchievementZodSchema),
  GamificationController.createAchievement
);

// admin: get settings
router.get(
  "/settings",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.getGamificationSettings
);

// admin: upsert settings
router.patch(
  "/settings",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(gamificationValidation.updateSettingsZodSchema),
  GamificationController.updateGamificationSettings
);

// active to inactive badge
router.patch(
  "/badges/:badgeId/active",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.activeBadge
);

// delete badge
router.patch(
  "/badges/:badgeId",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GamificationController.deleteBadge
);

export const gamificationRoute = router;
