import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getDashboardStats } from "../services/statsService.js";

export const dashboard = asyncHandler(async (req, res) => {
    const result = await getDashboardStats(req.user._id);

    return sendSuccess(res, {
        message: "Dashboard statistics retrieved successfully",
        data: result,
    });
});