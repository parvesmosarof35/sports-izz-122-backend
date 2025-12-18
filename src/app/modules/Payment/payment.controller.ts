import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { PaymentService } from "./payment.sercice";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import stripe from "../../../helpars/stripe";
import Stripe from "stripe";

// stripe account onboarding
const stripeAccountOnboarding = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await PaymentService.stripeAccountOnboarding(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Stripe account onboarding successfully",
      data: result,
    });
  }
);

// checkout session on stripe
const createStripePaymentIntent = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { serviceType, bookingId } = req.params;
    const { description, country } = req.body;

    const normalizedServiceType = serviceType.toUpperCase() as
      | "CAR"
      | "HOTEL"
      | "SECURITY"
      | "ATTRACTION";

    const result = await PaymentService.createStripePaymentIntent(
      userId,
      normalizedServiceType,
      bookingId,
      description,
      country
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Checkout session created successfully",
      data: result,
    });
  }
);

// stripe webhook payment
const stripeHandleWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  if (!sig) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing stripe signature", "");
  }

  let event: Stripe.Event;

  try {
    if (!req.rawBody) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Raw body not available", "");
    }

    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      config.stripe.webhookSecret as string
    );
  } catch (err: any) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook Error: ${err.message}`,
      ""
    );
  }

  const result = await PaymentService.stripeHandleWebhook(event);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe webhook payment successfully",
    data: result,
  });
});

// stripe cancel booking
const cancelStripeBooking = catchAsync(async (req, res) => {
  const { serviceType, bookingId } = req.params;
  const userId = req.user?.id;

  const result = await PaymentService.cancelStripeBooking(
    serviceType,
    bookingId,
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

// ------------------------------ website payment ------------------------------
// checkout session on stripe
const createStripePaymentIntentWebsite = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { serviceType, bookingId } = req.params;
    const { description, country } = req.body;

    const normalizedServiceType = serviceType.toUpperCase() as
      | "CAR"
      | "HOTEL"
      | "SECURITY"
      | "ATTRACTION";

    const result = await PaymentService.createStripePaymentIntentWebsite(
      userId,
      normalizedServiceType,
      bookingId,
      description,
      country
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Checkout session created successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  stripeAccountOnboarding,
  createStripePaymentIntent,
  stripeHandleWebhook,
  cancelStripeBooking,
  createStripePaymentIntentWebsite,
};
