const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminName: { type: String, required: true },
  adminEmail: { type: String, required: true, unique: true },
  adminPassword: { type: String, required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
   expoPushToken: { type: String },
});

module.exports = mongoose.model("Admin", adminSchema);
