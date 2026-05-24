import jwt from "jsonwebtoken";

import env from "../config/env.js";

export const generateToken = (payload, expiresIn = env.jwtExpiresIn) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};
