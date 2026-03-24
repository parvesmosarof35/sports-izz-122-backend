export type IVenueFilterRequest = {
  searchTerm?: string | undefined;
  venueName?: string | undefined;
  sportsType?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  capacity?: number | undefined;
  location?: string | undefined;
  venueStatus?: boolean;
};

export interface IVenue {
  venueName: string;
  sportsType: string;
  pricePerHour: number;
  capacity: number;
  location: string;
  description: string;
  venueImage: string;
  amenities: Array<{ amenityName: string /**amenityImage: string  */ }>;
  courtNumbers: number | number[];
  venueStatus?: boolean;
  latitude?: number;
  longitude?: number;
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
