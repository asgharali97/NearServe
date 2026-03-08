import express ,{ Router } from "express";
import {
  createProviderProfile,
  getProviderProfile,
  updateProviderProfile,
  toggleAvailability,
  resubmitProfile,
  browseProviders,
  getProviderById,
} from "../controllers/provider.controller.ts";
import { verifyToken, authorizeRoles } from "../middleware/auth.midleware.ts";

const router = Router();

router.get("/", verifyToken, browseProviders);
router.get("/:id", verifyToken, getProviderById);

router.post("/profile/create", verifyToken, authorizeRoles("provider"), createProviderProfile);
router.get("/profile/me", verifyToken, authorizeRoles("provider"), getProviderProfile);
router.patch("/profile/update", verifyToken, authorizeRoles("provider"), updateProviderProfile);
router.patch("/availability", verifyToken, authorizeRoles("provider"), toggleAvailability);
router.post("/profile/resubmit", verifyToken, authorizeRoles("provider"), resubmitProfile);

export default router;