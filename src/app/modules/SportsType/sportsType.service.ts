import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import {
  ISportsType,
  ISportsTypeFilterRequest,
  ISportsTypeUpdate,
} from "./sportsType.interface";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { searchableFields } from "./sportsType.constant";

// create sportsType access only admin
const createSportsType = async (payload: ISportsType) => {
  // check if sports type already exists
  const existingSportsType = await prisma.sportType.findUnique({
    where: { sportName: payload.sportName },
  });

  if (existingSportsType) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "SportsType with this name already exists"
    );
  }

  const result = await prisma.sportType.create({
    data: payload,
  });

  return result;
};

// get all sportsType
const getAllSportsTypes = async (
  params: ISportsTypeFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatedPagination(options);

  const { searchTerm, ...filterData } = params;

  const filters: Prisma.SportTypeWhereInput[] = [];

  // text search
  if (params?.searchTerm) {
    filters.push({
      OR: searchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // exact field match filters
  if (Object.keys(filterData).length > 0) {
    filters.push({
      AND: Object.keys(filterData).map((key) => {
        if (key === "sportName") {
          return {
            [key]: {
              contains: (filterData as any)[key],
              mode: "insensitive",
            },
          };
        }
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  const where: Prisma.SportTypeWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const result = await prisma.sportType.findMany({
    where,

    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.sportType.count({
    where,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// get single sportsType
const getSportsTypeById = async (id: string) => {
  const result = await prisma.sportType.findUnique({
    where: { id },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "SportsType not found");
  }

  return result;
};

// update sportsType access only admin
const updateSportsType = async (id: string, payload: ISportsTypeUpdate) => {
  // check if sports type exists
  const existingSportsType = await prisma.sportType.findUnique({
    where: { id },
  });

  if (!existingSportsType) {
    throw new ApiError(httpStatus.NOT_FOUND, "SportsType not found");
  }

  // check if updating sportsType already exists
  if (payload.sportName && payload.sportName !== existingSportsType.sportName) {
    const duplicateSportsType = await prisma.sportType.findUnique({
      where: { sportName: payload.sportName },
    });

    if (duplicateSportsType) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "SportsType with this name already exists"
      );
    }
  }

  const result = await prisma.sportType.update({
    where: { id },
    data: payload,
  });

  return result;
};

// delete sportsType access only admin
const deleteSportsType = async (id: string) => {
  // check if sports type exists
  const existingSportsType = await prisma.sportType.findUnique({
    where: { id },
  });

  if (!existingSportsType) {
    throw new ApiError(httpStatus.NOT_FOUND, "SportsType not found");
  }

  const result = await prisma.sportType.delete({
    where: { id },
  });

  return result;
};

export const SportsTypeService = {
  createSportsType,
  getAllSportsTypes,
  getSportsTypeById,
  updateSportsType,
  deleteSportsType,
};
