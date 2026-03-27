import cron from "node-cron";
import prisma from "../../shared/prisma";
import { BookingStatus } from "@prisma/client";

/**
 * Cleanup cancelled bookings that are older than 2 months
 * Runs every day at midnight (00:00)
 */
const startBookingCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("🧹 Running scheduled job: Hard deleting old CANCELLED bookings...");

    try {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const result = await prisma.venue_booking.deleteMany({
        where: {
          bookingStatus: BookingStatus.CANCELLED,
          updatedAt: {
            lte: twoMonthsAgo,
          },
        },
      });

      if (result.count > 0) {
        console.log(`✅ Successfully hard deleted ${result.count} old cancelled bookings.`);
      } else {
        console.log("ℹ️ No old cancelled bookings found for cleanup.");
      }
    } catch (error) {
      console.error("❌ Error during booking cleanup scheduled job:", error);
    }
  });
};

export const CronJobs = {
  startBookingCleanupJob,
};
