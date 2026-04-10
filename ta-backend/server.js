import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

dotenv.config();

const app = express();


// ✅ 1. CORS (MUST BE FIRST)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// ✅ 2. BODY PARSER
app.use(express.json());


// ✅ 3. SESSION (AFTER CORS, BEFORE ROUTES)
app.use(
  session({
    secret: "outlook-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,      // true only in HTTPS
      httpOnly: true,
      sameSite: "lax",    // important
    },
  })
);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// Models
import "./models/Candidate.js";
import "./models/Job.js";


// Routes
import candidateRoutes from "./routes/candidate.routes.js";
import jobRoutes from "./routes/job.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import outlookRoutes from "./routes/outlook.routes.js";

app.use("/api/calendar", calendarRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/outlook", outlookRoutes);


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});