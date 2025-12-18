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

// User routes
router.get(
  "/my-bookings",
  auth(UserRole.USER),
  VenueBookingController.getMyVenueBookings
);

// Vendor routes
router.get(
  "/vendor-bookings",
  auth(UserRole.VENDOR),
  VenueBookingController.getVendorVenueBookings
);

// Admin routes
router.get(
  "/",
  auth(UserRole.ADMIN),
  VenueBookingController.getAllVenueBookings
);

// Common routes (with role-based access control)
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

router.patch(
  "/:bookingId/cancel",
  auth(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN),
  VenueBookingController.cancelVenueBooking
);

router.delete(
  "/:bookingId",
  auth(UserRole.ADMIN),
  VenueBookingController.deleteVenueBooking
);

export const venueBookingRoutes = router;
