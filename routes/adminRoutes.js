const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const Student = require("../models/Student");
const Payment = require("../models/Payment");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// 📊 Get Admin Dashboard Stats
router.get("/dashboard/:hostelId", protect, adminOnly, async (req, res) => {
  try {
    const { hostelId } = req.params;

    // Get all rooms of this hostel
    const rooms = await Room.find({ hostelId });
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0);
    const filledBeds = rooms.reduce((sum, r) => sum + r.filledBeds, 0);
    const emptyBeds = totalBeds - filledBeds;

    // Get all students
    const students = await Student.find({ hostelId });
    const studentsCount = students.length;

    // Payments summary
    const payments = await Payment.find({ hostelId });
    const paidStudents = payments.filter((p) => p.status === "Paid").length;
    const unpaidStudents = payments.filter((p) => p.status === "Unpaid").length;

    // Upcoming vacating students
    const today = new Date();
    const upcomingVacating = students
      .filter(
        (s) =>
          s.vacatingDate &&
          new Date(s.vacatingDate) > today &&
          new Date(s.vacatingDate) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      )
      .map((s) => ({ name: s.name, vacatingDate: s.vacatingDate }));

    res.json({
      totalRooms,
      totalBeds,
      filledBeds,
      emptyBeds,
      studentsCount,
      paidStudents,
      unpaidStudents,
      upcomingVacating,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
