import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  calculateHealthMetrics,
  getHealthHistory,
  getHealthStatistics,
} from "../services/healthService.js";
import { validateHealthCalculationInput } from "../validations/health.validation.js";

export const calculate = asyncHandler(
  /**
   * @param {import("express").Request & { user: { _id: string } }} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const payload = validateHealthCalculationInput(req.body);
    const result = await calculateHealthMetrics(req.user._id, payload);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Health metrics calculated successfully",
      data: result,
    });
  },
);

export const history = asyncHandler(
  /**
   * @param {import("express").Request & { user: { _id: string } }} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const logs = await getHealthHistory(req.user._id);

    return sendSuccess(res, {
      message: "Health history retrieved successfully",
      data: { logs },
    });
  },
);

export const statistics = asyncHandler(
  /**
   * @param {import("express").Request & { user: { _id: string } }} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const statisticsResult = await getHealthStatistics(req.user._id);

    return sendSuccess(res, {
      message: "Health statistics retrieved successfully",
      data: statisticsResult,
    });
  },
);
