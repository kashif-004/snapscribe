
const express = require("express");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all note routes
router.use(protect);

// CREATE a note
router.post("/", async (req, res) => {
  try {
    const { title, content, favorite, isDeleted } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content || "",
      user: req.user.id,
    });

    res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

// READ all notes belonging to logged-in user
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

// UPDATE a note
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, favorite, isDeleted } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }
      updates.title = title.trim();
    }

    if (content !== undefined) {
      updates.content = content;
    }

    if (favorite !== undefined) {
  updates.favorite = favorite;
    }

    if (isDeleted !== undefined) {
  updates.isDeleted = isDeleted;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields to update",
      });
    }

    const note = await Note.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

// DELETE a note
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    const note = await Note.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;