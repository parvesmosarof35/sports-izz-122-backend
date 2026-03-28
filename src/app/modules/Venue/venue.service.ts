import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import {
  dayToWeekdayEnum,
  // numericFields,
  searchableFields,
} from "./venue.constant";
import { IVenue, IVenueFilterRequest, IVenuePayload } from "./venue.interface";
import { Prisma, Weekday } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { getCoordinatesFromAddress, calculateDistanceInKm } from "../../../helpars/geocode";

// create venue
const createVenue = async (vendorId: string, payload: IVenuePayload) => {
  // get coordinates from location if not provided
  if (payload.location && (payload.latitude === undefined || payload.longitude === undefined)) {
    const coords = await getCoordinatesFromAddress(payload.location);
    if (coords) {
      payload.latitude = coords.latitude;
      payload.longitude = coords.longitude;
    }
  }

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
    },
  );

  return result;
};

// get all venues
const getAllVenues = async (
  params: IVenueFilterRequest,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { searchTerm, minPrice, maxPrice, ...filterData } = params;

  // convert string to number for price filters
  const minPriceNum = minPrice ? Number(minPrice) : undefined;
  const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;

  const filters: Prisma.VenueWhereInput[] = [];

  // text search
  if (params?.searchTerm) {
    filters.push({
      OR: searchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // price range filter
  if (minPriceNum !== undefined || maxPriceNum !== undefined) {
    const priceFilter: any = {};
    if (minPriceNum !== undefined) priceFilter.gte = minPriceNum;
    if (maxPriceNum !== undefined) priceFilter.lte = maxPriceNum;

    filters.push({
      pricePerHour: priceFilter,
    });
  }

  // exact match filter
  if (Object.keys(filterData).length > 0) {
    filters.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const where: Prisma.VenueWhereInput = {
    AND: filters,
  };

  const result = await prisma.venue.findMany({
    where,
    include: {
      venueAvailabilities: {
        include: {
          scheduleSlots: true,
        },
      },
      reviews: true,
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

  const total = await prisma.venue.count({
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

// get all nearby venues
const getAllNearbyVenues = async (
  params: IVenueFilterRequest,
  options: IPaginationOptions,
  locationParams: any
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { searchTerm, minPrice, maxPrice, ...filterData } = params;

  // convert string to number for price filters
  const minPriceNum = minPrice ? Number(minPrice) : undefined;
  const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;

  const filters: Prisma.VenueWhereInput[] = [];

  // text search
  if (params?.searchTerm) {
    filters.push({
      OR: searchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // price range filter
  if (minPriceNum !== undefined || maxPriceNum !== undefined) {
    const priceFilter: any = {};
    if (minPriceNum !== undefined) priceFilter.gte = minPriceNum;
    if (maxPriceNum !== undefined) priceFilter.lte = maxPriceNum;

    filters.push({
      pricePerHour: priceFilter,
    });
  }

  // exact match filter
  if (Object.keys(filterData).length > 0) {
    filters.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const where: Prisma.VenueWhereInput = {
    AND: filters,
  };

  const result = await prisma.venue.findMany({
    where,
    include: {
      venueAvailabilities: {
        include: {
          scheduleSlots: true,
        },
      },
      reviews: true,
    },
  });

  const userLat = Number(locationParams.userslatitude);
  const userLon = Number(locationParams.userslongitude);

  const venuesWithDistance = result.map((venue: any) => {
    let distance = Number.MAX_VALUE;
    if (venue.latitude !== null && venue.longitude !== null && !isNaN(userLat) && !isNaN(userLon)) {
      distance = calculateDistanceInKm(userLat, userLon, venue.latitude, venue.longitude);
    }
    return { ...venue, distance };
  });

  // sort by distance ascending
  venuesWithDistance.sort((a, b) => a.distance - b.distance);

  const paginatedData = venuesWithDistance.slice(skip, skip + limit);

  return {
    meta: {
      total: venuesWithDistance.length,
      page,
      limit,
    },
    data: paginatedData,
  };
};

// get venue group by SportsType
const getVenueGroupBySportsType = async (
  params: IVenueFilterRequest,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { searchTerm, minPrice, maxPrice, ...filterData } = params;

  // convert string to number for price filters
  const minPriceNum = minPrice ? Number(minPrice) : undefined;
  const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;

  const filters: Prisma.VenueWhereInput[] = [];

  // text search
  if (params?.searchTerm) {
    filters.push({
      OR: searchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // price range filter
  if (minPriceNum !== undefined || maxPriceNum !== undefined) {
    const priceFilter: any = {};
    if (minPriceNum !== undefined) priceFilter.gte = minPriceNum;
    if (maxPriceNum !== undefined) priceFilter.lte = maxPriceNum;

    filters.push({
      pricePerHour: priceFilter,
    });
  }

  // exact match filter
  if (Object.keys(filterData).length > 0) {
    filters.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const where: Prisma.VenueWhereInput = {
    AND: filters,
  };

  const venues = await prisma.venue.findMany({
    where,
    include: {
      venueAvailabilities: {
        include: {
          scheduleSlots: true,
        },
      },
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

  // get all sports types to map sports images
  const sportsTypes = await prisma.sportType.findMany({
    select: {
      sportName: true,
      sportsImage: true,
    },
  });

  // create a map for quick lookup
  const sportsTypeMap = sportsTypes.reduce((acc: any, sport) => {
    acc[sport.sportName.toUpperCase()] = sport.sportsImage;
    return acc;
  }, {});

  // group venues by sportsType
  const groupedData = venues.reduce((acc: any, venue) => {
    const sportsType = venue.sportsType;
    if (!acc[sportsType]) {
      acc[sportsType] = {
        sportsType,
        venues: [],
        count: 0,
        sportsImage: sportsTypeMap[sportsType.toUpperCase()] || null,
      };
    }
    acc[sportsType].venues.push(venue);
    acc[sportsType].count += 1;
    return acc;
  }, {});

  // convert to array and apply pagination
  const groupedArray = Object.values(groupedData);
  const total = groupedArray.length;
  const paginatedData = groupedArray.slice(skip, skip + limit);

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: paginatedData,
  };
};

// get all my venues
const getAllMyVenues = async (
  vendorId: string,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const result = await prisma.venue.findMany({
    where: {
      vendorId,
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
    include: {
      venueAvailabilities: {
        include: {
          scheduleSlots: true,
        },
      },
    },
  });

  const total = await prisma.venue.count({
    where: {
      vendorId,
    },
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

// get single venue
const getSingleVenue = async (venueId: string) => {
  const result = await prisma.venue.findFirst({
    where: {
      id: venueId,
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
  },
) => {
  // check if venue exists vendor
  const existingVenue = await prisma.venue.findFirst({
    where: {
      id: venueId,
      vendorId: vendorId,
    },
  });

  if (!existingVenue) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Venue not found or you don't have permission to update it",
    );
  }

  // process courtNumbers if provided
  const processedPayload = {
    ...payload,
    courtNumbers: payload.courtNumbers
      ? Array.isArray(payload.courtNumbers)
        ? payload.courtNumbers
        : Array.from(
            { length: parseInt(String(payload.courtNumbers)) },
            (_, i) => i + 1,
          )
      : undefined,
    // Parse string values to proper types
    pricePerHour: payload.pricePerHour
      ? parseFloat(String(payload.pricePerHour))
      : undefined,
    capacity: payload.capacity ? parseInt(String(payload.capacity)) : undefined,
    venueStatus: payload.venueStatus
      ? String(payload.venueStatus) === "true"
      : undefined,
    latitude: payload.latitude ? parseFloat(String(payload.latitude)) : undefined,
    longitude: payload.longitude ? parseFloat(String(payload.longitude)) : undefined,
  };

  // separate time slots from basic venue data
  const { scheduleSlots, venueAvailabilities, ...updateData } =
    processedPayload;

  if (updateData.location && (updateData.latitude === undefined || updateData.longitude === undefined)) {
    const coords = await getCoordinatesFromAddress(updateData.location);
    if (coords) {
      updateData.latitude = coords.latitude;
      updateData.longitude = coords.longitude;
    }
  }

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
    latitude: updateData.latitude,
    longitude: updateData.longitude,
  };

  // filter out undefined values
  const filteredUpdateData = Object.fromEntries(
    Object.entries(validVenueFields).filter(
      ([_, value]) => value !== undefined,
    ),
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
        // Delete all existing availabilities and their slots for this venue
        // First delete slots associated with availabilities
        const existingAvailabilities = await tx.venueAvailability.findMany({
          where: { venueId: venueId },
          select: { id: true },
        });

        const availabilityIds = existingAvailabilities.map((a) => a.id);

        if (availabilityIds.length > 0) {
          await tx.scheduleSlot.deleteMany({
            where: {
              availableVenueId: { in: availabilityIds },
            },
          });
        }

        // Then delete the availabilities themselves
        await tx.venueAvailability.deleteMany({
          where: { venueId: venueId },
        });

        // Create new availabilities and slots
        for (const availability of venueAvailabilities) {
          const dayEnum = dayToWeekdayEnum[availability.day] || Weekday.MONDAY;
          const venueAvailability = await tx.venueAvailability.create({
            data: {
              day: dayEnum,
              venueId: venueId,
            },
          });

          if (availability.scheduleSlots && availability.scheduleSlots.length > 0) {
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
    },
  );

  return result;
};

// delete venue
const deleteVenue = async (vendorId: string, venueId: string) => {
  // find venue
  const venue = await prisma.venue.findUnique({
    where: {
      id: venueId,
      vendorId,
    },
  });

  if (!venue) {
    throw new ApiError(httpStatus.NOT_FOUND, "Venue not found!");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      // delete all schedule slots
      await tx.scheduleSlot.deleteMany({
        where: {
          venueId: venueId,
        },
      });

      // delete all venue availabilities
      await tx.venueAvailability.deleteMany({
        where: {
          venueId: venueId,
        },
      });

      // delete the venue
      const deletedVenue = await tx.venue.delete({
        where: {
          id: venueId,
          vendorId,
        },
      });

      return deletedVenue;
    },
    {
      timeout: 30000,
    },
  );

  return result;
};

export const VenueService = {
  createVenue,
  getAllVenues,
  getAllNearbyVenues,
  getVenueGroupBySportsType,
  getAllMyVenues,
  getSingleVenue,
  updateVenue,
  deleteVenue,
};
