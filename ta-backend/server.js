import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ── Force model registration before routes ──
import "./models/Candidate.js";
import "./models/Job.js";

// Routes
import candidateRoutes from "./routes/candidate.routes.js";
import jobRoutes from "./routes/job.routes.js";

import calendarRoutes from "./routes/calendar.routes.js";
app.use("/api/calendar", calendarRoutes);

app.use("/api/candidates", candidateRoutes);
app.use("/api/jobs", jobRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});