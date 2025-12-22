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

router.get(
  "/all",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER, UserRole.VENDOR),
  LevelController.getAllLevels
);

router.get(
  "/by-xp",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER, UserRole.VENDOR),
  LevelController.getLevelByXP
);

router.post(
  "/create",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LevelController.createLevel
);

router.patch(
  "/:levelId",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LevelController.updateLevel
);

router.delete(
  "/:levelId",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LevelController.deleteLevel
);

export const levelRoute = router;
