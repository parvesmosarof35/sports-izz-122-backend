import { SportsType } from "@prisma/client";

export interface IVenue {
  venueName: string;
  sportsType: SportsType;
  pricePerHour: number;
  capacity: number;
  location: string;
  description: string;
  venueImage: string;
  amenities: Array<{ amenityName: string; /**amenityImage: string  */}>;
  courtNumbers: number | number[];
  venueStatus?: boolean;
}

export interface IVenuePayload extends IVenue {
  venueStatus?: boolean;
  scheduleSlots?: Array<{
    from: string;
    to: string;
  }>;
  venueAvailabilities?: Array<{
    day: string;
    scheduleSlots: Array<{
      from: string;
      to: string;
    }>;
  }>;
}

export interface IVenueWithSlots extends IVenue {
  scheduleSlots: Array<{
    id: string;
    from: string;
    to: string;
  }>;
}
