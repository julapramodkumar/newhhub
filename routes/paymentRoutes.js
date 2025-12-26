const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
// const Razorpay = require("../config/razorpay");
const Fee = require("../models/Fees");
const Admin = require("../models/Admin");
const Hostel = require("../models/Hostel");
const getRazorpayInstance = require("../utils/getRazorpayInstance");
const { sendPushNotifications } = require("../utils/notification");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ➕ Add Payment
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { studentId, hostelId, month, amount, status } = req.body;

    const existing = await Payment.findOne({ studentId, month });
    if (existing)
      return res.status(400).json({ message: "Payment for this month already exists" });

    const payment = await Payment.create({
      studentId,
      hostelId,
      month,
      amount,
      status,
      paidOn: status === "Paid" ? new Date() : null,
    });

    res.status(201).json({ message: "Payment added successfully", payment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📋 Get all payments by hostel
router.get("/:hostelId", protect, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find({ hostelId: req.params.hostelId }).populate("studentId");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update payment status
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = req.body.status || payment.status;
    payment.paidOn = payment.status === "Paid" ? new Date() : null;
    await payment.save();

    res.json({ message: "Payment updated successfully", payment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Create Razorpay Order
// router.post("/create-order", async (req, res) => {
//   try {
//     const { feeId } = req.body;

//     const fee = await Fee.findById(feeId);
//     if (!fee) {
//       return res.status(404).json({ message: "Fee not found" });
//     }

//     // 🔴 FIX 1: use correct amount field
//     const amount = Number(fee.pendingAmount || fee.totalAmount);

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: "Invalid fee amount" });
//     }

//     // 🔴 FIX 2: receipt length <= 40
//     const receipt = `fee_${fee._id.toString().slice(-8)}`;

//     const order = await Razorpay.orders.create({
//       amount: amount * 100, // paise
//       currency: "INR",
//       receipt,
//       payment_capture: 1,
//     });

//     res.json({
//       success: true,
//       order,
//       key: process.env.RAZORPAY_KEY_ID, // send key to frontend
//     });

//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).json({ message: "Order creation failed" });
//   }
// });

router.post("/create-order", async (req, res) => {
  try {
    const { feeId } = req.body;

    const fee = await Fee.findById(feeId);
    
console.log(fee.paymentStatus); // Paid
console.log(fee.paymentId);     // razorpay_payment_id
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    // 🔑 FETCH HOSTEL
    const hostel = await Hostel.findById(fee.hostelId);
    if (!hostel || !hostel.razorpayKeyId || !hostel.razorpayKeySecret) {
      return res.status(400).json({ message: "Razorpay not configured for this hostel" });
    }
    
console.log("🏨 Hostel:", hostel.hostelName);
console.log("🔑 Using Razorpay Key:", hostel.razorpayKeyId);

    // 🔥 CREATE HOSTEL-SPECIFIC INSTANCE
    const razorpay = getRazorpayInstance(
      hostel.razorpayKeyId,
      hostel.razorpayKeySecret
    );

    const amount = Number(fee.pendingAmount || fee.totalAmount);

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `fee_${fee._id.toString().slice(-8)}`,
    });

    res.json({
      success: true,
      order,
      key: hostel.razorpayKeyId, // 🔥 SEND HOSTEL KEY
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
});
// 🔹 VERIFY PAYMENT
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      feeId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    fee.paymentStatus = "Paid";
    fee.paymentMode = "Online";
    fee.paymentDate = new Date();
    fee.referenceId = razorpay_payment_id;
    await fee.save();
    // Inside verify-payment
if (fee.paymentStatus === "Paid") {
  const admins = await Admin.find({ hostelId: fee.hostelId, expoPushToken: { $exists: true } });
  const messages = admins.map(admin => ({
    to: admin.expoPushToken,
    sound: 'default',
    title: 'Fee Paid ✅',
    body: `${fee.studentName} paid ₹${fee.totalAmount} for ${fee.month}`,
    data: { feeId: fee._id },
  }));
  if (messages.length) await sendPushNotifications(messages);
}

    res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;









































