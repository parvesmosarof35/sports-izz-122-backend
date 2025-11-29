import express from "express";
import { VenueController } from "./venue.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/", auth(UserRole.VENDOR), VenueController.createVenue);

export const venueRoute = router;
