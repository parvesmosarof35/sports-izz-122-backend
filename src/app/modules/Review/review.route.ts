import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// create venue review
router.post("/venue", auth(), ReviewController.createVenueReview);

export const reviewRoute = router;
