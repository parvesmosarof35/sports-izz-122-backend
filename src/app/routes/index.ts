import express from "express";

import { authRoutes } from "../modules/Auth/auth.routes";
// import { subscriptionRoute } from "../modules/subscriptions/subscriptions.route";
import { userRoute } from "../modules/User/user.route";
import { privacyPolicyRoute } from "../modules/Privacy_Policy/policy.route";
import { reviewRoute } from "../modules/Review/review.route";
import { notificationsRoute } from "../modules/Notification/notification.route";
import { settingRoute } from "../modules/Setting/setting.route";
import { termsConditionRoute } from "../modules/Terms_Condition/terms.route";
import { messageRoutes } from "../modules/Message/message.route";
import { paymentRoutes } from "../modules/Payment/payment.route";
import { supportRoutes } from "../modules/Support/support.route";
import { faqRoutes } from "../modules/Faq/faq.routre";
import { venueRoute } from "../modules/Venue/venue.route";
import { sportsTypeRoute } from "../modules/SportsType/sportsType.route";
import { venueBookingRoutes } from "../modules/Venue_Booking/venueBooking.route";
import { gamificationRoute } from "../modules/Gamification/gamification.route";
import { levelRoute } from "../modules/Gamification/level.route";
import { statisticsRoutes } from "../modules/Statistics/statistics.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/venues",
    route: venueRoute,
  },
  {
    path: "/venue-bookings",
    route: venueBookingRoutes,
  },
  {
    path: "/sports-types",
    route: sportsTypeRoute,
  },

  {
    path: "/reviews",
    route: reviewRoute,
  },

  {
    path: "/notifications",
    route: notificationsRoute,
  },
  {
    path: "/faqs",
    route: faqRoutes,
  },
  {
    path: "/terms-conditions",
    route: termsConditionRoute,
  },
  {
    path: "/policy",
    route: privacyPolicyRoute,
  },
  {
    path: "/settings",
    route: settingRoute,
  },

  {
    path: "/messages",
    route: messageRoutes,
  },
  {
    path: "/payments",
    route: paymentRoutes,
  },
  {
    path: "/supports",
    route: supportRoutes,
  },
  {
    path: "/gamification",
    route: gamificationRoute,
  },
  {
    path: "/gamification/level",
    route: levelRoute,
  },
  {
    path: "/statistics",
    route: statisticsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
