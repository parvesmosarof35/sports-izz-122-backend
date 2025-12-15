import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { VenueService } from "./venue.service";
import { VenueValidation } from "./venue.validation";
import { uploadFile } from "../../../helpars/fileUploader";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// create venue
const createVenue = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.user?.id;

  // venue image upload
  let venueImageUrl = "";
  if (req.file) {
    const uploadedFile = await uploadFile.uploadToCloudinary(req.file);
    venueImageUrl = uploadedFile?.secure_url || "";
  }

  const data = req.body;

  const payload = {
    ...data,
    venueImage: venueImageUrl,
  };

  const result = await VenueService.createVenue(vendorId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Venue created successfully!",
    data: result,
  });
});

// get all venues
const getAllVenues = catchAsync(async (req: Request, res: Response) => {
  const result = await VenueService.getAllVenues();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venues retrieved successfully!",
    data: result,
  });
});

// get all my venues
const getAllMyVenues = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.user?.id;
  const result = await VenueService.getAllMyVenues(vendorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venues retrieved successfully!",
    data: result,
  });
});

// update venue
const updateVenue = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.user?.id;
  const venueId = req.params.venueId;

  // venue image upload if provided
  let venueImageUrl = "";
  if (req.file) {
    const uploadedFile = await uploadFile.uploadToCloudinary(req.file);
    venueImageUrl = uploadedFile?.secure_url || "";
  }

  const data = req.body;

  const payload = {
    ...data,
    ...(venueImageUrl && { venueImage: venueImageUrl }),
  };

  const result = await VenueService.updateVenue(vendorId, venueId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venue updated successfully!",
    data: result,
  });
});

export const VenueController = {
  createVenue,
  getAllVenues,
  getAllMyVenues,
  updateVenue,
};
