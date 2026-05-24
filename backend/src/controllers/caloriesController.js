import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
    calculateCaloriesRecord,
    getCaloriesHistory,
} from "../services/caloriesService.js";
import { validateCaloriesCalculationInput } from "../validations/calories.validation.js";

export const calculate = asyncHandler(async (req, res) => {
    const payload = validateCaloriesCalculationInput(req.body);
    const result = await calculateCaloriesRecord(req.user._id, payload);

    return sendSuccess(res, {
        statusCode: 201,
        message: "Calories calculated successfully",
        data: result,
    });
});

export const history = asyncHandler(async (req, res) => {
    const result = await getCaloriesHistory(req.user._id);

    return sendSuccess(res, {
        message: "Calories history retrieved successfully",
        data: result,
    });
});