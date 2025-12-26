

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // ✅ REQUIRED

const studentSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  bedNumber: { type: Number, required: true }, // 1,2,3,...
  name: { type: String, required: true },
  age: { type: Number },
  mobile: { type: String, required: true, unique: true },
  
  address: { type: String },
  parentContact: { type: String },
  joiningDate: { type: Date, required: true },
  leavingDate: { type: Date },
   deposit: { type: Number, default: 0, min: 0 },
  refund: { type: Number, default: 0, min: 0 },
  studentPhoto: [String],
clickPhoto: [String],

  // 🔐 AUTH FIELDS
  password: { type: String, required: true },
  role: { type: String, default: "student" },
    // ✅ ADD THIS
  isPasswordChanged: {
    type: Boolean,
    default: false,
  },
    expoPushToken: { type: String },
}, { timestamps: true });

/* Hash password */
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


module.exports = mongoose.model("Student", studentSchema);
