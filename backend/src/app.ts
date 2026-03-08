import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes
import authRoutes from "./routes/auth.route.ts";
import providerRoutes from "./routes/provider.routes.ts";

app.use("/api/auth", authRoutes);
app.use("api/provider", providerRoutes);

export { app };
