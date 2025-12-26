const Fee = require("../models/Fees");
const Student = require("../models/Student");
const moment = require("moment");

async function generateMonthlyFees() {
  const today = moment().startOf("day");


  const students = await Student.find().populate("roomId");

  let created = 0;

  for (const student of students) {
    if (!student.roomId) continue;

    const lastFee = await Fee.findOne({ studentId: student._id })
      .sort({ feeDueDate: -1 });

    if (!lastFee) continue;
//     console.log("---- Checking student ----");
// console.log("Student:", student.name);
// console.log("Last fee due:", moment(lastFee.feeDueDate).format("YYYY-MM-DD"));
// console.log("Today:", today.format("YYYY-MM-DD"));

    if (moment(lastFee.feeDueDate).isAfter(today)) continue;

    const startDate = moment(lastFee.feeDueDate);

    const exists = await Fee.findOne({
      studentId: student._id,
      month: startDate.format("MMMM YYYY"),
    });

    if (!exists) {
      await Fee.create({
        hostelId: student.hostelId,
        studentId: student._id,
        roomId: student.roomId._id,

        studentName: student.name,
        roomNumber: student.roomId.roomNumber,
        bedNumber: student.bedNumber,
        mobile: student.mobile,

        month: startDate.format("MMMM YYYY"),
        monthNumber: startDate.month() + 1,
        year: startDate.year(),

        totalAmount: student.roomId.rentPerMonth,
        pendingAmount: student.roomId.rentPerMonth,

        paymentStatus: "Pending",
        paymentMode: "N/A",

        feeStartDate: startDate.toDate(),
        feeDueDate: startDate.clone().add(1, "month").toDate(),
      });

      created++;
    }
  }

  console.log(`✅ ${created} monthly fees generated`);
}

module.exports = { generateMonthlyFees };
