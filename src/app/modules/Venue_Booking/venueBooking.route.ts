import { Router } from "express";
import { VenueBookingController } from "./venueBooking.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { VenueBookingValidation } from "./venueBooking.validation";

const router = Router();

// create venue booking
router.post(
  "/:venueId",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER, UserRole.VENDOR),
  validateRequest(VenueBookingValidation.createVenueBookingValidation),
  VenueBookingController.createVenueBooking
);

// get all specific user bookings
router.get(
  "/specific-user-bookings",
  auth(UserRole.USER),
  VenueBookingController.getMyVenueBookings
);

// get all specific vender bookings
router.get(
  "/specific-vendor-bookings",
  auth(UserRole.VENDOR),
  VenueBookingController.getVendorVenueBookings
);

// get single venue booking
router.get(
  "/:bookingId",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN),
  VenueBookingController.getSingleVenueBooking
);

router.patch(
  "/:bookingId",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN),
  VenueBookingController.updateVenueBooking
);

router.post(
  "/:bookingId/accept",
  auth(UserRole.VENDOR),
  VenueBookingController.acceptBooking
);

router.post(
  "/:bookingId/reject",
  auth(UserRole.VENDOR),
  VenueBookingController.rejectBooking
);

router.delete(
  "/:bookingId",
  auth(UserRole.ADMIN),
  VenueBookingController.deleteVenueBooking
);

export const venueBookingRoutes = router;
