import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { PaymentService } from "./payment.sercice";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import Stripe from "stripe";

// checkout session on stripe
const createStripePaymentIntent = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { serviceType, bookingId } = req.params;
    const { description, country } = req.body;

    const result = await PaymentService.createStripePaymentIntent(
      userId,
      bookingId,
      description,
      country,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Checkout session created successfully",
      data: result,
    });
  },
);


// stripe cancel booking
const cancelStripeBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user?.id;

  const result = await PaymentService.cancelStripeBooking(bookingId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const PaymentController = {
  createStripePaymentIntent,
  cancelStripeBooking,
};
