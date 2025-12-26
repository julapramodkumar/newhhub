const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { protect, adminOnly } = require("../middleware/authMiddleware");



router.post("/", async (req, res) => {
  try {
    const {
      hostelId,
      roomNumber,
      floorNumber,
      roomType,
      totalBeds,
      rentPerMonth,
      roomCondition
    } = req.body;

    if (!hostelId || !roomNumber || !totalBeds || !rentPerMonth || !roomCondition) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRoom = new Room({
      hostelId,
      roomNumber,
      floorNumber,
      roomType,
      totalBeds,
      rentPerMonth,
      roomCondition
    });

    await newRoom.save();
    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (error) {
    console.error("Room creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get All Rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().populate("hostelId");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get rooms by hostel
router.get("/:hostelId", async (req, res) => {
  try {
    const rooms = await Room.find({ hostelId: req.params.hostelId }).populate("hostelId");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✏️ Update room
router.put("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room updated successfully", room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ❌ Delete room
router.delete("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
