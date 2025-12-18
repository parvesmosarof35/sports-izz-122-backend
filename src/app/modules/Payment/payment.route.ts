import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// ------------------------------stripe routes-----------------------------
// stripe account onboarding
router.post(
  "/stripe-account-onboarding",
  auth(UserRole.USER, UserRole.VENDOR),
  PaymentController.stripeAccountOnboarding
);

// checkout session on stripe
router.post(
  "/create-payment-intent/:serviceType/:bookingId",
  auth(UserRole.USER, UserRole.VENDOR),
  PaymentController.createStripePaymentIntent
);

// stripe webhook payment
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }), // important: keep raw body
  PaymentController.stripeHandleWebhook
);

// cancel booking stripe
router.post(
  "/stripe-cancel-booking/:serviceType/:bookingId",
  auth(UserRole.USER, UserRole.VENDOR),
  PaymentController.cancelStripeBooking
);

// ------------------------------ website payment -----------------------------
// checkout session on stripe
router.post(
  "/create-payment-intent-website/:serviceType/:bookingId",
  auth(UserRole.USER, UserRole.VENDOR),
  PaymentController.createStripePaymentIntentWebsite
);

export const paymentRoutes = router;
