export type SportsType = "BASKETBALL" | "FOOTBALL" | "TENNIS" | "PICKLEBALL" | "SWIMMING" | "RUGBY" | "PLIATES" | "TAKRAW" | "CRICKET" | "BADMINTON";

export interface IVenue {
  venueName: string;
  sportsType: SportsType;
  pricePerHour: number;
  capacity: number;
  location: string;
  description: string;
  venueImage: string;
  amenities?: Array<{ amenityName: string; amenityImage: string }>;
  courtNumbers?: number | number[];
}

export interface IVenuePayload extends IVenue {
  venueStatus?: boolean;
}