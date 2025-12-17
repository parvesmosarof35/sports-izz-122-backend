import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { SportsTypeController } from "./sportsType.controller";
import { uploadFile } from "../../../helpars/fileUploader";
import { SportsTypeValidation } from "./sportsType.validation";
import { parseBodyData } from "../../middlewares/parseNestedJson";

const router = express.Router();

// get all sportsType public api
router.get("/", SportsTypeController.getAllSportsTypes);

// get single sportsType
router.get("/:id", SportsTypeController.getSportsTypeById);

// create sportsType access only admin
router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadFile.sportsTypeImage,
  parseBodyData,
  validateRequest(SportsTypeValidation.createSportsTypeSchema),
  SportsTypeController.createSportsType
);

// update sportsType access only admin
router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadFile.sportsTypeImage,
  parseBodyData,
  validateRequest(SportsTypeValidation.updateSportsTypeSchema),
  SportsTypeController.updateSportsType
);

// delete sportsType access only admin
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SportsTypeController.deleteSportsType
);

export const sportsTypeRoute = router;
