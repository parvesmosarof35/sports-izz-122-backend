import { Review } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { GamificationService } from "../Gamification/gamification.service";

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

  // award XP for review with comprehensive gamification updates
  try {
    // First check if gamification is enabled
    const settings = await GamificationService.getGamificationSettings();
    if (!settings.isActive) {
      console.log("Gamification is disabled - skipping XP award for review");
      return review;
    }

    const gamificationResult = await GamificationService.awardXP(
      userId,
      "REVIEW" as any,
      `Venue review: ${venueId} - Rating: ${rating}`
    );

    console.log("Review gamification award completed:", {
      xpEarned: gamificationResult.xpEarned,
      newLevel: gamificationResult.newLevel,
      newBadges: gamificationResult.newBadges.length,
      achievementUpdates: gamificationResult.achievementUpdates.length,
    });
  } catch (error) {
    // Log error but don't fail review creation
    console.error("Review gamification award failed:", error);
  }

  return review;
};

export const ReviewService = {
  createVenueReview,
};
