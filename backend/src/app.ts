import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


// routes 
import authRoutes from './routes/auth.route.ts'

app.use("/api/auth", authRoutes);

export { app };
