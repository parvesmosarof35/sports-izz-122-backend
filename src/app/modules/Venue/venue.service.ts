import prisma from "../../../shared/prisma";

// create venue
const createVenue = async (vendorId: string, payload: any) => {
  const venue = await prisma.venue.create({ data: payload });
  return venue;
};

export const VenueService = { createVenue };
