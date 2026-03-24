import { UserRole, UserStatus } from "@prisma/client";

export type TUser = {
  fullName?: string;
  email: string;
  password: string;
  profileImage?: string;
  contactNumber?: string;
  address?: string;
  country?: string;
  role: UserRole;
  status: UserStatus;
  latitude?: number;
  longitude?: number;
};

export type IUpdateUser = {
  fullName?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  country?: string;
  profileImage?: string;
  dateOfBirth?: Date;
  latitude?: number;
  longitude?: number;
};

export type IFilterRequest = {
  searchTerm?: string | undefined;
  fullName?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  country?: string | undefined;
  status?: string | undefined;
  role?: string | undefined;
  timeRange?: string | undefined;
};

export type SafeUser = {
  id: string;
  fullName: string | null;
  email: string;
  profileImage: string;
  contactNumber: string | null;
  address: string | null;
  country: string | null;
  role: UserRole;
  fcmToken: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  latitude: number | null;
  longitude: number | null;
};

export type IProfileImageResponse = {
  id: string;
  fullName: string | null;
  email: string;
  profileImage: string | null;
};
