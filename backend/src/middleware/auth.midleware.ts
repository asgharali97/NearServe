import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.ts";
import User from "../models/user.model.ts";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized, no token");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
      role: string;
    };

    const user = await User.findById(decoded.userId).select("-passwordHash -refreshToken -createdAt -updatedAt -__v");

    if (!user) {
      throw new ApiError(401, "Unauthorized, user not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }

    req.user = { userId: decoded.userId, role: decoded.role };
    next();

  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Access denied"));
    }
    next();
  };
};

export { verifyToken, authorizeRoles };