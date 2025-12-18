import { BookingStatus } from "@prisma/client";

export type IVenueBookingFilterRequest = {
  filter?: string | undefined;
  sportsType?: string | undefined;
};

export interface IVenueBooking {
  //   venueId: string;
  date: string;
  day: string;
  timeSlot: {
    from: string;
    to: string;
  };
  sportsType: string;
  totalPrice: number;
}

export interface IVenueBookingPayload extends IVenueBooking {
  checkoutSessionId?: string;
}

export interface IVenueBookingUpdate {
  bookingStatus?: BookingStatus;
  totalPrice?: number;
}

export interface IVenueBookingWithRelations extends IVenueBooking {
  id: string;
  checkoutSessionId?: string;
  bookingStatus: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  vendorId: string;
  venueId: string;
  venue?: any;
  user?: any;
  payments?: any[];
}
