import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: String,

  jobDescription: String,
  location: String,

  primarySkill: String,
  secondarySkills: [String],

  preferredQualifications: {
    type: [String],
    enum: ["BSc", "MSc", "B.Tech", "M.Tech"]
  },

  client: String,

  experienceRange: {
    min: Number,
    max: Number
  },

  numberOfOpenings: { type: Number, default: 1 },

  status: {
    type: String,
    enum: ["open", "closed", "on_hold"],
    default: "open"
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Job", jobSchema);
