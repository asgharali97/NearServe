import express, { Router } from "express";
import { createUser } from "../controllers/auth.controller.ts";
import upload  from "../middleware/multer.ts";

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

export default router;
