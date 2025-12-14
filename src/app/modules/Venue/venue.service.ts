import prisma from "../../../shared/prisma";
import { IVenuePayload } from "./venue.interface";

// create venue
const createVenue = async (vendorId: string, payload: IVenuePayload) => {
  // Generate court numbers array if courtNumbers is provided as count
  const processedPayload = {
    ...payload,
    vendorId,
    courtNumbers: payload.courtNumbers 
      ? Array.isArray(payload.courtNumbers) 
        ? payload.courtNumbers 
        : Array.from({ length: payload.courtNumbers }, (_, i) => i + 1)
      : undefined
  };

  const venue = await prisma.venue.create({ 
    data: processedPayload
  });
  return venue;
};

export const VenueService = { createVenue };
