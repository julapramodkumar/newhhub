// const mongoose = require("mongoose");

// const feeSchema = new mongoose.Schema({
//   hostelId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Hostel",
//     required: true,
//   },
//   studentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Student",
//     required: true,
//   },
//   roomId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Room",
//     required: true,
//   },
//   studentName: {  // ✅ add this field
//     type: String,
//     required: true,
//   },
//   roomNumber: {   // optional, but useful for display
//     type: String,
//   },
//   bedNumber: {
//     type: String,
//   },
//   month: {
//     type: Number, // Example: "November 2025"
//     required: true,
//   },
//   year: {
//   type: Number,
//   required: true,
// },
//   totalAmount: {
//     type: Number,
//     required: true,
//   },
//   pendingAmount: {
//     type: Number,
//     default: 0,
//   },
//   paymentStatus: {
//     type: String,
//     enum: ["Paid", "Pending"],
//     default: "Pending",
//   },
//   paymentMode: {
//     type: String,
//     enum: ["Cash", "Online", "N/A"],
//     default: "N/A",
//   },
//   paymentDate: {
//     type: Date,
//   },
//   remarks: {
//     type: String,
//   },
// });

// module.exports = mongoose.model("Fee", feeSchema);



























const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
  },
  bedNumber: {
    type: String,
  },
  joiningDate: { type: Date },

  month: {
    type: String, // ✅ FIXED: store "November 2025" as a string
    required: true,
  },
  monthNumber: {
    type: Number, // ✅ numeric month (1–12) for sorting
  },
  year: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  pendingAmount: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending",
  },
  paymentMode: {
    type: String,
    enum: ["Cash", "Online", "N/A"],
    default: "N/A",
  },
   feeStartDate: Date,   // ⭐ joining date logic
  feeDueDate: Date,     // ⭐ next cycle date


  paymentDate: {
    type: Date,
  },
  mobile:{ type: String },
  remarks: {
    type: String,
  },
   referenceId: { // <-- Add this field for Razorpay payment ID
    type: String,
  },
}, { timestamps: true });

// 🔐 VERY IMPORTANT SAFETY
feeSchema.index(
  { studentId: 1, feeStartDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("Fee", feeSchema);
