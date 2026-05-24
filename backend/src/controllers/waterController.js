import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createWaterLog,
  deleteWaterLog,
  getTodayWaterLogs,
  getWaterHistory,
} from "../services/waterService.js";
import {
  validateObjectId,
  validateWaterLogInput,
} from "../validations/water.validation.js";

export const create = asyncHandler(
  /**
   * @param {import("express").Request & { user: { _id: string } }} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const payload = validateWaterLogInput(req.body);
    const waterLog = await createWaterLog(req.user._id, payload);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Water log created successfully",
      data: { waterLog },
    });
  },
);

export const today = asyncHandler(
  /**
   * @param {import("express").Request & { user: { _id: string } }} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const result = await getTodayWaterLogs(req.user._id);

    return sendSuccess(res, {
      message: "Today's water logs retrieved successfully",
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
    const result = await getWaterHistory(req.user._id);

    return sendSuccess(res, {
      message: "Water history retrieved successfully",
      data: result,
    });
  },
);

export const remove = asyncHandler(
  /**
   * @param {import("express").Request & { user: { _id: string }, params: { id: string } }} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const logId = validateObjectId(req.params.id, "water log id");
    await deleteWaterLog(req.user._id, logId);

    return sendSuccess(res, {
      message: "Water log deleted successfully",
      data: {},
    });
  },
);
