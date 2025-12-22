import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import {
  IVenueBooking,
  IVenueBookingFilterRequest,
  IVenueBookingPayload,
  IVenueBookingUpdate,
} from "./venueBooking.interface";
import { BookingStatus, Prisma, GamificationAction } from "@prisma/client";
import { GamificationService } from "../Gamification/gamification.service";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { XPResponse } from "../Gamification/gamification.interface";

// create venue booking
const createVenueBooking = async (
  userId: string,
  venueId: string,
  payload: IVenueBookingPayload
) => {
  // find user
  const findUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!findUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // check if venue exists
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
  });
  if (!venue) {
    throw new ApiError(httpStatus.NOT_FOUND, "Venue not found!");
  }

  // check if venue is active
  if (!venue.venueStatus) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Venue is not available for booking!"
    );
  }

  // validate court number
  if (!venue.courtNumbers.includes(payload.courtNumber)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Court number ${
        payload.courtNumber
      } is not available at this venue. Available courts: ${venue.courtNumbers.join(
        ", "
      )}`
    );
  }

  // find vendor through vendorId
  //   const vendor = await prisma.user.findUnique({
  //     where: { id: venue?.vendorId! },
  //   });

  //   if (!vendor || !vendor.stripeAccountId) {
  //     throw new ApiError(
  //       httpStatus.BAD_REQUEST,
  //       "Vendor is not available for booking!"
  //     );
  //   }

  // check if the time slot is available for the given date, day, and court number
  const existingBooking = await prisma.venue_booking.findFirst({
    where: {
      venueId,
      date: payload.date,
      day: payload.day,
      courtNumber: payload.courtNumber,
      bookingStatus: {
        equals: BookingStatus.CONFIRMED,
      },
      timeSlot: {
        equals: payload.timeSlot,
      },
    },
  });

  if (existingBooking) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Court number ${payload.courtNumber} is already booked for this time slot!`
    );
  }

  // create booking
  const result = await prisma.venue_booking.create({
    data: {
      venueId: venueId,
      userId: userId,
      vendorId: venue?.vendorId!,
      date: payload.date,
      day: payload.day,
      timeSlot: payload.timeSlot,
      courtNumber: payload.courtNumber,
      sportsType: payload.sportsType,
      totalPrice: payload.totalPrice,
      checkoutSessionId: payload.checkoutSessionId,
      bookingStatus: BookingStatus.PENDING,
    },
    include: {
      venue: {
        select: {
          id: true,
          venueName: true,
          sportsType: true,
          location: true,
          venueImage: true,
          pricePerHour: true,
        },
      },
    },
  });

  // Award XP for booking with comprehensive gamification updates
  try {
    // First check if gamification is enabled
    const settings = await GamificationService.getGamificationSettings();
    if (!settings.isActive) {
      // console.log("Gamification is disabled - skipping XP award");
      return result;
    }

    const gamificationResult = await GamificationService.awardXP(
      userId,
      "BOOKING" as any,
      `Venue booking: ${venue.venueName}`
    );

    // Update user profile with additional gamification data
    await updateUserGamificationProfile(userId, gamificationResult);

    // console.log("Gamification award completed:", {
    //   xpEarned: gamificationResult.xpEarned,
    //   newLevel: gamificationResult.newLevel,
    //   newBadges: gamificationResult.newBadges.length,
    //   achievementUpdates: gamificationResult.achievementUpdates.length,
    // });
  } catch (error) {
    // Log error but don't fail booking
    console.error("Gamification award failed:", error);
  }

  return result;
};

// get all specific user bookings
const getMyVenueBookings = async (
  userId: string,
  params: IVenueBookingFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { filter, sportsType } = params;

  const filters: Prisma.Venue_bookingWhereInput[] = [];

  // filter user
  filters.push({
    userId,
  });

  // sportsType filter
  if (sportsType) {
    filters.push({
      venue: {
        sportsType: sportsType,
      },
    });
  }

  // calculate booking status based on date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // set to start of day

  const result = await prisma.venue_booking.findMany({
    where: {
      AND: filters,
    },
    include: {
      venue: {
        select: {
          id: true,
          venueName: true,
          sportsType: true,
          location: true,
          venueImage: true,
          pricePerHour: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          contactNumber: true,
        },
      },
      payment: true,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  // bookings to determine status based on date
  const processedBookings = result.map((booking) => {
    const bookingDate = new Date(booking.date);
    const daysDiff = Math.floor(
      (today.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status = "new_request"; // default status

    if (booking.bookingStatus === BookingStatus.COMPLETED) {
      status = "completed";
    } else if (
      booking.bookingStatus === BookingStatus.CONFIRMED &&
      daysDiff > 1
    ) {
      status = "ongoing";
    } else if (
      booking.bookingStatus === BookingStatus.CONFIRMED &&
      daysDiff <= 1
    ) {
      status = "new_request";
    }

    return {
      ...booking,
      calculatedStatus: status,
    };
  });

  // filter by status if needed
  const filteredBookings = processedBookings.filter((booking) => {
    if (filter) {
      // Handle both singular and plural forms
      if (filter === "new-requests") {
        return booking.calculatedStatus === "new_request";
      }
      return booking.calculatedStatus === filter;
    }
    return true;
  });

  const total = filteredBookings.length;

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: filteredBookings,
  };
};

// get all specific vender bookings
const getVendorVenueBookings = async (
  vendorId: string,
  params: IVenueBookingFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { filter, sportsType } = params;

  const filters: Prisma.Venue_bookingWhereInput[] = [];

  // filter vender
  filters.push({
    vendorId,
  });

  // sportsType filter
  if (sportsType) {
    filters.push({
      venue: {
        sportsType: sportsType,
      },
    });
  }

  // calculate booking status based on date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // set to start of day

  const result = await prisma.venue_booking.findMany({
    where: {
      AND: filters,
    },
    include: {
      venue: {
        select: {
          id: true,
          venueName: true,
          sportsType: true,
          location: true,
          venueImage: true,
          pricePerHour: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          contactNumber: true,
        },
      },
      payment: true,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  // bookings to determine status based on date
  const processedBookings = result.map((booking) => {
    const bookingDate = new Date(booking.date);
    const daysDiff = Math.floor(
      (today.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status = "new_request"; // default status

    if (booking.bookingStatus === BookingStatus.COMPLETED) {
      status = "completed";
    } else if (
      booking.bookingStatus === BookingStatus.CONFIRMED &&
      daysDiff > 1
    ) {
      status = "ongoing";
    } else if (
      booking.bookingStatus === BookingStatus.CONFIRMED &&
      daysDiff <= 1
    ) {
      status = "new_request";
    }

    return {
      ...booking,
      calculatedStatus: status,
    };
  });

  // filter by status if needed
  const filteredBookings = processedBookings.filter((booking) => {
    if (filter) {
      // Handle both singular and plural forms
      if (filter === "new-requests") {
        return booking.calculatedStatus === "new_request";
      }
      return booking.calculatedStatus === filter;
    }
    return true;
  });

  const total = filteredBookings.length;

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: filteredBookings,
  };
};

// get single venue booking
const getSingleVenueBooking = async (bookingId: string) => {
  const result = await prisma.venue_booking.findUnique({
    where: { id: bookingId },
    include: {
      venue: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          contactNumber: true,
        },
      },
      payment: true,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Venue booking not found!");
  }

  return result;
};

// update venue booking
const updateVenueBooking = async (
  bookingId: string,
  payload: IVenueBookingUpdate,
  userId?: string,
  vendorId?: string
) => {
  // check if booking exists
  const existingBooking = await prisma.venue_booking.findUnique({
    where: { id: bookingId },
  });

  if (!existingBooking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Venue booking not found!");
  }

  // check permissions
  if (userId && existingBooking.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to update this booking!"
    );
  }

  if (vendorId && existingBooking.vendorId !== vendorId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to update this booking!"
    );
  }

  // prevent updates for completed or cancelled bookings (except for status changes by vendor)
  if (
    (existingBooking.bookingStatus === BookingStatus.COMPLETED ||
      existingBooking.bookingStatus === BookingStatus.CANCELLED) &&
    !payload.bookingStatus
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot update completed or cancelled bookings!"
    );
  }

  const result = await prisma.venue_booking.update({
    where: { id: bookingId },
    data: payload,
    include: {
      venue: {
        select: {
          id: true,
          venueName: true,
          sportsType: true,
          location: true,
          venueImage: true,
          pricePerHour: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          contactNumber: true,
        },
      },
      payment: true,
    },
  });

  return result;
};

// delete venue booking (admin only)
const deleteVenueBooking = async (bookingId: string) => {
  // check if booking exists
  const existingBooking = await prisma.venue_booking.findUnique({
    where: { id: bookingId },
  });

  if (!existingBooking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Venue booking not found!");
  }

  const result = await prisma.venue_booking.delete({
    where: { id: bookingId },
  });

  return result;
};

// Helper function to update user gamification profile
const updateUserGamificationProfile = async (
  userId: string,
  gamificationResult: XPResponse
) => {
  try {
    // Update user profile with latest gamification data
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        currentLevel: gamificationResult.newLevel
          ? gamificationResult.newLevel
          : undefined,
        nextLevelXP: gamificationResult.nextLevelXP,
        levelTitle: gamificationResult.levelTitle,
        lastActiveDate: new Date(),
      },
    });

    // Log badge and achievement updates
    if (gamificationResult.newBadges.length > 0) {
      console.log(
        `User ${userId} earned ${gamificationResult.newBadges.length} new badges:`,
        gamificationResult.newBadges.map((b) => b.name).join(", ")
      );

      // Award additional points for badges
      const totalBadgePoints = gamificationResult.newBadges.reduce(
        (sum, badge) => sum + badge.pointsReward,
        0
      );

      if (totalBadgePoints > 0) {
        await prisma.userProfile.update({
          where: { userId },
          data: { atlasPoints: { increment: totalBadgePoints } },
        });
        console.log(
          `Awarded ${totalBadgePoints} additional points from badges`
        );
      }
    }

    if (gamificationResult.achievementUpdates.length > 0) {
      const completedAchievements =
        gamificationResult.achievementUpdates.filter((a) => a.isCompleted);

      if (completedAchievements.length > 0) {
        console.log(
          `User ${userId} completed ${completedAchievements.length} achievements:`,
          completedAchievements.map((a) => a.name).join(", ")
        );

        // Award additional points for completed achievements
        const totalAchievementPoints = completedAchievements.reduce(
          (sum, achievement) => sum + achievement.pointsReward,
          0
        );

        if (totalAchievementPoints > 0) {
          await prisma.userProfile.update({
            where: { userId },
            data: { atlasPoints: { increment: totalAchievementPoints } },
          });
          console.log(
            `Awarded ${totalAchievementPoints} additional points from achievements`
          );
        }
      }
    }

    // Check for level up and update user status
    if (gamificationResult.newLevel) {
      console.log(
        `User ${userId} leveled up to level ${gamificationResult.newLevel}!`
      );

      // Award level-up bonus points
      const levelUpBonus = gamificationResult.newLevel * 10; // 10 points per level
      await prisma.userProfile.update({
        where: { userId },
        data: { atlasPoints: { increment: levelUpBonus } },
      });
      console.log(`Awarded ${levelUpBonus} bonus points for leveling up`);

      // You could add additional level-up rewards here
      // For example: special badges, unlock features, etc.
    }

    // Update streak information
    await updateBookingStreak(userId);

    return updatedProfile;
  } catch (error) {
    console.error("Failed to update user gamification profile:", error);
    // Don't throw error to avoid failing the main booking process
  }
};

// Helper function to update booking streak
const updateBookingStreak = async (userId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user has any booking today
    const todayBooking = await prisma.venue_booking.findFirst({
      where: {
        userId,
        date: today.toISOString().split("T")[0],
        bookingStatus: BookingStatus.CONFIRMED,
      },
    });

    if (todayBooking) {
      // Update or create booking streak
      const existingStreak = await prisma.userStreak.findUnique({
        where: {
          userId_streakType: {
            userId,
            streakType: "booking",
          },
        },
      });

      if (existingStreak) {
        await prisma.userStreak.update({
          where: { id: existingStreak.id },
          data: {
            currentStreak: existingStreak.currentStreak + 1,
            bestStreak: Math.max(
              existingStreak.bestStreak,
              existingStreak.currentStreak + 1
            ),
            lastActiveDate: today,
          },
        });
      } else {
        await prisma.userStreak.create({
          data: {
            userId,
            streakType: "booking",
            currentStreak: 1,
            bestStreak: 1,
            lastActiveDate: today,
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to update booking streak:", error);
  }
};

export const VenueBookingService = {
  createVenueBooking,
  getMyVenueBookings,
  getVendorVenueBookings,
  getSingleVenueBooking,
  updateVenueBooking,
  deleteVenueBooking,
};
