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


// get all venues nearbyme
router.get("/nearby-me", VenueController.getAllNearbyVenues);

// get venue group by SportsType
router.get("/group-by-sports-type", VenueController.getVenueGroupBySportsType);

// get all my venues for vendor
router.get("/my", auth(UserRole.VENDOR), VenueController.getAllMyVenues);

// get single venue
router.get("/:venueId", VenueController.getSingleVenue);

// update venue
router.patch(
  "/:venueId",
  auth(UserRole.VENDOR),
  uploadFile.venueImage,
  parseBodyData,
  validateRequest(VenueValidation.updateVenueValidation),
  VenueController.updateVenue
);

// update venue details like photo , name , price , capacity , location , lat, long , description amenities  courtNumbers venueAvailabilities this things shokuld be update able by the vendor and first check if he is the owner of the venue
router.patch(
  "/:venueId/update-venue-details",
  auth(UserRole.VENDOR),
  uploadFile.venueImage,
  parseBodyData,
  validateRequest(VenueValidation.updateVenueValidation),
  VenueController.updateVenueDetails
);

// delete venue
router.delete("/:venueId", auth(UserRole.VENDOR), VenueController.deleteVenue);

export const venueRoute = router;
