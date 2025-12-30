import express from "express";
import { LevelController } from "./level.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

// Admin routes
router.post(
  "/initialize",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LevelController.createInitialLevels
);

// get all levels
router.get(
  "/all",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER, UserRole.VENDOR),
  LevelController.getAllLevels
);

// get single level
router.get(
  "/:levelId",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER, UserRole.VENDOR),
  LevelController.getSingleLevel
);

// get level by xp
router.get(
  "/by-xp",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER, UserRole.VENDOR),
  LevelController.getLevelByXP
);

// create level
router.post(
  "/create",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LevelController.createLevel
);

// update level
router.patch(
  "/:levelId",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LevelController.updateLevel
);

// delete level
router.delete(
  "/:levelId",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LevelController.deleteLevel
);

export const levelRoute = router;
