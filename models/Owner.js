const mongoose = require("mongoose");

const OwnerSchema = new mongoose.Schema({
  ownerName: String,
  ownerEmail: { type: String, unique: true },
  ownerPassword: String,
  role: { type: String, default: "owner" },

  hostels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hostel" }]
});

module.exports = mongoose.model("Owner", OwnerSchema);
