import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { GamificationService } from "./gamification.service";
import { pick } from "../../../shared/pick";
import { gamificationFilterableFields } from "./gamification.constant";
import { paginationFields } from "../../../constants/pagination";
import { uploadFile } from "../../../helpars/fileUploader";

// get user gamification profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await GamificationService.getUserProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User gamification profile retrieved successfully",
    data: result,
  });
});

// award XP to user
const awardXP = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { action, description } = req.body;
  const result = await GamificationService.awardXP(userId, action, description);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "XP awarded successfully",
    data: result,
  });
});

// get leaderboard
const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, gamificationFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
  const limit = paginationOptions.limit
    ? parseInt(paginationOptions.limit as string)
    : 10;
  const sportType = filters.sportType as string;

  const result = await GamificationService.getLeaderboard(limit, sportType);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leaderboard retrieved successfully",
    data: result,
  });
});

// redeem points
const redeemPoints = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { pointsToRedeem, rewardType } = req.body;
  const result = await GamificationService.redeemPoints(
    userId,
    pointsToRedeem,
    rewardType
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Points redeemed successfully",
    data: result,
  });
});

// get user badges
const getUserBadges = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await GamificationService.getUserBadges(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User badges retrieved successfully",
    data: result,
  });
});

// get user achievements
const getUserAchievements = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await GamificationService.getUserAchievements(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User achievements retrieved successfully",
    data: result,
  });
});

// get user streaks
const getUserStreaks = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await GamificationService.getUserStreaks(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User streaks retrieved successfully",
    data: result,
  });
});

// get XP history
const getXPHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const paginationOptions = pick(req.query, paginationFields);
  const result = await GamificationService.getXPHistory(
    userId,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "XP history retrieved successfully",
    data: result,
  });
});

// admin: create badge
const createBadge = catchAsync(async (req: Request, res: Response) => {
  const badgeData = req.body;

  // Upload icon to Cloudinary if file exists
  if (req.file) {
    const uploadedIcon = await uploadFile.uploadToCloudinary(req.file);
    if (uploadedIcon?.secure_url) {
      badgeData.iconUrl = uploadedIcon.secure_url;
    }
  }

  const result = await GamificationService.createBadge(badgeData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Badge created successfully",
    data: result,
  });
});

// admin: create achievement
const createAchievement = catchAsync(async (req: Request, res: Response) => {
  const achievementData = req.body;
  const result = await GamificationService.createAchievement(achievementData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Achievement created successfully",
    data: result,
  });
});

// admin: upsert gamification settings
const updateGamificationSettings = catchAsync(
  async (req: Request, res: Response) => {
    const settingsData = req.body;
    const result = await GamificationService.updateGamificationSettings(
      settingsData
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Gamification settings updated successfully",
      data: result,
    });
  }
);

// admin: get gamification settings
const getGamificationSettings = catchAsync(
  async (req: Request, res: Response) => {
    const result = await GamificationService.getGamificationSettings();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Gamification settings retrieved successfully",
      data: result,
    });
  }
);

export const GamificationController = {
  getUserProfile,
  awardXP,
  getLeaderboard,
  redeemPoints,
  getUserBadges,
  getUserAchievements,
  getUserStreaks,
  getXPHistory,
  createBadge,
  createAchievement,
  updateGamificationSettings,
  getGamificationSettings,
};
