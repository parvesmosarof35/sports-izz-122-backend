import { Review } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

// create venue review
const createVenueReview = async (
  userId: string,
  venueId: string,
  rating: number,
  comment?: string
): Promise<Review> => {
  // find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      venueId,
      rating,
      comment,
    },
  });

  const ratings = await prisma.review.findMany({
    where: {
      venueId,
    },
    select: {
      rating: true,
    },
  });

  // average rating calculation
  const averageRating =
    ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  await prisma.venue.update({
    where: { id: venueId },
    data: {
      venueRating: averageRating.toFixed(1),
      venueReviewCount: ratings.length,
    },
  });

  return review;
};

export const ReviewService = {
  createVenueReview,
};
