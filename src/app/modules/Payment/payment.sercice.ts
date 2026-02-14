import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import {
  BookingStatus,
  EveryServiceStatus,
  PaymentStatus,
} from "@prisma/client";
import config from "../../../config";
import Stripe from "stripe";
import { serviceConfig, ServiceType } from "./Stripe/stripe";
import axios from "axios";
import {
  BookingNotificationService,
  IBookingNotificationData,
  ServiceTypes,
} from "../../../shared/notificationService";
import * as crypto from "crypto";

const callback_url = "https://paystack.com/pay";
const payStackBaseUrl = "https://api.paystack.co";
const headers = {
  Authorization: `Bearer ${config.toyyibpay.toyyibpay_secret_key}`,
  "Content-Type": "application/json",
};

// checkout session on stripe
const createStripePaymentIntent = async (
  userId: string,
  bookingId: string,
  description: string,
  country: string,
) => {};

// cancel booking service stripe
const cancelStripeBooking = async (bookingId: string, userId: string) => {};

export const PaymentService = {
  createStripePaymentIntent,
  cancelStripeBooking,
};
