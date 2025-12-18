import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { VenueBookingService } from "./venueBooking.service";
import { VenueBookingValidation } from "./venueBooking.validation";
import { pick } from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { filterField } from "./venueBooking.constant";

// create venue booking
const createVenueBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const venueId = req.params.venueId;
  const payload = req.body;

  const result = await VenueBookingService.createVenueBooking(
    userId,
    venueId,
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Venue booking created successfully!",
    data: result,
  });
});

// get all specific user bookings
const getMyVenueBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const filters = pick(req.query, filterField);
  const options = pick(req.query, paginationFields);

  const result = await VenueBookingService.getMyVenueBookings(
    userId,
    filters,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My venue bookings retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

// get all specific vender bookings
const getVendorVenueBookings = catchAsync(
  async (req: Request, res: Response) => {
    const vendorId = req.user?.id;
    const filters = pick(req.query, filterField);
    const options = pick(req.query, paginationFields);

    const result = await VenueBookingService.getVendorVenueBookings(
      vendorId,
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Vendor venue bookings retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

// get single venue booking
const getSingleVenueBooking = catchAsync(
  async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId;

    const result = await VenueBookingService.getSingleVenueBooking(bookingId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Venue booking retrieved successfully!",
      data: result,
    });
  }
);

// update venue booking
const updateVenueBooking = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const payload = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  let result;
  if (userRole === "ADMIN") {
    result = await VenueBookingService.updateVenueBooking(bookingId, payload);
  } else if (userRole === "VENDOR") {
    result = await VenueBookingService.updateVenueBooking(
      bookingId,
      payload,
      undefined,
      userId
    );
  } else {
    result = await VenueBookingService.updateVenueBooking(
      bookingId,
      payload,
      userId
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venue booking updated successfully!",
    data: result,
  });
});


// delete venue booking (admin only)
const deleteVenueBooking = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  const result = await VenueBookingService.deleteVenueBooking(bookingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venue booking deleted successfully!",
    data: result,
  });
});

export const VenueBookingController = {
  createVenueBooking,
  getMyVenueBookings,
  getVendorVenueBookings,
  getSingleVenueBooking,
  updateVenueBooking,
  deleteVenueBooking,
};
