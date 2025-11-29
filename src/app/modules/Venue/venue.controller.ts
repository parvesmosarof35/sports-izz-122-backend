import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { VenueService } from "./venue.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// create venue
const createVenue = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.user?.id;
  const data = req.body;
  const result = await VenueService.createVenue(vendorId, data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Venue created successfully !",
    data: result,
  });
});



export const VenueController = {
  createVenue,
};