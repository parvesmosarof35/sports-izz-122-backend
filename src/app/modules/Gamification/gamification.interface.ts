// Gamification Action Types (temporary until Prisma generates)
export enum GamificationAction {
  BOOKING = 'BOOKING',
  REVIEW = 'REVIEW',
  REFERRAL = 'REFERRAL',
  CHALLENGE_COMPLETE = 'CHALLENGE_COMPLETE',
  DAILY_LOGIN = 'DAILY_LOGIN'
}

export enum BadgeType {
  FIRST_BOOKING = 'FIRST_BOOKING',
  REVIEW_MASTER = 'REVIEW_MASTER',
  REFER_CHAMPION = 'REFER_CHAMPION',
  STREAK_MASTER = 'STREAK_MASTER',
  CHALLENGE_WINNER = 'CHALLENGE_WINNER',
  ELITE_USER = 'ELITE_USER',
  VIP_MEMBER = 'VIP_MEMBER',
  SPEED_BOOKER = 'SPEED_BOOKER',
  LOYAL_CUSTOMER = 'LOYAL_CUSTOMER',
  EXPLORER = 'EXPLORER'
}

export enum AchievementType {
  FIRST_BOOKING = 'FIRST_BOOKING',
  MULTIPLE_SPORTS = 'MULTIPLE_SPORTS',
  REFERRAL_CHAMP = 'REFERRAL_CHAMP',
  STREAK_MASTER = 'STREAK_MASTER',
  CHALLENGE_CHAMP = 'CHALLENGE_CHAMP',
  ELITE_STATUS = 'ELITE_STATUS'
}

// Response Interfaces
export interface XPResponse {
  xpEarned: number;
  baseXP: number;
  bonusXP: number;
  newLevel?: number;
  levelUpReward?: any;
  newBadges: BadgeResponse[];
  achievementUpdates: AchievementProgress[];
  currentXP: number;
  nextLevelXP: number;
  levelTitle: string;
}

export interface UserProfileResponse {
  id: string;
  userId: string;
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  atlasPoints: number;
  streakDays: number;
  lastActiveDate: Date;
  bookingCount: number;
  reviewCount: number;
  referralCount: number;
  challengeCount: number;
  nextLevelXP: number;
  levelTitle: string;
  createdAt: Date;
  updatedAt: Date;
  badges: BadgeResponse[];
  achievements: AchievementProgress[];
  streaks: any[];
  totalLevels?: number;
  user?: {
    fullName: string | null;
    email: string;
    profileImage: string;
  };
}

export interface BadgeResponse {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  xpReward: number;
  pointsReward: number;
  earnedAt?: Date;
}

export interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  progress: number;
  targetValue: number;
  isCompleted: boolean;
  xpReward: number;
  pointsReward: number;
  completedAt?: Date;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  userId: string;
  currentLevel: number;
  totalXP: number;
  levelTitle: string;
  user: {
    fullName: string | null;
    profileImage: string;
  };
}

export interface StreakInfo {
  id: string;
  streakType: string;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: Date;
  bonusXP: number;
}

export interface GamificationSettings {
  id: string;
  xpPerBooking: number;
  xpPerReview: number;
  xpPerReferral: number;
  xpPerChallenge: number;
  xpPerDailyLogin: number;
  streakBonusXP: number;
  referralPointsReward: number;
  pointsToXPConversion: number;
  isActive: boolean;
}

// Request Interfaces
export interface AwardXPRequest {
  userId: string;
  action: GamificationAction;
  description?: string;
}

export interface RedeemPointsRequest {
  userId: string;
  pointsToRedeem: number;
  rewardType: string;
}

export interface CreateBadgeRequest {
  name: string;
  description: string;
  iconUrl: string;
  badgeType: BadgeType;
  xpReward: number;
  pointsReward: number;
}

export interface CreateAchievementRequest {
  name: string;
  description: string;
  achievementType: AchievementType;
  targetValue: number;
  xpReward: number;
  pointsReward: number;
}

export interface UpdateGamificationSettingsRequest {
  xpPerBooking?: number;
  xpPerReview?: number;
  xpPerReferral?: number;
  xpPerChallenge?: number;
  xpPerDailyLogin?: number;
  streakBonusXP?: number;
  referralPointsReward?: number;
  pointsToXPConversion?: number;
  isActive?: boolean;
}
