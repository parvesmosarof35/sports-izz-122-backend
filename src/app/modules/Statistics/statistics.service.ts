import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IFilterRequest } from "./statistics.interface";
import { getDateRange } from "../../../helpars/filterByDate";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

// get overview total clients, total venues,total booking and total revenue
const getOverview = async (params: IFilterRequest) => {
  const { timeRange, year } = params;
  const dateRange = getDateRange(timeRange);

  // total users
  const totalUsers = await prisma.user.count({
    where: {
      role: UserRole.USER,
      // ...(dateRange ? { createdAt: dateRange } : {}),
    },
  });

  // total venues
  const totalVenues = await prisma.venue.count();

  // total bookings
  const totalBookings = await prisma.venue_booking.count({
    where: {
      bookingStatus: BookingStatus.CONFIRMED,
      // ...(dateRange ? { createdAt: dateRange } : {}),
    },
  });

  // admin earnings (only PAID payments)
  const adminEarnings = await prisma.payment.aggregate({
    where: {
      status: {
        in: [PaymentStatus.PAID],
      },
    },
    _sum: {
      amount: true,
    },
  });

  // user chart data - monthly user registration with year filter
  const filterYear = year ? parseInt(year) : new Date().getFullYear();
  const startOfYear = new Date(filterYear, 0, 1); // january 1st of selected year
  const endOfYear = new Date(filterYear, 11, 31, 23, 59, 59); // december 31st of selected year

  const userChartData = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // group users by month for chart (all 12 months)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const userChart = monthNames.map((month, index) => {
    const monthUsers = userChartData.filter((user) => {
      const userDate = new Date(user.createdAt);
      return (
        userDate.getMonth() === index && userDate.getFullYear() === filterYear
      );
    });

    return {
      month,
      count: monthUsers.length,
    };
  });

  // recent users - last 5 users
  const recentUsers = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      profileImage: true,
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return {
    totalUsers,
    totalVenues,
    totalBookings,
    adminEarnings: adminEarnings._sum.amount || 0,
    userChart,
    recentUsers,
    filterYear,
  };
};

// // property owner total earnings hotel
// const getPartnerTotalEarningsHotel = async (
//   partnerId: string,
//   timeRange?: string
// ) => {
//   // find partner
//   const partner = await prisma.user.findUnique({
//     where: {
//       id: partnerId,
//     },
//   });
//   if (!partner) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
//   }

//   // date range filter
//   const dateRange = getDateRange(timeRange);

//   // total earnings
//   const earnings = await prisma.payment.aggregate({
//     where: {
//       partnerId: partnerId,
//       status: PaymentStatus.PAID,
//       serviceType: "HOTEL",
//       ...(dateRange && { createdAt: dateRange }),
//     },
//     _sum: {
//       amount: true,
//     },
//     _count: {
//       id: true,
//     },
//   });

//   // total bookings
//   const totalBookings = await prisma.hotel_Booking.count({
//     where: {
//       partnerId: partnerId,
//       bookingStatus: BookingStatus.CONFIRMED,
//       ...(dateRange && { createdAt: dateRange }),
//     },
//   });

//   // earnings trend - monthly data
//   const monthlyPayments = await prisma.payment.findMany({
//     where: {
//       partnerId,
//       status: PaymentStatus.PAID,
//       serviceType: "HOTEL",
//       ...(dateRange && { createdAt: dateRange }),
//     },
//     select: {
//       amount: true,
//       createdAt: true,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//   });

//   // bookings trend - monthly data
//   const monthlyBookings = await prisma.hotel_Booking.findMany({
//     where: {
//       partnerId,
//       bookingStatus: BookingStatus.CONFIRMED,
//       ...(dateRange && { createdAt: dateRange }),
//     },
//     select: {
//       createdAt: true,
//       totalPrice: true,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//   });

//   // group earnings by month
//   const earningsByMonth = monthlyPayments.reduce((acc: any, payment) => {
//     const monthKey = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
//     if (!acc[monthKey]) {
//       acc[monthKey] = { month: monthKey, earnings: 0, count: 0 };
//     }
//     acc[monthKey].earnings += payment.amount;
//     acc[monthKey].count += 1;
//     return acc;
//   }, {});

//   // group bookings by month
//   const bookingsByMonth = monthlyBookings.reduce((acc: any, booking) => {
//     const monthKey = booking.createdAt.toISOString().slice(0, 7); // YYYY-MM
//     if (!acc[monthKey]) {
//       acc[monthKey] = { month: monthKey, bookings: 0, revenue: 0 };
//     }
//     acc[monthKey].bookings += 1;
//     acc[monthKey].revenue += booking.totalPrice;
//     return acc;
//   }, {});

//   // get current year
//   const currentYear = new Date().getFullYear();

//   // create proper month mapping
//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   // generate all months from January to December for current year
//   const allMonths = [];
//   for (let i = 0; i < 12; i++) {
//     const monthKey = `${currentYear}-${String(i + 1).padStart(2, "0")}`; // YYYY-MM format
//     const monthName = monthNames[i];

//     allMonths.push({
//       month: monthKey,
//       monthName: monthName,
//       earnings: earningsByMonth[monthKey]?.earnings || 0,
//       count: earningsByMonth[monthKey]?.count || 0,
//       bookings: bookingsByMonth[monthKey]?.bookings || 0,
//       revenue: bookingsByMonth[monthKey]?.revenue || 0,
//     });
//   }

//   // check if we have data for previous December and add it if needed
//   const prevDecemberKey = `${currentYear - 1}-12`;

//   if (earningsByMonth[prevDecemberKey] || bookingsByMonth[prevDecemberKey]) {
//     // replace December (index 11) with previous December data
//     allMonths[11] = {
//       month: prevDecemberKey,
//       monthName: "December",
//       earnings: earningsByMonth[prevDecemberKey]?.earnings || 0,
//       count: earningsByMonth[prevDecemberKey]?.count || 0,
//       bookings: bookingsByMonth[prevDecemberKey]?.bookings || 0,
//       revenue: bookingsByMonth[prevDecemberKey]?.revenue || 0,
//     };
//   }

//   // separate earnings and bookings trends
//   const earningsTrend = allMonths.map(
//     ({ month, monthName, earnings, count }) => ({
//       month,
//       monthName,
//       earnings,
//       count,
//     })
//   );

//   const bookingsTrend = allMonths.map(
//     ({ month, monthName, bookings, revenue }) => ({
//       month,
//       monthName,
//       bookings,
//       revenue,
//     })
//   );

//   return {
//     totalEarnings: earnings._sum.amount || 0,
//     // totalPayments: earnings._count.id || 0,
//     totalBookings,
//     earningsTrend,
//     bookingsTrend,
//     timeRange: timeRange || "ALL_TIME",
//   };
// };

// // service provider total earnings service
// const getServiceProviderTotalEarningsService = async (
//   providerId: string,
//   timeRange?: string
// ) => {
//   // find partner
//   const partner = await prisma.user.findUnique({
//     where: {
//       id: providerId,
//     },
//   });
//   if (!partner) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
//   }

//   // date range filter
//   const dateRange = getDateRange(timeRange);

//   // total earnings
//   const earnings = await prisma.payment.aggregate({
//     where: {
//       vendorId,
//       status: PaymentStatus.PAID,
//       serviceType: "SERVICE",
//       ...(dateRange && { createdAt: dateRange }),
//     },
//     _sum: {
//       amount: true,
//     },
//     _count: {
//       id: true,
//     },
//   });


//   // total bookings
//   const totalBookings = await prisma.venue_booking.count({
//     where: {
//       vendorId: providerId,
//       bookingStatus: BookingStatus.CONFIRMED,
//       ...(dateRange && { createdAt: dateRange }),
//     },
//   });

//   // earnings trend - monthly data
//   const monthlyPayments = await prisma.payment.findMany({
//     where: {
//       vendorId,
//       status: PaymentStatus.PAID,
//       serviceType: "SERVICE",
//       ...(dateRange && { createdAt: dateRange }),
//     },
//     select: {
//       amount: true,
//       createdAt: true,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//   });

//   // bookings trend - monthly data
//   const monthlyBookings = await prisma.venue_booking.findMany({
//     where: {
//       providerId,
//       bookingStatus: BookingStatus.CONFIRMED,
//       ...(dateRange && { createdAt: dateRange }),
//     },
//     select: {
//       createdAt: true,
//       totalPrice: true,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//   });

//   // group earnings by month
//   const earningsByMonth = monthlyPayments.reduce((acc: any, payment) => {
//     const monthKey = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
//     if (!acc[monthKey]) {
//       acc[monthKey] = { month: monthKey, earnings: 0, count: 0 };
//     }
//     acc[monthKey].earnings += payment.amount;
//     acc[monthKey].count += 1;
//     return acc;
//   }, {});

//   // group bookings by month
//   const bookingsByMonth = monthlyBookings.reduce((acc: any, booking) => {
//     const monthKey = booking.createdAt.toISOString().slice(0, 7); // YYYY-MM
//     if (!acc[monthKey]) {
//       acc[monthKey] = { month: monthKey, bookings: 0, revenue: 0 };
//     }
//     acc[monthKey].bookings += 1;
//     acc[monthKey].revenue += booking.totalPrice;
//     return acc;
//   }, {});

//   // get current year
//   const currentYear = new Date().getFullYear();

//   // create proper month mapping
//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   // generate all months from January to December for current year
//   const allMonths = [];
//   for (let i = 0; i < 12; i++) {
//     const monthKey = `${currentYear}-${String(i + 1).padStart(2, "0")}`; // YYYY-MM format
//     const monthName = monthNames[i];

//     allMonths.push({
//       month: monthKey,
//       monthName: monthName,
//       earnings: earningsByMonth[monthKey]?.earnings || 0,
//       count: earningsByMonth[monthKey]?.count || 0,
//       bookings: bookingsByMonth[monthKey]?.bookings || 0,
//       revenue: bookingsByMonth[monthKey]?.revenue || 0,
//     });
//   }

//   // check if we have data for previous December and add it if needed
//   const prevDecemberKey = `${currentYear - 1}-12`;

//   if (earningsByMonth[prevDecemberKey] || bookingsByMonth[prevDecemberKey]) {
//     // replace December (index 11) with previous December data
//     allMonths[11] = {
//       month: prevDecemberKey,
//       monthName: "December",
//       earnings: earningsByMonth[prevDecemberKey]?.earnings || 0,
//       count: earningsByMonth[prevDecemberKey]?.count || 0,
//       bookings: bookingsByMonth[prevDecemberKey]?.bookings || 0,
//       revenue: bookingsByMonth[prevDecemberKey]?.revenue || 0,
//     };
//   }

//   // separate earnings and bookings trends
//   const earningsTrend = allMonths.map(
//     ({ month, monthName, earnings, count }) => ({
//       month,
//       monthName,
//       earnings,
//       count,
//     })
//   );

//   const bookingsTrend = allMonths.map(
//     ({ month, monthName, bookings, revenue }) => ({
//       month,
//       monthName,
//       bookings,
//       revenue,
//     })
//   );

//   return {
//     totalEarnings: earnings._sum.amount || 0,
//     // totalPayments: earnings._count.id || 0,
//     totalBookings,
//     earningsTrend,
//     bookingsTrend,
//     timeRange: timeRange || "ALL_TIME",
//   };
// };

// // admin earns
// const getAdminTotalEarnings = async (timeRange?: string) => {
//   const dateRange = getDateRange(timeRange);

//   // all payments with date filtering
//   const payments = await prisma.payment.findMany({
//     where: {
//       status: {
//         in: [PaymentStatus.PAID, PaymentStatus.SUCCESS],
//       },
//       ...(dateRange && { createdAt: dateRange }),
//     },
//     select: {
//       amount: true,
//       createdAt: true,
//       status: true,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//   });

//   // all hotel bookings bookingStatus COMPLETED with date filtering
//   const hotelBookings = await prisma.hotel_Booking.count({
//     where: {
//       bookingStatus: "COMPLETED",
//       ...(dateRange && { createdAt: dateRange }),
//     },
//   });

//   // all service bookings bookingStatus COMPLETED with date filtering
//   const serviceBookings = await prisma.service_booking.count({
//     where: {
//       bookingStatus: "COMPLETED",
//       ...(dateRange && { createdAt: dateRange }),
//     },
//   });

//   // total COMPLETED bookings
//   const totalBookings = hotelBookings + serviceBookings;

//   // average per booking amount from PAID payments only
//   const paidPayments = payments.filter(
//     (payment) => payment.status === PaymentStatus.PAID
//   );
//   const averageEarnings =
//     totalBookings > 0 && paidPayments.length > 0
//       ? paidPayments.reduce((sum, payment) => sum + payment.amount, 0) /
//         paidPayments.length
//       : 0;

//   // get all hotel bookings
//   const allHotelBookings = await prisma.hotel_Booking.findMany({
//     where: {
//       bookingStatus: {
//         in: [
//           BookingStatus.CONFIRMED,
//           BookingStatus.CANCELLED,
//           BookingStatus.COMPLETED,
//         ],
//       },
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           fullName: true,
//           email: true,
//         },
//       },
//     },
//   });
//   // get all service bookings
//   const allServiceBookings = await prisma.service_booking.findMany({
//     where: {
//       bookingStatus: {
//         in: [
//           BookingStatus.CONFIRMED,
//           BookingStatus.CANCELLED,
//           BookingStatus.COMPLETED,
//         ],
//       },
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           fullName: true,
//           email: true,
//         },
//       },
//     },
//   });

//   // combine all bookings
//   const recentBookings = [
//     ...allHotelBookings.map((booking) => ({
//       ...booking,
//       type: "HOTEL",
//     })),
//     ...allServiceBookings.map((booking) => ({
//       ...booking,
//       type: "SERVICE",
//     })),
//   ].sort(
//     (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//   );

//   // group by month
//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const currentYear = new Date().getFullYear();

//   // all months with zero
//   const monthlyEarnings = monthNames.map((month, index) => {
//     const monthKey = `${currentYear}-${String(index + 1).padStart(2, "0")}`;

//     const monthPayments = payments.filter((payment) => {
//       const paymentDate = new Date(payment.createdAt);
//       return (
//         paymentDate.getMonth() === index &&
//         paymentDate.getFullYear() === currentYear
//       );
//     });

//     const totalEarnings = monthPayments.reduce(
//       (sum, payment) => sum + payment.amount,
//       0
//     );

//     return {
//       month,
//       monthKey,
//       earnings: totalEarnings,
//       count: monthPayments.length,
//     };
//   });

//   // calculate total earnings
//   const totalEarnings = payments.reduce(
//     (sum, payment) => sum + payment.amount,
//     0
//   );

//   return {
//     totalEarnings,
//     totalBookings,
//     averageEarnings,
//     monthlyEarnings,
//     recentBookings,
//     timeRange: timeRange || "ALL_TIME",
//   };
// };

// vendor total earnings and trends
const getVendorTotalEarningsAndTrends = async (
  vendorId: string,
  year?: string
) => {
  // if year filter is provided, use it, else current year
  const filterYear = year ? parseInt(year) : new Date().getFullYear();
  const startOfYear = new Date(filterYear, 0, 1);
  const endOfYear = new Date(filterYear, 11, 31, 23, 59, 59);

  // find vendor
  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
    },
  });
  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  // GETTING ALL PAID PAYMENTS
  const monthlyPayments = await prisma.payment.findMany({
    where: {
      venueBooking: {
        vendorId: vendorId,
      },
      status: PaymentStatus.PAID,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: {
      amount: true,
      vendor_commission: true,
      createdAt: true,
    },
  });

  // bookings trend
  const monthlyBookings = await prisma.venue_booking.findMany({
    where: {
      vendorId: vendorId,
      bookingStatus: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: {
      totalPrice: true,
      createdAt: true,
    },
  });

  // group earnings by month
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const earningsTrend = monthNames.map((month, index) => {
    const monthPayments = monthlyPayments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate.getMonth() === index;
    });

    const earnings = monthPayments.reduce((sum, payment) => {
      const amountToAdd = payment.vendor_commission !== null ? payment.vendor_commission : payment.amount;
      return sum + (amountToAdd || 0);
    }, 0);

    return {
      month,
      earnings,
    };
  });

  const bookingsTrend = monthNames.map((month, index) => {
    const monthBookings = monthlyBookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate.getMonth() === index;
    });

    return {
      month,
      bookings: monthBookings.length,
    };
  });

  // total earnings all time
  const totalEarningsData = await prisma.payment.aggregate({
    where: {
      venueBooking: {
        vendorId: vendorId,
      },
      status: PaymentStatus.PAID,
    },
    _sum: {
      amount: true,
      vendor_commission: true,
    },
  });
  const totalEarningsAllTime = totalEarningsData._sum.vendor_commission !== null 
    ? totalEarningsData._sum.vendor_commission 
    : (totalEarningsData._sum.amount || 0);

  // total bookings all time
  const totalBookingsAllTime = await prisma.venue_booking.count({
    where: {
      vendorId: vendorId,
      bookingStatus: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
    },
  });

  // current month data (always based on current real time month/year)
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const currentMonthPaymentsData = await prisma.payment.aggregate({
    where: {
      venueBooking: {
        vendorId: vendorId,
      },
      status: PaymentStatus.PAID,
      createdAt: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    },
    _sum: {
      amount: true,
      vendor_commission: true,
    },
  });
  const currentMonthEarnings = currentMonthPaymentsData._sum.vendor_commission !== null 
    ? currentMonthPaymentsData._sum.vendor_commission 
    : (currentMonthPaymentsData._sum.amount || 0);

  const currentMonthBookings = await prisma.venue_booking.count({
    where: {
      vendorId: vendorId,
      bookingStatus: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
      createdAt: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    },
  });

  return {
    totalEarnings: totalEarningsAllTime || 0,
    totalBookings: totalBookingsAllTime,
    currentMonthEarnings: currentMonthEarnings || 0,
    currentMonthBookings: currentMonthBookings,
    earningsTrend,
    bookingsTrend,
    filterYear,
  };
};

export const StatisticsService = {
  getOverview,
  getVendorTotalEarningsAndTrends,

  // // sales
  // getPartnerTotalEarningsHotel,
  // getServiceProviderTotalEarningsService,

  // // admin earns
  // getAdminTotalEarnings,
};
