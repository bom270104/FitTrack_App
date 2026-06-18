import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { calculateBmiRecord, getBmiHistory } from "../services/bmiService.js";
import { validateBmiCalculationInput } from "../validations/bmi.validation.js";

export const calculate = asyncHandler(async (req, res) => {
    const payload = validateBmiCalculationInput(req.body);
    const result = await calculateBmiRecord(req.user._id, payload);

    return sendSuccess(res, {
        statusCode: 201,
        message: "BMI calculated successfully",
        data: result,
    });
});

export const history = asyncHandler(async (req, res) => {
    const result = await getBmiHistory(req.user._id);

    return sendSuccess(res, {
        message: "BMI history retrieved successfully",
        data: result,
    });
});