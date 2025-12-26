const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  month: { type: String, required: true }, // e.g., "October 2025"
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  paidOn: { type: Date },
});

module.exports = mongoose.model("Payment", paymentSchema);
