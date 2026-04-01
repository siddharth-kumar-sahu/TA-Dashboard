import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  round: { type: String },               // L1, L2, HR
  panelist: { type: String },
  scheduledDate: { type: Date },
  feedback: { type: String },
  status: { type: String }               // scheduled, completed, rejected
});

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String,

  primarySkill: String,
  secondarySkills: [String],
  totalExperienceYears: Number,

  currentCompany: String,
  currentLocation: String,
  preferredLocation: [String],

  currentCTC: Number,
  expectedCTC: String,
  noticePeriodDays: Number,

  source: String,                        // Naukri, LinkedIn, Referral
  recruiter: String,
  client: String,

  status: { 
    type: String,
    enum: ["in_progress", "hired", "on_hold", "offer_sent", "offer_pending", "rejected"],
    default: "in_progress"
  },

  stage: {
    type: String,
    enum: ["sourced", "screened", "interview_scheduled", "interviewed", "offer_sent", "hired", "offer_pending", "rejected"],
    default: "sourced"
  },

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  },

  applicationDate: {
    type: Date,
    default: Date.now
  },

  hiredDate: {
    type: Date
  },

  interviews: [interviewSchema],

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Candidate", candidateSchema);
