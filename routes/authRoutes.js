

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SuperAdmin = require("../models/SuperAdmin");
const Admin = require("../models/Admin");
const Owner=require("../models/Owner")
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Hostel = require("../models/Hostel");


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Check SuperAdmin
    const superAdmin = await SuperAdmin.findOne({ email });
    if (superAdmin && (await bcrypt.compare(password, superAdmin.password))) {
      const token = jwt.sign(
        { id: superAdmin._id, role: "superadmin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        success: true,
         id: superAdmin._id, 
        role: "superadmin",
        message: "SuperAdmin login successful",
        token,
        email: superAdmin.email,
      });
    }

 // ✅ Check owner
  // const owner = await Owner.findOne({ ownerEmail: email });

  //     if (owner) {
  //     const matchPassword = await bcrypt.compare(password, owner.ownerPassword);
  //     if (matchPassword) {
  //       const token = jwt.sign(
  //         { id: owner._id, role: "owner" },
  //         process.env.JWT_SECRET,
  //         { expiresIn: "7d" }
  //       );

  //       return res.json({
  //         success: true,
  //         _id: owner._id,
  //         role: "owner",
  //         message: "Owner login successful",
  //         token,
  //         ownerEmail: owner.ownerEmail,
  //       });
  //     }
  //   }

  // ✅ Check owner
const owner = await Owner.findOne({ ownerEmail: email });

if (owner) {
  const matchPassword = await bcrypt.compare(password, owner.ownerPassword);
  if (!matchPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 🔴 CHECK IF ANY HOSTEL IS ACTIVE
  const activeHostel = await Hostel.findOne({
    ownerId: owner._id,
    subscriptionStatus: "ACTIVE",
  });

  if (!activeHostel) {
    return res.status(403).json({
      message: "Owner access blocked. No active hostel subscription.",
    });
  }

  const token = jwt.sign(
    { id: owner._id, role: "owner" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    success: true,
    _id: owner._id,
    role: "owner",
    token,
    ownerEmail: owner.ownerEmail,
  });
}

    // ✅ Check Admin
    // const admin = await Admin.findOne({ adminEmail: email });
    // if (admin && (await bcrypt.compare(password, admin.adminPassword))) {
    //   const token = jwt.sign(
    //     { id: admin._id, role: "admin" },
    //     process.env.JWT_SECRET,
    //     { expiresIn: "7d" }
    //   );
    //   return res.json({
    //     success: true,
    //      id: admin._id,
    //     role: "admin",
    //     message: "Admin login successful",
    //     token,
    //     email: admin.adminEmail,
    //      hostelId: admin.hostelId,
    //   });
    // }

    // ✅ Check Admin
const admin = await Admin.findOne({ adminEmail: email });

if (admin && (await bcrypt.compare(password, admin.adminPassword))) {

  const hostel = await Hostel.findById(admin.hostelId);

  // 🔴 BLOCK ADMIN LOGIN
  if (!hostel || hostel.subscriptionStatus === "BLOCKED") {
    return res.status(403).json({
      message: "Hostel subscription inactive. Contact SuperAdmin.",
    });
  }

  const token = jwt.sign(
    { id: admin._id, role: "admin", hostelId: admin.hostelId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    success: true,
    id: admin._id,
    role: "admin",
    token,
    email: admin.adminEmail,
    hostelId: admin.hostelId,
  });
}

    res.json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



router.put("/change-password", protect, adminOnly, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    // Compare old password
    const validOldPwd = await bcrypt.compare(oldPassword, admin.adminPassword);
    if (!validOldPwd) {
      return res.json({ success: false, message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPwd = await bcrypt.hash(newPassword, 10);
    admin.adminPassword = hashedPwd;

    await admin.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.log("Password change error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
