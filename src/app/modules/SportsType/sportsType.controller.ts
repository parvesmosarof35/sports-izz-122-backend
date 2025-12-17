import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SportsTypeService } from "./sportsType.service";
import httpStatus from "http-status";
import { uploadFile } from "../../../helpars/fileUploader";
import { pick } from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { filterField } from "./sportsType.constant";

// create sportsType access only admin
const createSportsType = catchAsync(async (req: Request, res: Response) => {
  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errorMessages: [
        {
          path: "sportsTypeImage",
          message: "sportsImage file is required",
        },
      ],
    });
  }

  let sportsImage = "";

  // Upload sportsImage
  if (req.file) {
    const uploadResult = await uploadFile.uploadToCloudinary(req.file);
    if (uploadResult?.secure_url) {
      sportsImage = uploadResult.secure_url;
    }
  }

  const payload = {
    sportName: req.body.sportName,
    sportsImage,
  };

  const result = await SportsTypeService.createSportsType(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Sports type created successfully",
    data: result,
  });
});

// get all sportsType
const getAllSportsTypes = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, filterField);
  const options = pick(req.query, paginationFields);
  const result = await SportsTypeService.getAllSportsTypes(filter, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sports types retrieved successfully",
    data: result,
  });
});

// get single sportsType
const getSportsTypeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SportsTypeService.getSportsTypeById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sports type retrieved successfully",
    data: result,
  });
});

// update sportsType access only admin
const updateSportsType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  let sportsImage = req.body.sportsImage;

  // upload new image
  if (req.file) {
    const uploadResult = await uploadFile.uploadToCloudinary(req.file);
    if (uploadResult?.secure_url) {
      sportsImage = uploadResult.secure_url;
    }
  }

  const payload: any = {};
  if (req.body.sportName) {
    payload.sportName = req.body.sportName;
  }
  if (sportsImage) {
    payload.sportsImage = sportsImage;
  }

  const result = await SportsTypeService.updateSportsType(id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sports type updated successfully",
    data: result,
  });
});

// delete sportsType access only admin
const deleteSportsType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SportsTypeService.deleteSportsType(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sports type deleted successfully",
    data: result,
  });
});

export const SportsTypeController = {
  createSportsType,
  getAllSportsTypes,
  getSportsTypeById,
  updateSportsType,
  deleteSportsType,
};
