import { Weekday } from "@prisma/client";

// convert day string to Weekday enum
export const dayToWeekdayEnum: { [key: string]: Weekday } = {
  Monday: Weekday.MONDAY,
  Tuesday: Weekday.TUESDAY,
  Wednesday: Weekday.WEDNESDAY,
  Thursday: Weekday.THURSDAY,
  Friday: Weekday.FRIDAY,
  Saturday: Weekday.SATURDAY,
  Sunday: Weekday.SUNDAY,
};

export const filterField: string[] = [
  "searchTerm",
  "venueName",
  "sportsType",
  "minPrice",
  "maxPrice",
  "capacity",
  "location",
  "venueStatus",
];

export const searchableFields: string[] = [
  "venueName",
  "sportsType",
  "location",
];

export const numericFields = ["pricePerHour"];
