import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { LevelService } from "./level.service";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

// create initial levels
const createInitialLevels = catchAsync(async (req: Request, res: Response) => {
  const result = await LevelService.createInitialLevels();

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Initial levels created successfully",
    data: result,
  });
});

// get all levels
const getAllLevels = catchAsync(async (req: Request, res: Response) => {
  const result = await LevelService.getAllLevels();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Levels retrieved successfully",
    data: result,
  });
});

// get level by id
const getSingleLevel = catchAsync(async (req: Request, res: Response) => {
  const levelId = req.params.levelId;
  const result = await LevelService.getSingleLevel(levelId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Level retrieved successfully",
    data: result,
  });
});

// get level by XP
const getLevelByXP = catchAsync(async (req: Request, res: Response) => {
  const { xp } = req.query;

  if (!xp || isNaN(Number(xp))) {
    throw new Error("Valid XP is required");
  }

  const result = await LevelService.getLevelByXP(Number(xp));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Level retrieved successfully",
    data: result,
  });
});

// create custom level
const createLevel = catchAsync(async (req: Request, res: Response) => {
  const levelData = req.body;
  const result = await LevelService.createLevel(levelData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Level created successfully",
    data: result,
  });
});

// update level
const updateLevel = catchAsync(async (req: Request, res: Response) => {
  const { levelId } = req.params;
  const updateData = req.body;
  const result = await LevelService.updateLevel(levelId, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Level updated successfully",
    data: result,
  });
});

// delete level
const deleteLevel = catchAsync(async (req: Request, res: Response) => {
  const { levelId } = req.params;
  const result = await LevelService.deleteLevel(levelId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Level deleted successfully",
    data: result,
  });
});

export const LevelController = {
  createInitialLevels,
  getAllLevels,
  getSingleLevel,
  getLevelByXP,
  createLevel,
  updateLevel,
  deleteLevel,
};
