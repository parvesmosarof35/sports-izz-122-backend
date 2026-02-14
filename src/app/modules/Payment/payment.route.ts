import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// checkout session on stripe
router.post(
  "/create-payment-intent/:bookingId",
  auth(UserRole.USER, UserRole.VENDOR),
  PaymentController.createStripePaymentIntent,
);

// cancel booking stripe
router.post(
  "/stripe-cancel-booking/:bookingId",
  auth(UserRole.USER, UserRole.VENDOR),
  PaymentController.cancelStripeBooking,
);

export const paymentRoutes = router;
