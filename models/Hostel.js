const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema({
  hostelName: String,
  location: String,

  
  // 🔑 RAZORPAY CONFIG PER HOSTEL
  razorpayKeyId: { type: String },
  razorpayKeySecret: { type: String },
  
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner" },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    subscriptionStatus: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    default: "ACTIVE",
  },
});

module.exports = mongoose.model("Hostel", hostelSchema);
