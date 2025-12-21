import { PrismaClient } from "@prisma/client";
import {
  XPResponse,
  UserProfileResponse,
  AchievementProgress,
  BadgeResponse,
  GamificationAction,
  BadgeType,
  AchievementType,
  GamificationSettings,
} from "./gamification.interface";

const prisma = new PrismaClient();

// XP calculation and awarding
const awardXP = async (
  userId: string,
  action: GamificationAction,
  description?: string
): Promise<XPResponse> => {
  const settings = await getGamificationSettings();
  if (!settings.isActive) {
    throw new Error("Gamification is currently disabled");
  }

  let baseXP = 0;
  switch (action) {
    case "BOOKING":
      baseXP = settings.xpPerBooking;
      break;
    case "REVIEW":
      baseXP = settings.xpPerReview;
      break;
    case "REFERRAL":
      baseXP = settings.xpPerReferral;
      break;
    case "CHALLENGE_COMPLETE":
      baseXP = settings.xpPerChallenge;
      break;
    case "DAILY_LOGIN":
      baseXP = settings.xpPerDailyLogin;
      break;
  }

  // calculate streak bonus
  const streakBonus = await calculateStreakBonus(userId, action);
  const totalXP = baseXP + streakBonus;

  // update user profile
  const userProfile = await updateUserProfile(userId, totalXP, action);

  // record XP history
  await recordXPHistory(
    userId,
    baseXP,
    streakBonus,
    totalXP,
    action,
    description
  );

  // check for level up
  const levelUp = await checkLevelUp(userId, userProfile.currentXP);

  // check for new badges and achievements
  const newBadges = await checkBadgeUnlocks(userId, action);
  const achievementUpdates = await updateAchievements(userId, action);

  return {
    xpEarned: totalXP,
    baseXP,
    bonusXP: streakBonus,
    newLevel: levelUp?.newLevel,
    levelUpReward: levelUp?.rewards,
    newBadges,
    achievementUpdates,
    currentXP: userProfile.currentXP,
    nextLevelXP: userProfile.nextLevelXP,
    levelTitle: userProfile.levelTitle,
  };
};

// get user gamification profile
const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });

  if (!profile) {
    // Create profile if it doesn't exist
    return await createUserProfile(userId);
  }

  const badges = await getUserBadges(userId);
  const achievements = await getUserAchievements(userId);
  const streaks = await getUserStreaks(userId);

  return {
    ...profile,
    badges,
    achievements,
    streaks,
    user: profile.user,
  };
};

// leaderboard
const getLeaderboard = async (
  limit: number = 10,
  sportType?: string
): Promise<any[]> => {
  const whereClause = sportType
    ? { user: { venues: { some: { sportsType } } } }
    : {};

  const topUsers = await prisma.userProfile.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          fullName: true,
          profileImage: true,
        },
      },
    },
    orderBy: { totalXP: "desc" },
    take: limit,
  });

  return topUsers.map((user: any, index: number) => ({
    rank: index + 1,
    ...user,
    user: user.user,
  }));
};

// redeem points
const redeemPoints = async (
  userId: string,
  pointsToRedeem: number,
  rewardType: string
): Promise<any> => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile || profile.atlasPoints < pointsToRedeem) {
    throw new Error("Insufficient points");
  }

  // Update user points
  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: {
      atlasPoints: profile.atlasPoints - pointsToRedeem,
    },
  });

  return {
    success: true,
    remainingPoints: updatedProfile.atlasPoints,
    redeemedPoints: pointsToRedeem,
    rewardType,
  };
};

// helper functions
const getGamificationSettings = async () => {
  let settings = await prisma.gamificationSettings.findFirst();
  if (!settings) {
    settings = await prisma.gamificationSettings.create({
      data: {},
    });
  }
  return settings;
};

// calculate streak bonus
const calculateStreakBonus = async (
  userId: string,
  action: GamificationAction
): Promise<number> => {
  // Skip streak calculation for now - return 0
  return 0;
  
  // TODO: Implement streak tracking later
  /*
  const streakType =
    action === "DAILY_LOGIN"
      ? "login"
      : action === "BOOKING"
      ? "booking"
      : "review";

  const streak = await prisma.userStreak.findUnique({
    where: {
      userId_streakType: {
        userId,
        streakType,
      },
    },
  });

  if (!streak) return 0;

  const settings = await getGamificationSettings();
  return streak.currentStreak * settings.streakBonusXP;
  */
};

// update user profile
const updateUserProfile = async (
  userId: string,
  xp: number,
  action: GamificationAction
) => {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      currentXP: { increment: xp },
      totalXP: { increment: xp },
      lastActiveDate: new Date(),
      bookingCount: action === "BOOKING" ? { increment: 1 } : undefined,
      reviewCount: action === "REVIEW" ? { increment: 1 } : undefined,
      referralCount: action === "REFERRAL" ? { increment: 1 } : undefined,
      challengeCount:
        action === "CHALLENGE_COMPLETE" ? { increment: 1 } : undefined,
    },
    create: {
      userId,
      currentXP: xp,
      totalXP: xp,
      bookingCount: action === "BOOKING" ? 1 : 0,
      reviewCount: action === "REVIEW" ? 1 : 0,
      referralCount: action === "REFERRAL" ? 1 : 0,
      challengeCount: action === "CHALLENGE_COMPLETE" ? 1 : 0,
    },
  });

  return profile;
};

// record xp history
const recordXPHistory = async (
  userId: string,
  baseXP: number,
  bonusXP: number,
  totalXP: number,
  action: GamificationAction,
  description?: string
) => {
  return await prisma.xPHistory.create({
    data: {
      userId,
      xpEarned: baseXP,
      bonusXP,
      totalXP,
      actionType: action,
      description,
    },
  });
};

// check level up
const checkLevelUp = async (userId: string, currentXP: number) => {
  const currentLevel = await prisma.level.findFirst({
    where: { minXP: { lte: currentXP }, maxXP: { gte: currentXP } },
  });

  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile || !currentLevel) return null;

  if (currentLevel.level > profile.currentLevel) {
    await prisma.userProfile.update({
      where: { userId },
      data: {
        currentLevel: currentLevel.level,
        levelTitle: currentLevel.title,
        nextLevelXP: currentLevel.maxXP,
      },
    });

    return {
      newLevel: currentLevel.level,
      title: currentLevel.title,
      rewards: currentLevel.benefits,
    };
  }

  return null;
};

// check badge unlocks
const checkBadgeUnlocks = async (
  userId: string,
  action: GamificationAction
): Promise<BadgeResponse[]> => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const potentialBadges = await prisma.badge.findMany({
    where: { isActive: true },
  });

  const newBadges: BadgeResponse[] = [];

  for (const badge of potentialBadges) {
    const alreadyHas = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });

    if (alreadyHas) continue;

    let shouldAward = false;

    switch (badge.badgeType) {
      case "FIRST_BOOKING":
        shouldAward = action === "BOOKING" && profile.bookingCount === 1;
        break;
      case "REVIEW_MASTER":
        shouldAward = profile.reviewCount >= 10;
        break;
      case "REFER_CHAMPION":
        shouldAward = profile.referralCount >= 3;
        break;
      case "STREAK_MASTER":
        shouldAward = profile.streakDays >= 7;
        break;
      case "ELITE_USER":
        shouldAward = profile.currentLevel >= 7;
        break;
      case "VIP_MEMBER":
        shouldAward = profile.currentLevel >= 10;
        break;
    }

    if (shouldAward) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });

      // Award badge XP and points (separate from action XP)
      await prisma.userProfile.update({
        where: { userId },
        data: {
          currentXP: { increment: badge.xpReward },
          totalXP: { increment: badge.xpReward },
          atlasPoints: { increment: badge.pointsReward },
        },
      });

      newBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        xpReward: badge.xpReward,
        pointsReward: badge.pointsReward,
      });
    }
  }

  return newBadges;
};

// update achievements
const updateAchievements = async (
  userId: string,
  action: GamificationAction
): Promise<AchievementProgress[]> => {
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
  });

  const updates: AchievementProgress[] = [];

  for (const achievement of achievements) {
    const userAchievement = await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: { userId, achievementId: achievement.id },
      },
      update: { lastUpdated: new Date() },
      create: { userId, achievementId: achievement.id },
    });

    let progress = userAchievement.progress;
    let shouldUpdate = false;

    switch (achievement.achievementType) {
      case "FIRST_BOOKING":
        if (action === "BOOKING" && progress === 0) {
          progress = 1;
          shouldUpdate = true;
        }
        break;
      case "MULTIPLE_SPORTS":
        // This would need more complex logic to track different sports
        break;
      case "REFERRAL_CHAMP":
        if (action === "REFERRAL") {
          progress = Math.min(progress + 1, achievement.targetValue);
          shouldUpdate = true;
        }
        break;
      case "STREAK_MASTER":
        // Updated separately in streak tracking
        break;
    }

    if (shouldUpdate) {
      const isCompleted = progress >= achievement.targetValue;
      const completedAt = isCompleted
        ? new Date()
        : userAchievement.completedAt;

      await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: { progress, isCompleted, completedAt },
      });

      updates.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        progress,
        targetValue: achievement.targetValue,
        isCompleted,
        xpReward: achievement.xpReward,
        pointsReward: achievement.pointsReward,
      });

      // Award completion rewards
      if (isCompleted && !userAchievement.isCompleted) {
        await prisma.userProfile.update({
          where: { userId },
          data: {
            currentXP: { increment: achievement.xpReward },
            totalXP: { increment: achievement.xpReward },
            atlasPoints: { increment: achievement.pointsReward },
          },
        });
      }
    }
  }

  return updates;
};

// create user profile
const createUserProfile = async (
  userId: string
): Promise<UserProfileResponse> => {
  const profile = await prisma.userProfile.create({
    data: { userId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });

  return {
    ...profile,
    badges: [],
    achievements: [],
    streaks: [],
  };
};

// Public methods for controller
const getUserBadges = async (userId: string): Promise<BadgeResponse[]> => {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });

  return userBadges.map((ub) => ({
    id: ub.badge.id,
    name: ub.badge.name,
    description: ub.badge.description,
    iconUrl: ub.badge.iconUrl,
    xpReward: ub.badge.xpReward,
    pointsReward: ub.badge.pointsReward,
    earnedAt: ub.earnedAt,
  }));
};

// get user achievements
const getUserAchievements = async (
  userId: string
): Promise<AchievementProgress[]> => {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });

  return userAchievements.map((ua) => ({
    id: ua.achievement.id,
    name: ua.achievement.name,
    description: ua.achievement.description,
    progress: ua.progress,
    targetValue: ua.achievement.targetValue,
    isCompleted: ua.isCompleted,
    xpReward: ua.achievement.xpReward,
    pointsReward: ua.achievement.pointsReward,
  }));
};

// get user streaks
const getUserStreaks = async (userId: string): Promise<any[]> => {
  return await prisma.userStreak.findMany({
    where: { userId },
    orderBy: { lastActiveDate: "desc" },
  });
};

// additional methods needed by controller
const getXPHistory = async (
  userId: string,
  paginationOptions?: any
): Promise<any> => {
  const limit = paginationOptions?.limit
    ? parseInt(paginationOptions.limit)
    : 10;
  const page = paginationOptions?.page ? parseInt(paginationOptions.page) : 1;
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    prisma.xPHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.xPHistory.count({ where: { userId } }),
  ]);

  return {
    data: history,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// admin: create badge
const createBadge = async (badgeData: any): Promise<any> => {
  const { iconUrl, ...otherData } = badgeData;

  const data = {
    ...otherData,
    iconUrl:
      iconUrl ||
      "https://res.cloudinary.com/your-cloud/image/upload/v1/default-badge.png",
  };

  return await prisma.badge.create({
    data,
  });
};

// create achievement
const createAchievement = async (achievementData: any): Promise<any> => {
  return await prisma.achievement.create({
    data: achievementData,
  });
};

// upsert gamification settings
const updateGamificationSettings = async (
  settingsData: any
): Promise<GamificationSettings> => {
  const existing = await prisma.gamificationSettings.findFirst();

  if (existing) {
    return await prisma.gamificationSettings.update({
      where: { id: existing.id },
      data: settingsData,
    });
  } else {
    return await prisma.gamificationSettings.create({
      data: settingsData,
    });
  }
};

export const GamificationService = {
  awardXP,
  getUserProfile,
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
