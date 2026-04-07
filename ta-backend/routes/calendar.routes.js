import express from "express";
import Candidate from "../models/Candidate.js";

const router = express.Router();

/* ===============================
   GET ALL INTERVIEW EVENTS
================================ */
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find({
      "interviews.0": { $exists: true }
    }).populate("jobId");

    const events = [];

    candidates.forEach((c) => {
      c.interviews.forEach((iv) => {
        if (!iv.scheduledDate) return;

        events.push({
          id: `${c._id}-${iv._id}`,
          candidateId: c._id,
          candidateName: c.name,
          round: iv.round,
          panelist: iv.panelist || "—",
          scheduledDate: iv.scheduledDate,
          interviewStatus: iv.status,
          jobTitle: c.jobId?.title || "—",
          recruiter: c.recruiter || "—",
          client: c.client || "—",
          candidateStatus: c.status,
          candidateStage: c.stage,
        });
      });
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;