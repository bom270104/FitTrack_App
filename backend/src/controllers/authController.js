import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService.js";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../validations/auth.validation.js";

export const register = asyncHandler(async (req, res) => {
  // eslint-disable-next-line no-console
  console.log("Register endpoint called", req.body && Object.keys(req.body));
  const payload = validateRegisterInput(req.body);
  let result;
  try {
    result = await registerUser(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Registration error:", err);
    throw err;
  }
  const { user, token } = result;

  const profileComplete = Boolean(
    user && typeof user.age === "number" && typeof user.height === "number" && typeof user.weight === "number"
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: { user, token, profileComplete },
  });
});

export const login = asyncHandler(async (req, res) => {
  const payload = validateLoginInput(req.body);
  const { user, token } = await loginUser(payload);

  return sendSuccess(res, {
    message: "Login successful",
    data: { user, token },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req.user._id);

  return sendSuccess(res, {
    message: "Authenticated user retrieved successfully",
    data: { user },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  await logoutUser();

  return sendSuccess(res, {
    message: "Logout successful",
    data: {},
  });
});
