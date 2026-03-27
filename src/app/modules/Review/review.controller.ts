import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReviewService } from "./review.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// create venue review
const createVenueReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { venueId, bookingId, rating, comment } = req.body;

  const result = await ReviewService.createVenueReview(
    userId,
    venueId,
    bookingId,
    rating,
    comment
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

// get reviews by venue
const getReviewsByVenueId = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.params;
  const result = await ReviewService.getReviewsByVenueId(venueId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venue reviews retrieved successfully!",
    data: result,
  });
});

export const ReviewController = {
  createVenueReview,
  getReviewsByVenueId,
};
