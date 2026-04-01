import express from "express";
import Candidate from "../models/Candidate.js";

const router = express.Router();

/* ===============================
   CREATE CANDIDATE
================================ */
router.post("/", async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    await candidate.save();

    const populatedCandidate = await Candidate.findById(candidate._id).populate("jobId");

    res.status(201).json(populatedCandidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET ALL CANDIDATES
================================ */
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.status(200).json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET SINGLE CANDIDATE
================================ */
router.get("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate("jobId");

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.status(200).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   UPDATE CANDIDATE (status, stage, add interview)
================================ */
router.patch("/:id", async (req, res) => {
  try {
    const { status, stage, newInterview } = req.body;

    const updatePayload = {};

    if (status) updatePayload.status = status;
    if (stage) updatePayload.stage = stage;

    let candidate;

    if (newInterview) {
      // Push new interview round into the array
      candidate = await Candidate.findByIdAndUpdate(
        req.params.id,
        {
          ...(Object.keys(updatePayload).length > 0 && { $set: updatePayload }),
          $push: { interviews: newInterview },
        },
        { new: true }
      ).populate("jobId");
    } else {
      candidate = await Candidate.findByIdAndUpdate(
        req.params.id,
        { $set: updatePayload },
        { new: true }
      ).populate("jobId");
    }

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.status(200).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   ASSIGN JOB
================================ */
router.put("/:id/assign-job", async (req, res) => {
  try {
    const { jobId } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { jobId },
      { new: true }
    ).populate("jobId");

    res.status(200).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   ADD INTERVIEW
================================ */
router.post("/:id/interviews", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $push: { interviews: req.body } },
      { new: true }
    );

    res.status(200).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
