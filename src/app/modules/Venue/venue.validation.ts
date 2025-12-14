import { z } from "zod";
import { SportsType } from "@prisma/client";

const createVenueValidation = z.object({
  body: z.object({
    venueName: z.string().min(1, "Venue name is required"),
    sportsType: z.nativeEnum(SportsType),
    pricePerHour: z.number().positive("Price per hour must be positive"),
    capacity: z.number().positive("Capacity must be positive"),
    location: z.string().min(1, "Location is required"),
    description: z.string().min(1, "Description is required"),
    //   venueImage: z.string().url("Valid venue image URL is required"),
    amenities: z.array(
      z.object({
        amenityName: z.string().min(1),
        //   amenityImage: z.string().url(),
      })
    ).optional(),
    courtNumbers: z.union([
      z.number().positive(),
      z.array(z.number().positive()),
    ]).optional(),
    venueStatus: z.boolean().optional(),
    scheduleSlots: z.array(
      z.object({
        from: z.string().min(1, "Start time is required"),
        to: z.string().min(1, "End time is required"),
      })
    ).optional(),
    venueAvailabilities: z.array(
      z.object({
        day: z.string().min(1, "Day is required"),
        scheduleSlots: z.array(
          z.object({
            from: z.string().min(1, "Start time is required"),
            to: z.string().min(1, "End time is required"),
          })
        ),
      })
    ).optional(),
  }),
});

export const VenueValidation = {
  createVenueValidation,
};
