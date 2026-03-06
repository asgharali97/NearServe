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

const createUser = asyncHandler(async (req:Request, res:Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "Please provide All valid fields");
  }

  if (!["customer", "provider"].includes(role)) {
    throw new ApiError(400, "Role must be customer or provider");
  }

  const existingUser = await User.findOne({email});

  if (existingUser) {
    throw new ApiError(404, "A user with this email already exits");
  }

  const passwordHash = await bcrypt.hash(password, 10);
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
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json(new ApiRespons(201, user, "user created successfully"));
});

export { createUser };
