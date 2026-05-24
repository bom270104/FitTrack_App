import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
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

    return sendSuccess(res, {
      message: "Profile updated successfully",
      data: { user },
    });
  },
);
