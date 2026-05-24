import { parsePositiveNumber, requireFields } from "../utils/validators.js";

export const validateBmiCalculationInput = (payload = {}) => {
    requireFields(payload, ["weight", "height"]);

    return {
        weight: parsePositiveNumber(payload.weight, "weight"),
        height: parsePositiveNumber(payload.height, "height"),
    };
};