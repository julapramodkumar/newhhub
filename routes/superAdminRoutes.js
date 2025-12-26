const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Hostel = require("../models/Hostel");
const Admin = require("../models/Admin");
const Owner=require("../models/Owner")
const mongoose = require("mongoose"); 
const { protect, superadminOnly,ownerOnly } = require("../middleware/authMiddleware");

router.post("/add-owner", protect, superadminOnly, async (req, res) => {
  try {
    const { ownerName, ownerEmail, ownerPassword } = req.body;

    const existing = await Owner.findOne({ ownerEmail });
    if (existing) return res.status(400).json({ message: "Owner already exists" });

    const hashed = await bcrypt.hash(ownerPassword, 10);

    const newOwner = await Owner.create({
      ownerName,
      ownerEmail,
      ownerPassword: hashed
    });

    res.json({ success: true, message: "Owner added", owner: newOwner });

  } catch (err) {
    console.log("ADD OWNER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Add Hostel
// router.post("/add-hostel", protect, superadminOnly, async (req, res) => {
//   try {
//     const { hostelName, location } = req.body;
//     if (!hostelName || !location) {
//       return res.status(400).json({ success: false, message: "All fields required" });
//     }

//     const existingHostel = await Hostel.findOne({ hostelName });
//     if (existingHostel) {
//       return res.status(400).json({ success: false, message: "Hostel already exists" });
//     }

//     const newHostel = new Hostel({ hostelName, location });
//     await newHostel.save();

//     res.json({ success: true, message: "Hostel added successfully", hostel: newHostel });
//   } catch (err) {
//     console.error("Add Hostel Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
router.post("/add-hostel", protect, superadminOnly, async (req, res) => {
  try {
    const { hostelName, location, ownerId, razorpayKeyId,
      razorpayKeySecret} = req.body;

    const hostel = await Hostel.create({ hostelName, location, ownerId, razorpayKeyId,
      razorpayKeySecret});

    await Owner.findByIdAndUpdate(ownerId, {
      $push: { hostels: hostel._id }
    });

    res.json({ success: true, message: "Hostel added", hostel });

  } catch (err) {
    console.log("ADD HOSTEL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Add Admin for a Hostel
// router.post("/add-admin", protect, superadminOnly, async (req, res) => {
//   try {
//     const { adminName, adminEmail, adminPassword, hostelId } = req.body;

//     if (!adminName || !adminEmail || !adminPassword || !hostelId) {
//       return res.status(400).json({ success: false, message: "All fields required" });
//     }

//     const existingAdmin = await Admin.findOne({ adminEmail });
//     if (existingAdmin) {
//       return res.status(400).json({ success: false, message: "Admin already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(adminPassword, 10);

//     const newAdmin = new Admin({
//       adminName,
//       adminEmail,
//       adminPassword: hashedPassword,
//       hostelId,
//     });

//     await newAdmin.save();

//     res.json({ success: true, message: "Admin added successfully", admin: newAdmin });
//   } catch (err) {
//     console.error("Add Admin Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
router.post("/add-admin", protect, superadminOnly, async (req, res) => {
  try {
    const { adminName, adminEmail, adminPassword, hostelId } = req.body;

    const hashed = await bcrypt.hash(adminPassword, 10);

    const admin = await Admin.create({
      adminName,
      adminEmail,
      adminPassword: hashed,
      hostelId
    });

    await Hostel.findByIdAndUpdate(hostelId, { adminId: admin._id });

    res.json({ success: true, message: "Admin assigned", admin });

  } catch (err) {
    console.log("ADD ADMIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Get All Hostels
// ⭐ SUPERADMIN: Get Hostels by Owner
router.get("/hostels/:ownerId", protect, superadminOnly, async (req, res) => {
  try {
    const { ownerId } = req.params;

    const hostels = await Hostel.find({ ownerId }).select("hostelName _id");

    res.json(hostels);

  } catch (err) {
    console.error("Get Hostels By Owner Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/owners", protect, superadminOnly, async (req, res) => {
  const owners = await Owner.find().select("ownerName ownerEmail");
  res.json(owners);
});


// ✅ GET ALL HOSTELS (FOR SUPERADMIN DASHBOARD)
router.get(
  "/all-hostels",
  protect,
  superadminOnly,
  async (req, res) => {
    try {
      const hostels = await Hostel.find()
        .populate("ownerId", "ownerName ownerEmail")
        .select("hostelName subscriptionStatus ownerId");

      res.json({ success: true, hostels });
    } catch (err) {
      console.error("GET ALL HOSTELS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put("/toggle-hostel/:hostelId", protect, superadminOnly, async (req, res) => {
  try {
    const hostelId = req.params.hostelId;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ message: "Invalid hostel ID" });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    hostel.subscriptionStatus = hostel.subscriptionStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    await hostel.save();

    res.json({ success: true, status: hostel.subscriptionStatus });

  } catch (err) {
    console.error("TOGGLE HOSTEL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
