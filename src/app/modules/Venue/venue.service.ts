import prisma from "../../../shared/prisma";
import { IVenuePayload } from "./venue.interface";

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
          // venue availability with proper date parsing
          const dayMap: { [key: string]: number } = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
          };

          const dayOfWeek = dayMap[availability.day];
          const today = new Date();
          const currentDayOfWeek = today.getDay();
          const daysUntilTarget = (dayOfWeek - currentDayOfWeek + 7) % 7;
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + daysUntilTarget);

          const venueAvailability = await tx.venueAvailability.create({
            data: {
              day: targetDate,
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
      timeout: 10000,
    }
  );

  return result;
};

// create venue
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

export const VenueService = { createVenue, getAllVenues };
