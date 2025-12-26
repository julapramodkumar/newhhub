

const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  roomNumber: { type: String, required: true },
  floorNumber: { type: Number, required: true },
  roomType: { type: String, enum: ["1-share", "2-share", "3-share", "4-share","5-share","6-share","7-share"], required: true },
  totalBeds: { type: Number, required: true },
  filledBeds: { type: Number, default: 0 },
  rentPerMonth: { type: Number, required: true },
  roomCondition:{type : String, enum:["A/C","Non-A/C"], required: true},
  status: {
    type: String,
    enum: ["Available", "Full"],
    default: "Available",
  },
});

module.exports = mongoose.model("Room", roomSchema);
