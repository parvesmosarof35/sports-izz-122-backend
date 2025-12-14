import express from "express";
import { VenueController } from "./venue.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { uploadFile } from "../../../helpars/fileUploader";
import { VenueValidation } from "./venue.validation";
import validateRequest from "../../middlewares/validateRequest";
import { parseBodyData } from "../../middlewares/parseNestedJson";

const router = express.Router();

// create venue
router.post(
  "/",
  auth(UserRole.VENDOR),
  uploadFile.venueImage,
  parseBodyData,
  validateRequest(VenueValidation.createVenueValidation),
  VenueController.createVenue
);

// get all venues
router.get("/", VenueController.getAllVenues);

export const venueRoute = router;
