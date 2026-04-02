import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

/* ===============================
   CREATE JOB
================================ */
router.post("/", async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET ALL JOBS
================================ */
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET SINGLE JOB
================================ */
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   UPDATE JOB (status, priority)
================================ */
router.patch("/:id", async (req, res) => {
  try {
    const { status, priority } = req.body;
    const updatePayload = {};
    if (status)   updatePayload.status   = status;
    if (priority) updatePayload.priority = priority;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    );

    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;