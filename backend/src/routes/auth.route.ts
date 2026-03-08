import express, { Router } from "express";
import { createUser, getCurrentUser, loginUser, logoutUser } from "../controllers/auth.controller.ts";
import upload  from "../middleware/multer.ts";
import { verifyToken } from "../middleware/auth.midleware.ts";

const router = Router();

router.post(
  "/signup",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  createUser
);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/user", verifyToken, getCurrentUser)

export default router;
