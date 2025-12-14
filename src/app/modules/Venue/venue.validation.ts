import { z } from "zod";
import { SportsType } from "./venue.interface";

const createVenueValidation = z.object({
  venueName: z.string().min(1, "Venue name is required"),
  sportsType: z.enum(["BASKETBALL", "FOOTBALL", "TENNIS", "PICKLEBALL", "SWIMMING", "RUGBY", "PLIATES", "TAKRAW", "CRICKET", "BADMINTON"]),
  pricePerHour: z.number().positive("Price per hour must be positive"),
  capacity: z.number().positive("Capacity must be positive"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  venueImage: z.string().url("Valid venue image URL is required"),
  amenities: z.array(z.object({
    amenityName: z.string().min(1),
    amenityImage: z.string().url()
  })).optional(),
  courtNumbers: z.union([z.number().positive(), z.array(z.number().positive())]).optional(),
  venueStatus: z.boolean().optional()
});

export const VenueValidation = {
  createVenueValidation
};