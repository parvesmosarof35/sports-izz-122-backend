import prisma from "../../../shared/prisma";
import { IVenue, IVenuePayload } from "./venue.interface";
import { Weekday } from "@prisma/client";

// convert day string to Weekday enum
const dayToWeekdayEnum: { [key: string]: Weekday } = {
  Monday: Weekday.MONDAY,
  Tuesday: Weekday.TUESDAY,
  Wednesday: Weekday.WEDNESDAY,
  Thursday: Weekday.THURSDAY,
  Friday: Weekday.FRIDAY,
  Saturday: Weekday.SATURDAY,
  Sunday: Weekday.SUNDAY,
};

// create venue
const createVenue = async (vendorId: string, payload: IVenuePayload) => {
  // generate court numbers array if courtNumbers is provided as count
  const processedPayload = {
    ...payload,
    vendorId,
    courtNumbers: payload.courtNumbers
      ? Array.isArray(payload.courtNumbers)
        ? payload.courtNumbers
        : Array.from({ length: payload.courtNumbers }, (_, i) => i + 1)
      : undefined,
  };

  // remove scheduleSlots and venueAvailabilities
  const { scheduleSlots, venueAvailabilities, ...venueData } = processedPayload;

  // create venue with schedule slots and availabilities
  const result = await prisma.$transaction(
    async (tx) => {
      // Create venue first
      const venue = await tx.venue.create({
        data: venueData,
      });

      // schedule slots
      const createdSlots: any[] = [];
      if (scheduleSlots && scheduleSlots.length > 0) {
        for (const slot of scheduleSlots) {
          const createdSlot = await tx.scheduleSlot.create({
            data: {
              from: slot.from,
              to: slot.to,
              venueId: venue.id,
            },
          });
          createdSlots.push(createdSlot);
        }
      }

      // availabilities
      const createdAvailabilities: any[] = [];
      if (venueAvailabilities && venueAvailabilities.length > 0) {
        for (const availability of venueAvailabilities) {
          const venueAvailability = await tx.venueAvailability.create({
            data: {
              day: dayToWeekdayEnum[availability.day] || Weekday.MONDAY,
              venueId: venue.id,
            },
          });

          // schedule slots for this availability
          const slots: any[] = [];
          for (const slot of availability.scheduleSlots) {
            const createdSlot = await tx.scheduleSlot.create({
              data: {
                from: slot.from,
                to: slot.to,
                venueId: venue.id,
                availableVenueId: venueAvailability.id,
              },
            });
            slots.push(createdSlot);
          }

          // add the original day name to the response
          createdAvailabilities.push({
            ...venueAvailability,
            day: availability.day,
            scheduleSlots: slots,
          });
        }
      }

      return {
        ...venue,
        scheduleSlots: createdSlots,
        venueAvailabilities: createdAvailabilities,
      };
    },
    {
      timeout: 30000,
    }
  );

  return result;
};

// get all venues
const getAllVenues = async () => {
  const result = await prisma.venue.findMany({
    include: {
      venueAvailabilities: {
        include: {
          scheduleSlots: true,
        },
      },
    },
  });
  return result;
};

// get all my venues
const getAllMyVenues = async (vendorId: string) => {
  const result = await prisma.venue.findMany({
    where: {
      vendorId,
    },
    include: {
      venueAvailabilities: {
        include: {
          scheduleSlots: true,
        },
      },
    },
  });
  return result;
};

// update venue
const updateVenue = async (
  vendorId: string,
  venueId: string,
  payload: Partial<IVenue> & {
    venueImage?: string;
    scheduleSlots?: any;
    venueAvailabilities?: any;
  }
) => {
  // check if venue exists vendor
  const existingVenue = await prisma.venue.findFirst({
    where: {
      id: venueId,
      vendorId: vendorId,
    },
  });

  if (!existingVenue) {
    throw new Error(
      "Venue not found or you don't have permission to update it"
    );
  }

  // process courtNumbers if provided
  const processedPayload = {
    ...payload,
    courtNumbers: payload.courtNumbers
      ? Array.isArray(payload.courtNumbers)
        ? payload.courtNumbers
        : Array.from({ length: payload.courtNumbers }, (_, i) => i + 1)
      : undefined,
  };

  // separate time slots from basic venue data
  const { scheduleSlots, venueAvailabilities, ...updateData } =
    processedPayload;

  // remove invalid fields from venue update
  const validVenueFields = {
    venueName: updateData.venueName,
    sportsType: updateData.sportsType,
    pricePerHour: updateData.pricePerHour,
    capacity: updateData.capacity,
    location: updateData.location,
    description: updateData.description,
    venueStatus: updateData.venueStatus,
    venueImage: updateData.venueImage,
    amenities: updateData.amenities,
    courtNumbers: updateData.courtNumbers,
  };

  // filter out undefined values
  const filteredUpdateData = Object.fromEntries(
    Object.entries(validVenueFields).filter(([_, value]) => value !== undefined)
  );

  const result = await prisma.$transaction(
    async (tx) => {
      // update basic venue info
      const updatedVenue = await tx.venue.update({
        where: {
          id: venueId,
        },
        data: filteredUpdateData,
      });

      // scheduleSlots update if provided
      if (scheduleSlots && scheduleSlots.length > 0) {
        // delete existing schedule slots
        await tx.scheduleSlot.deleteMany({
          where: {
            venueId: venueId,
            availableVenueId: null,
          },
        });

        // create new schedule slots
        for (const slot of scheduleSlots) {
          await tx.scheduleSlot.create({
            data: {
              from: slot.from,
              to: slot.to,
              venueId: venueId,
            },
          });
        }
      }

      // venueAvailabilities update if provided
      if (venueAvailabilities && venueAvailabilities.length > 0) {
        // delete existing venue availabilities
        await tx.scheduleSlot.deleteMany({
          where: {
            venueId: venueId,
            availableVenueId: {
              not: null,
            },
          },
        });

        await tx.venueAvailability.deleteMany({
          where: {
            venueId: venueId,
          },
        });

        // create new venue availabilities and schedule slots
        for (const availability of venueAvailabilities) {
          const venueAvailability = await tx.venueAvailability.create({
            data: {
              day: dayToWeekdayEnum[availability.day] || Weekday.MONDAY,
              venueId: venueId,
            },
          });

          // schedule slots for this availability
          for (const slot of availability.scheduleSlots) {
            await tx.scheduleSlot.create({
              data: {
                from: slot.from,
                to: slot.to,
                venueId: venueId,
                availableVenueId: venueAvailability.id,
              },
            });
          }
        }
      }

      // get updated venue with all relations
      const finalVenue = await tx.venue.findUnique({
        where: {
          id: venueId,
        },
        include: {
          venueAvailabilities: {
            include: {
              scheduleSlots: true,
            },
          },
          scheduleSlots: true,
        },
      });

      return finalVenue;
    },
    {
      timeout: 30000,
    }
  );

  return result;
};

export const VenueService = {
  createVenue,
  getAllVenues,
  getAllMyVenues,
  updateVenue,
};
