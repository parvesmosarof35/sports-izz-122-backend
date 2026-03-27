import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// create venue review
router.post("/venue", auth(), ReviewController.createVenueReview);

// get reviews by venue
router.get("/venue/:venueId", ReviewController.getReviewsByVenueId);

export const reviewRoute = router;
