import { z } from "zod";
import { BookingStatus } from "@prisma/client";

const createVenueBookingValidation = z.object({
  body: z.object({
    date: z.string().min(1, "Date is required"),
    day: z.string().min(1, "Day is required"),
    timeSlot: z.object({
      from: z.string().min(1, "Start time is required"),
      to: z.string().min(1, "End time is required"),
    }),
    sportsType: z.string().min(1, "SportsType is required"),
    totalPrice: z.number().min(1, "Total price must be positive"),
    venueId: z.string().optional(),
    userId: z.string().optional(),
    vendorId: z.string().optional(),
    checkoutSessionId: z.string().optional(),
  }),
});

const updateVenueBookingValidation = z.object({
  body: z.object({
    bookingStatus: z
      .enum([
        BookingStatus.PENDING,
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
        BookingStatus.COMPLETED,
      ])
      .optional(),
    totalPrice: z.number().min(0, "Total price must be positive").optional(),
  }),
});

export const VenueBookingValidation = {
  createVenueBookingValidation,
  updateVenueBookingValidation,
};
