import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import {
  IVenueBooking,
  IVenueBookingFilterRequest,
  IVenueBookingPayload,
  IVenueBookingUpdate,
} from "./venueBooking.interface";
import { BookingStatus, Prisma } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";

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

  // check if the time slot is available for the given date and day
  const existingBooking = await prisma.venue_booking.findFirst({
    where: {
      venueId,
      date: payload.date,
      day: payload.day,
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
      "This time slot is already booked!"
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

  return result;
};

// get all venue bookings (for admin)
const getAllVenueBookings = async (
  params: IVenueBookingFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { searchTerm, ...filterData } = params;

  const filters: Prisma.Venue_bookingWhereInput[] = [];

  // text search
  if (params?.searchTerm) {
    filters.push({
      OR: [
        {
          venue: {
            venueName: {
              contains: params.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            fullName: {
              contains: params.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // exact field match filters
  if (Object.keys(filterData).length > 0) {
    filters.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const where: Prisma.Venue_bookingWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const result = await prisma.venue_booking.findMany({
    where,
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

  const total = await prisma.venue_booking.count({
    where,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// get my venue bookings (for user)
const getMyVenueBookings = async (
  userId: string,
  params: IVenueBookingFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { searchTerm, ...filterData } = params;

  const filters: Prisma.Venue_bookingWhereInput[] = [{ userId: userId }];

  // text search
  if (params?.searchTerm) {
    filters.push({
      OR: [
        {
          venue: {
            venueName: {
              contains: params.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            fullName: {
              contains: params.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // exact field match filters
  if (Object.keys(filterData).length > 0) {
    filters.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const where: Prisma.Venue_bookingWhereInput = {
    AND: filters,
  };

  const result = await prisma.venue_booking.findMany({
    where,
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

  const total = await prisma.venue_booking.count({
    where,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// get venue bookings for vendor
const getVendorVenueBookings = async (
  vendorId: string,
  params: IVenueBookingFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { searchTerm, ...filterData } = params;

  const filters: Prisma.Venue_bookingWhereInput[] = [{ vendorId: vendorId }];

  // text search
  if (params?.searchTerm) {
    filters.push({
      OR: [
        {
          venue: {
            venueName: {
              contains: params.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            fullName: {
              contains: params.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // exact field match filters
  if (Object.keys(filterData).length > 0) {
    filters.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const where: Prisma.Venue_bookingWhereInput = {
    AND: filters,
  };

  const result = await prisma.venue_booking.findMany({
    where,
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

  const total = await prisma.venue_booking.count({
    where,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// get single venue booking
const getSingleVenueBooking = async (
  bookingId: string,
  userId?: string,
  vendorId?: string
) => {
  const whereCondition: Prisma.Venue_bookingWhereInput = {
    id: bookingId,
  };

  // add user or vendor filter if provided
  if (userId) {
    whereCondition.userId = userId;
  } else if (vendorId) {
    whereCondition.vendorId = vendorId;
  }

  const result = await prisma.venue_booking.findFirst({
    where: whereCondition,
    include: {
      venue: {
        select: {
          id: true,
          venueName: true,
          sportsType: true,
          location: true,
          venueImage: true,
          pricePerHour: true,
          capacity: true,
          amenities: true,
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

// cancel venue booking
const cancelVenueBooking = async (bookingId: string, userId: string) => {
  // check if booking exists and belongs to user
  const existingBooking = await prisma.venue_booking.findUnique({
    where: { id: bookingId },
  });

  if (!existingBooking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Venue booking not found!");
  }

  if (existingBooking.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to cancel this booking!"
    );
  }

  // check if booking can be cancelled
  if (
    existingBooking.bookingStatus === BookingStatus.CANCELLED ||
    existingBooking.bookingStatus === BookingStatus.COMPLETED
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot cancel this booking!");
  }

  const result = await prisma.venue_booking.update({
    where: { id: bookingId },
    data: {
      bookingStatus: BookingStatus.CANCELLED,
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

export const VenueBookingService = {
  createVenueBooking,
  getAllVenueBookings,
  getMyVenueBookings,
  getVendorVenueBookings,
  getSingleVenueBooking,
  updateVenueBooking,
  cancelVenueBooking,
  deleteVenueBooking,
};
