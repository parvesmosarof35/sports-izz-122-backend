import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { VenueService } from "./venue.service";
import { VenueValidation } from "./venue.validation";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// create venue
const createVenue = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.user?.id;
  
  // Validate request body
  const validatedData = VenueValidation.createVenueValidation.parse(req.body);
  
  const result = await VenueService.createVenue(vendorId, validatedData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Venue created successfully!",
    data: result,
  });
});

export const VenueController = {
  createVenue,
};
