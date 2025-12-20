// Filterable fields for gamification queries
export const gamificationFilterableFields = [
  'sportType',
  'badgeType',
  'achievementType',
  'actionType',
  'level',
  'isActive'
];

// Searchable fields
export const gamificationSearchableFields = [
  'name',
  'description',
  'title',
  'levelTitle'
];

// Default XP values
export const DEFAULT_XP_VALUES = {
  BOOKING: 10,
  REVIEW: 5,
  REFERRAL: 50,
  CHALLENGE_COMPLETE: 25,
  DAILY_LOGIN: 2,
  STREAK_BONUS: 5
};

// Level thresholds and titles
export const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, maxXP: 100, title: "Beginner" },
  { level: 2, minXP: 100, maxXP: 250, title: "Rookie" },
  { level: 3, minXP: 250, maxXP: 500, title: "Amateur" },
  { level: 4, minXP: 500, maxXP: 1000, title: "Semi-Pro" },
  { level: 5, minXP: 1000, maxXP: 2000, title: "Professional" },
  { level: 6, minXP: 2000, maxXP: 3500, title: "Expert" },
  { level: 7, minXP: 3500, maxXP: 5000, title: "Master" },
  { level: 8, minXP: 5000, maxXP: 7500, title: "Elite" },
  { level: 9, minXP: 7500, maxXP: 10000, title: "Legend" },
  { level: 10, minXP: 10000, maxXP: 15000, title: "Champion" },
  { level: 11, minXP: 15000, maxXP: 25000, title: "Hall of Fame" },
  { level: 12, minXP: 25000, maxXP: Infinity, title: "GOAT" }
];

// Badge configurations
export const BADGE_CONFIGURATIONS = {
  FIRST_BOOKING: {
    name: "First Booking",
    description: "Complete your first venue booking",
    iconUrl: "/badges/first-booking.png",
    xpReward: 10,
    pointsReward: 5
  },
  REVIEW_MASTER: {
    name: "Review Master",
    description: "Write 10 reviews",
    iconUrl: "/badges/review-master.png",
    xpReward: 50,
    pointsReward: 25
  },
  REFER_CHAMPION: {
    name: "Referral Champion",
    description: "Refer 3 friends who book",
    iconUrl: "/badges/referral-champion.png",
    xpReward: 100,
    pointsReward: 50
  },
  STREAK_MASTER: {
    name: "Streak Master",
    description: "Maintain a 7-day booking streak",
    iconUrl: "/badges/streak-master.png",
    xpReward: 75,
    pointsReward: 35
  },
  CHALLENGE_WINNER: {
    name: "Challenge Winner",
    description: "Complete 5 challenges",
    iconUrl: "/badges/challenge-winner.png",
    xpReward: 125,
    pointsReward: 60
  },
  ELITE_USER: {
    name: "Elite User",
    description: "Reach level 7",
    iconUrl: "/badges/elite-user.png",
    xpReward: 200,
    pointsReward: 100
  },
  VIP_MEMBER: {
    name: "VIP Member",
    description: "Reach level 10",
    iconUrl: "/badges/vip-member.png",
    xpReward: 500,
    pointsReward: 250
  },
  SPEED_BOOKER: {
    name: "Speed Booker",
    description: "Book 5 venues in one day",
    iconUrl: "/badges/speed-booker.png",
    xpReward: 30,
    pointsReward: 15
  },
  LOYAL_CUSTOMER: {
    name: "Loyal Customer",
    description: "Book for 30 days",
    iconUrl: "/badges/loyal-customer.png",
    xpReward: 150,
    pointsReward: 75
  },
  EXPLORER: {
    name: "Explorer",
    description: "Try 5 different sports",
    iconUrl: "/badges/explorer.png",
    xpReward: 80,
    pointsReward: 40
  }
};

// Achievement configurations
export const ACHIEVEMENT_CONFIGURATIONS = {
  FIRST_BOOKING: {
    name: "First Booking",
    description: "Complete your first venue booking",
    targetValue: 1,
    xpReward: 10,
    pointsReward: 5
  },
  MULTIPLE_SPORTS: {
    name: "Multi-Sport Athlete",
    description: "Book venues for 5 different sports",
    targetValue: 5,
    xpReward: 100,
    pointsReward: 50
  },
  REFERRAL_CHAMP: {
    name: "Referral Champion",
    description: "Successfully refer 10 friends",
    targetValue: 10,
    xpReward: 200,
    pointsReward: 100
  },
  STREAK_MASTER: {
    name: "Streak Master",
    description: "Maintain a 30-day booking streak",
    targetValue: 30,
    xpReward: 300,
    pointsReward: 150
  },
  CHALLENGE_CHAMP: {
    name: "Challenge Champion",
    description: "Complete 20 challenges",
    targetValue: 20,
    xpReward: 250,
    pointsReward: 125
  },
  ELITE_STATUS: {
    name: "Elite Status",
    description: "Reach level 12",
    targetValue: 12,
    xpReward: 1000,
    pointsReward: 500
  }
};

// Level benefits
export const LEVEL_BENEFITS = {
  1: ["discount_5%"],
  2: ["discount_5%", "priority_access"],
  3: ["discount_10%", "priority_access"],
  4: ["discount_10%", "priority_access", "early_booking"],
  5: ["discount_15%", "priority_access", "early_booking"],
  6: ["discount_15%", "priority_access", "early_booking", "vip_perks"],
  7: ["discount_20%", "priority_access", "early_booking", "vip_perks"],
  8: ["discount_20%", "priority_access", "early_booking", "vip_perks", "exclusive_events"],
  9: ["discount_25%", "priority_access", "early_booking", "vip_perks", "exclusive_events"],
  10: ["discount_30%", "priority_access", "early_booking", "vip_perks", "exclusive_events"],
  11: ["discount_35%", "priority_access", "early_booking", "vip_perks", "exclusive_events", "personal_concierge"],
  12: ["discount_40%", "priority_access", "early_booking", "vip_perks", "exclusive_events", "personal_concierge"]
};

// Reward types for point redemption
export const REWARD_TYPES = [
  "discount_5%",
  "discount_10%",
  "discount_15%",
  "discount_20%",
  "discount_25%",
  "priority_booking",
  "vip_access",
  "free_booking",
  "exclusive_venue_access",
  "personal_training_session"
];

// Point costs for rewards
export const REWARD_COSTS = {
  "discount_5%": 50,
  "discount_10%": 100,
  "discount_15%": 150,
  "discount_20%": 200,
  "discount_25%": 250,
  "priority_booking": 75,
  "vip_access": 300,
  "free_booking": 500,
  "exclusive_venue_access": 1000,
  "personal_training_session": 1500
};

// Streak types
export const STREAK_TYPES = {
  BOOKING: "booking",
  LOGIN: "login",
  REVIEW: "review",
  CHALLENGE: "challenge"
};

// Gamification messages
export const GAMIFICATION_MESSAGES = {
  XP_AWARDED: "XP awarded successfully!",
  BADGE_EARNED: "New badge earned!",
  ACHIEvement_COMPLETED: "Achievement completed!",
  LEVEL_UP: "Level up! You've reached a new level!",
  STREAK_BONUS: "Streak bonus XP awarded!",
  POINTS_REDEEMED: "Points redeemed successfully!",
  INSUFFICIENT_POINTS: "Insufficient points to redeem this reward",
  GAMIFICATION_DISABLED: "Gamification features are currently disabled"
};

// Notification types for gamification events
export const GAMIFICATION_NOTIFICATION_TYPES = {
  XP_EARNED: "xp_earned",
  BADGE_EARNED: "badge_earned",
  ACHIEVEMENT_COMPLETED: "achievement_completed",
  LEVEL_UP: "level_up",
  STREAK_MILESTONE: "streak_milestone",
  POINTS_REDEEMED: "points_redeemed"
};
