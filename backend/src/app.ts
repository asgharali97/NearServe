import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());


// routes 
import authRoutes from './routes/auth.route.ts'

app.use("/api/auth", authRoutes);

export { app };
