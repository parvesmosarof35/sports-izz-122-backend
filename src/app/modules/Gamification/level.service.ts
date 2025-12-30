import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";

const prisma = new PrismaClient();

// create initial levels
const createInitialLevels = async () => {
  const levels = [
    {
      level: 1,
      title: "Beginner",
      minXP: 0,
      maxXP: 99,
      benefits: ["basic_access", "standard_booking"],
    },
    {
      level: 2,
      title: "Novice",
      minXP: 100,
      maxXP: 199,
      benefits: ["priority_booking", "5%_discount"],
    },
    {
      level: 3,
      title: "Apprentice",
      minXP: 200,
      maxXP: 299,
      benefits: ["priority_booking", "10%_discount", "early_access"],
    },
    {
      level: 4,
      title: "Journeyman",
      minXP: 300,
      maxXP: 499,
      benefits: [
        "priority_booking",
        "15%_discount",
        "early_access",
        "vip_support",
      ],
    },
    {
      level: 5,
      title: "Expert",
      minXP: 500,
      maxXP: 999,
      benefits: [
        "priority_booking",
        "20%_discount",
        "early_access",
        "vip_support",
        "exclusive_events",
      ],
    },
    {
      level: 6,
      title: "Master",
      minXP: 1000,
      maxXP: 1499,
      benefits: [
        "priority_booking",
        "25%_discount",
        "early_access",
        "vip_support",
        "exclusive_events",
        "free_cancellation",
      ],
    },
    {
      level: 7,
      title: "Grandmaster",
      minXP: 1500,
      maxXP: 2499,
      benefits: [
        "priority_booking",
        "30%_discount",
        "early_access",
        "vip_support",
        "exclusive_events",
        "free_cancellation",
        "personal_assistant",
      ],
    },
    {
      level: 8,
      title: "Legend",
      minXP: 2500,
      maxXP: 4999,
      benefits: [
        "priority_booking",
        "35%_discount",
        "early_access",
        "vip_support",
        "exclusive_events",
        "free_cancellation",
        "personal_assistant",
        "premium_venues",
      ],
    },
    {
      level: 9,
      title: "Mythic",
      minXP: 5000,
      maxXP: 9999,
      benefits: [
        "priority_booking",
        "40%_discount",
        "early_access",
        "vip_support",
        "exclusive_events",
        "free_cancellation",
        "personal_assistant",
        "premium_venues",
        "unlimited_bookings",
      ],
    },
    {
      level: 10,
      title: "Immortal",
      minXP: 10000,
      maxXP: 999999,
      benefits: [
        "priority_booking",
        "50%_discount",
        "early_access",
        "vip_support",
        "exclusive_events",
        "free_cancellation",
        "personal_assistant",
        "premium_venues",
        "unlimited_bookings",
        "lifetime_vip",
      ],
    },
  ];

  try {
    // Clear existing levels
    await prisma.level.deleteMany();

    // Create new levels
    const createdLevels = await prisma.level.createMany({
      data: levels,
    });

    return {
      success: true,
      message: `${createdLevels.count} levels created successfully`,
      count: createdLevels.count,
    };
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create levels"
    );
  }
};

// get all levels
const getAllLevels = async () => {
  return await prisma.level.findMany({
    orderBy: { level: "asc" },
  });
};

// get single level
const getSingleLevel = async (levelId: string) => {
  return await prisma.level.findUnique({
    where: { id: levelId },
  });
};

// get level by XP
const getLevelByXP = async (xp: number) => {
  return await prisma.level.findFirst({
    where: {
      minXP: { lte: xp },
      maxXP: { gte: xp },
    },
  });
};

// create custom level
const createLevel = async (levelData: any) => {
  const { level, title, minXP, maxXP, benefits } = levelData;

  // Check if level already exists
  const existingLevel = await prisma.level.findUnique({
    where: { level },
  });

  if (existingLevel) {
    throw new ApiError(httpStatus.CONFLICT, `Level ${level} already exists`);
  }

  return await prisma.level.create({
    data: {
      level,
      title,
      minXP,
      maxXP,
      benefits: Array.isArray(benefits) ? benefits : [benefits],
    },
  });
};

// update level
const updateLevel = async (levelId: string, updateData: any) => {
  const existingLevel = await prisma.level.findUnique({
    where: { id: levelId },
  });

  if (!existingLevel) {
    throw new ApiError(httpStatus.NOT_FOUND, "Level not found");
  }

  return await prisma.level.update({
    where: { id: levelId },
    data: updateData,
  });
};

// delete level
const deleteLevel = async (levelId: string) => {
  const existingLevel = await prisma.level.findUnique({
    where: { id: levelId },
  });

  if (!existingLevel) {
    throw new ApiError(httpStatus.NOT_FOUND, "Level not found");
  }

  return await prisma.level.delete({
    where: { id: levelId },
  });
};

export const LevelService = {
  createInitialLevels,
  getAllLevels,
  getSingleLevel,
  getLevelByXP,
  createLevel,
  updateLevel,
  deleteLevel,
};
