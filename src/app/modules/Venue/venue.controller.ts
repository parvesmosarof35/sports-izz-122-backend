import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { VenueService } from "./venue.service";
import { VenueValidation } from "./venue.validation";
import { uploadFile } from "../../../helpars/fileUploader";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { pick } from "../../../shared/pick";
import { filterField } from "./venue.constant";
import { paginationFields } from "../../../constants/pagination";

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
  const filter = pick(req.query, filterField);
  const options = pick(req.query, paginationFields);

  const result = await VenueService.getAllVenues(filter, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venues retrieved successfully!",
    data: result,
  });
});

// get all nearby venues
const getAllNearbyVenues = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, filterField);
  const options = pick(req.query, paginationFields);
  const locationParams = pick(req.query, ["userslatitude", "userslongitude", "maxDistance"]);

  const result = await VenueService.getAllNearbyVenues(filter, options, locationParams);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Nearby venues retrieved successfully!",
    data: result,
  });
});

// get venue group by SportsType
const getVenueGroupBySportsType = catchAsync(
  async (req: Request, res: Response) => {
    const filter = pick(req.query, filterField);
    const options = pick(req.query, paginationFields);

    const result = await VenueService.getVenueGroupBySportsType(
      filter,
      options,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Venues retrieved successfully!",
      data: result,
    });
  },
);

// get all my venues
const getAllMyVenues = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.user?.id;
  const options = pick(req.query, paginationFields);

  const result = await VenueService.getAllMyVenues(vendorId, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venues retrieved successfully!",
    data: result,
  });
});

// get single venue
const getSingleVenue = catchAsync(async (req: Request, res: Response) => {
  const venueId = req.params.venueId;
  const result = await VenueService.getSingleVenue(venueId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venue retrieved successfully!",
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

// delete venue
const deleteVenue = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.user?.id;
  const venueId = req.params.venueId;
  const result = await VenueService.deleteVenue(vendorId, venueId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Venue deleted successfully!",
    data: result,
  });
});

export const VenueController = {
  createVenue,
  getAllVenues,
  getAllNearbyVenues,
  getVenueGroupBySportsType,
  getAllMyVenues,
  getSingleVenue,
  updateVenue,
  deleteVenue,
};
