const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Fee = require("../models/Fees");

router.get("/download/:feeId", async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.feeId);
    if (!fee) return res.status(404).json({ message: "Receipt not found" });

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${fee.studentName}_${fee.month}.pdf`
    );

    doc.pipe(res);

    // 🔹 Title
    doc.fontSize(20).text("Hostel Fee Receipt", { align: "center" });
    doc.moveDown(2);

    // 🔹 Receipt Details
    doc.fontSize(12);
    doc.text(`Student Name : ${fee.studentName}`);
    doc.text(`Room Number  : ${fee.roomNumber}`);
    doc.text(`Bed Number   : ${fee.bedNumber}`);
    doc.text(`Month Paid   : ${fee.month}`);
    doc.text(`Amount Paid : ₹${fee.totalAmount}`);
    doc.text(`Payment Mode: ${fee.paymentMode}`);
    doc.text(`Paid Date   : ${fee.paidDate?.toDateString() || "N/A"}`);

    doc.moveDown(2);
    doc.text("Thank you for your payment!", { align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Receipt generation failed" });
  }
});

module.exports = router;
