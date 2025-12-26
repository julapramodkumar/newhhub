const express = require("express");
const router = express.Router();
const Hostel = require("../models/Hostel");
const Room = require("../models/Room");
const Student = require("../models/Student");
const Fee = require("../models/Fees");
const { protect, ownerOnly } = require("../middleware/authMiddleware");

router.get("/hostels", protect, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.user.id; // <-- was _id
    const hostels = await Hostel.find({ ownerId }).select("hostelName _id");
    res.json(hostels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ 2. Combined Dashboard for All Hostels (NEW IMPORTANT API)
router.get("/combined-dashboard/:ownerId", protect, ownerOnly, async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    const hostels = await Hostel.find({ ownerId });

    let result = {
      totalBeds: 0,
      emptyBeds: 0,
      filledBeds: 0,
      totalStudents: 0,
      totalPayments: 0,
      pendingPayments: 0,
      cashTotal: 0,
      onlineTotal: 0,
    };

    // Loop through each hostel
    for (const h of hostels) {

      const rooms = await Room.find({ hostelId: h._id });

      const totalBeds = rooms.reduce((a, r) => a + (r.totalBeds || 0), 0);
      const filledBeds = rooms.reduce((a, r) => a + (r.filledBeds || 0), 0);
      const emptyBeds = totalBeds - filledBeds;

      result.totalBeds += totalBeds;
      result.filledBeds += filledBeds;
      result.emptyBeds += emptyBeds;

      const students = await Student.find({ hostelId: h._id });
      result.totalStudents += students.length;

      const fees = await Fee.find({ hostelId: h._id });

      result.totalPayments += fees.reduce((s, f) => s + (f.totalAmount || 0), 0);

      result.pendingPayments += fees
        .filter((f) => f.paymentStatus === "Pending")
        .reduce((s, f) => s + (f.totalAmount || 0), 0);

      result.cashTotal += fees
        .filter((f) => f.paymentMode === "Cash")
        .reduce((s, f) => s + (f.totalAmount || 0), 0);

      result.onlineTotal += fees
        .filter((f) => f.paymentMode === "Online")
        .reduce((s, f) => s + (f.totalAmount || 0), 0);
    }

    res.json(result);

  } catch (err) {
    console.log("Combined Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📊 Get Owner Dashboard Stats
router.get("/owner-dashboard/:hostelId", protect, ownerOnly, async (req, res) => {
  try {
    const { hostelId } = req.params;

    const rooms = await Room.find({ hostelId });
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0);
    const filledBeds = rooms.reduce((sum, r) => sum + r.filledBeds, 0);
    const emptyBeds = totalBeds - filledBeds;

    const students = await Student.find({ hostelId });
    const studentsCount = students.length;

    res.json({
      totalRooms,
      totalBeds,
      filledBeds,
      emptyBeds,
      studentsCount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/fees/:hostelId", protect, ownerOnly, async (req, res) => {
  try {
    const { hostelId } = req.params;
    const fees = await Fee.find({ hostelId });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/students/:hostelId", protect, ownerOnly, async (req, res) => {
  try {
    const { hostelId } = req.params;
    const students = await Student.find({ hostelId });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
