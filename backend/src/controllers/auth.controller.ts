import type { Request, Response } from "express";
import User from "../models/user.model.ts";
import asyncHandler from "../utils/asynchandler.ts";
import { ApiError } from "../utils/api-error.ts";
import { ApiRespons } from "../utils/api-resonse.ts";
import { uploadOnCloudinary } from "../utils/cloudinary.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "Please provide All valid fields");
  }

  if (!["customer", "provider"].includes(role)) {
    throw new ApiError(400, "Role must be customer or provider");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(404, "A user with this email already exits");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // @ts-ignore
  const avtarFilesPath = req.files?.avatar[0]?.path;

  const avatar = await uploadOnCloudinary(avtarFilesPath);

  const createUser = await User.create({
    name,
    email,
    role,
    passwordHash,
    avatar: avatar?.url,
  });

  if (!createUser) {
    throw new ApiError(404, "Erorr while creating user");
  }

  const { accessToken, refreshToken } = generateTokens(
    createUser._id.toString(),
    createUser.role
  );
  createUser.refreshToken = refreshToken;
  await createUser.save();

  const user = await User.findById(createUser._id).select("-password");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiRespons(201, user, "user created successfully"));
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = generateTokens(
    user._id.toString(),
    user.role
  );

  user.refreshToken = refreshToken;
  await user.save();

  const loggedUser = await User.findById(user._id).select(
    "-passwordHash -refreshToken -createdAt -updatedAt -__v"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiRespons(
        200,
        {
          loggedUser
        },
        "Login successful"
      )
    );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .clearCookie("accessToken")
    .json(new ApiRespons(200, {}, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req:Request, res:Response) => {
  return res
    .status(200)
    .json(new ApiRespons(200, req.user, "fetched current user successfully"));
});

export { createUser, loginUser, logoutUser, getCurrentUser };
