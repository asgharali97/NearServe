import { Response } from "express";
import { AuthRequest } from "../middleware/auth.midleware.ts";
import asyncHandler from "../utils/asynchandler.ts";
import { ApiError } from "../utils/api-error.ts";
import { ApiRespons } from "../utils/api-resonse.ts";
import ProviderProfile from "../models/provider.model.ts";
import ServiceCategory from "../models/category.model.ts";


const createProviderProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (req.user?.role !== "provider") {
    throw new ApiError(403, "Only providers can create a profile");
  }

  const existingProfile = await ProviderProfile.findOne({ userId });
  if (existingProfile) {
    throw new ApiError(409, "Provider profile already exists");
  }

  const { bio, city, categories } = req.body;

  if (!bio || !city || !categories || !Array.isArray(categories) || categories.length === 0) {
    throw new ApiError(400, "Bio, city and at least one category with price are required");
  }

  // validate each category exists in db and price is valid
  for (const item of categories) {
    if (!item.categoryId || !item.price || item.price <= 0) {
      throw new ApiError(400, "Each category must have a valid categoryid and price > 0");
    }

    const categoryExists = await ServiceCategory.findById(item.categoryId);
    if (!categoryExists || !categoryExists.isActive) {
      throw new ApiError(404, `Category ${item.categoryId} does not exist or is inactive`);
    }
  }

  const profile = await ProviderProfile.create({
    userId,
    bio,
    city,
    categories,
    availabilityStatus: true,
    approvalStatus: "pending",
  });

  return res
    .status(201)
    .json(new ApiRespons(201, profile, "Provider profile created successfully, please wait for admin approval"));
});


const getProviderProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const profile = await ProviderProfile.findOne({ userId })
    .populate("userId", "name email avatar")
    .populate("categories.categoryId", "name description");

  if (!profile) {
    throw new ApiError(404, "Provider profile not found");
  }

  return res
    .status(200)
    .json(new ApiRespons(200, profile, "Profile fetched successfully"));
});


const updateProviderProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const profile = await ProviderProfile.findOne({ userId });

  if (!profile) {
    throw new ApiError(404, "Provider profile not found");
  }

  if (profile.approvalStatus === "rejected") {
    throw new ApiError(403, "Your profile was rejected. Please resubmit for approval");
  }

  const { bio, city, categories } = req.body;

  if (categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new ApiError(400, "please provide categories cannot read empty values");
    }

    for (const item of categories) {
      if (!item.categoryId || !item.price || item.price <= 0) {
        throw new ApiError(400, "Each category must have a valid categoryid and price > 0");
      }

      const categoryExists = await ServiceCategory.findById(item.categoryId);
      if (!categoryExists || !categoryExists.isActive) {
        throw new ApiError(404, `Category ${item.categoryId} does not exist or is inactive`);
      }
    }
  }

  if (bio) profile.bio = bio;
  if (city) profile.city = city;
  if (categories) profile.categories = categories;

  await profile.save();

  return res
    .status(200)
    .json(new ApiRespons(200, profile, "Profile updated successfully"));
});


const toggleAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const profile = await ProviderProfile.findOne({ userId });

  if (!profile) {
    throw new ApiError(404, "Provider profile not found");
  }

  if (profile.approvalStatus !== "approved") {
    throw new ApiError(403, "Only approved providers can toggle availability");
  }


  profile.availabilityStatus = !profile.availabilityStatus;
  await profile.save();

  return res
    .status(200)
    .json(new ApiRespons(
      200,
      { availabilityStatus: profile.availabilityStatus },
      `You are now ${profile.availabilityStatus ? "available" : "unavailable"}`
    ));
});

const resubmitProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const profile = await ProviderProfile.findOne({ userId });

  if (!profile) {
    throw new ApiError(404, "Provider profile not found");
  }

  if (profile.approvalStatus !== "rejected") {
    throw new ApiError(400, "Only rejected profiles can be resubmitted");
  }

  const { bio, city, categories } = req.body;

  if (!bio || !city || !categories || !Array.isArray(categories) || categories.length === 0) {
    throw new ApiError(400, "Please provide all fields to resubmit");
  }

  for (const item of categories) {
    if (!item.categoryId || !item.price || item.price <= 0) {
      throw new ApiError(400, "Each category must have a valid categoryId and price");
    }

    const categoryExists = await ServiceCategory.findById(item.categoryId);
    if (!categoryExists || !categoryExists.isActive) {
      throw new ApiError(404, `Category ${item.categoryId} does not exist or is inactive`);
    }
  }

  profile.bio = bio;
  profile.city = city;
  profile.categories = categories;
  profile.approvalStatus = "pending";

  await profile.save();

  return res
    .status(200)
    .json(new ApiRespons(200, profile, "Profile resubmitted successfully, awaiting admin approval"));
});

const browseProviders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { city, categoryId } = req.query;

  const filter: any = {
    approvalStatus: "approved",
    availabilityStatus: true,
    isActive: true,
  };

  if (city) {
    filter.city = { $regex: city as string, $options: "i" };
  }

  if (categoryId) {
    filter["categories.categoryId"] = categoryId;
  }

  const providers = await ProviderProfile.find(filter)
    .populate("userId", "name email avatar")
    .populate("categories.categoryId", "name description")
    .select("-refreshToken");

  return res
    .status(200)
    .json(new ApiRespons(200, providers, "Providers fetched successfully"));
});

const getProviderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const provider = await ProviderProfile.findOne({
    _id: id,
    approvalStatus: "approved",
    isActive: true,
  })
    .populate("userId", "name email avatar")
    .populate("categories.categoryId", "name description");

  if (!provider) {
    throw new ApiError(404, "Provider not found");
  }

  return res
    .status(200)
    .json(new ApiRespons(200, provider, "Provider fetched successfully"));
});

export {
  createProviderProfile,
  getProviderProfile,
  updateProviderProfile,
  toggleAvailability,
  resubmitProfile,
  browseProviders,
  getProviderById,
};