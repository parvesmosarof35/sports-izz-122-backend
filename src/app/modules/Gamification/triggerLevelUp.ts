import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Trigger level up for specific user (temporary fix)
const triggerLevelUpForUser = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return;

  // Calculate level based on XP
  const calculatedLevel = Math.floor(profile.currentXP / 100) + 1;
  const nextLevelXP = calculatedLevel * 100;
  
  const levelTitles = [
    "Beginner", "Novice", "Apprentice", "Journeyman", 
    "Expert", "Master", "Grandmaster", "Legend", "Mythic", "Immortal"
  ];
  
  const levelTitle = levelTitles[Math.min(calculatedLevel - 1, levelTitles.length - 1)];

  await prisma.userProfile.update({
    where: { userId },
    data: {
      currentLevel: calculatedLevel,
      levelTitle,
      nextLevelXP,
    },
  });

  console.log(`User ${userId} leveled up to ${calculatedLevel} (${levelTitle})`);
  return { newLevel: calculatedLevel, title: levelTitle };
};

// Example usage
// triggerLevelUpForUser("6928b0e6636a9e1a01135022");

export { triggerLevelUpForUser };
