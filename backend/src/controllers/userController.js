import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { calculateBmiRecord } from "../services/bmiService.js";
import { getUserProfile, updateUserProfile } from "../services/userService.js";
import { validateProfileUpdateInput } from "../validations/user.validation.js";

export const getProfile = asyncHandler(
  /**
   * @param {import("express").Request & { user: { _id: string } }} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const user = await getUserProfile(req.user._id);

    return sendSuccess(res, {
      message: "Profile retrieved successfully",
      data: { user },
    });
  },
);

export const updateProfile = asyncHandler(
  /**
   * @param {import("express").Request & { user: { _id: string } }} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const updates = validateProfileUpdateInput(req.body);
    const user = await updateUserProfile(req.user._id, updates);
    let bmi = null;

    const shouldCalculateBmi =
      updates.height !== undefined || updates.weight !== undefined;

    if (
      shouldCalculateBmi &&
      Number.isFinite(user.height) &&
      Number.isFinite(user.weight)
    ) {
      bmi = await calculateBmiRecord(req.user._id, {
        height: user.height,
        weight: user.weight,
      });
    }

    return sendSuccess(res, {
      message: "Profile updated successfully",
      data: { user, bmi },
    });
  },
);
