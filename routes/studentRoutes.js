



const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const Student = require("../models/Student");
const Room = require("../models/Room");
const Fee = require("../models/Fees");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Hostel = require("../models/Hostel");




// ✅ Fee auto-generator function (move later to utils/feeGenerator.js)
// async function generateInitialFeesForNewStudent(student) {
//   try {
//     const room = await Room.findById(student.roomId);
//     if (!room) return;

//     const rent = room.rentPerMonth;
//     const joiningMonth = moment(student.joiningDate).startOf("month");
//     const currentMonth = moment().startOf("month");
//     let monthIterator = joiningMonth.clone();

//     while (monthIterator.isSameOrBefore(currentMonth, "month")) {
//       const exists = await Fee.findOne({
//         studentId: student._id,
//         month: monthIterator.format("MMMM YYYY"),
//       });

//       if (!exists) {
//         await Fee.create({
//           hostelId: student.hostelId,
//           studentId: student._id,
//           roomId: room._id,
//           studentName: student.name,
//           roomNumber: room.roomNumber,
//           bedNumber: student.bedNumber,
//           month: monthIterator.format("MMMM YYYY"),
//           monthNumber: monthIterator.month() + 1,
//           year: monthIterator.year(),
//           totalAmount: rent,
//           pendingAmount: rent,
//           paymentStatus: "Pending",
//           paymentMode: "N/A",
//           joiningDate: student.joiningDate,
//           mobile: student.mobile || "N/A",
//         });
//       }
//       monthIterator.add(1, "month");
//     }

//     // console.log(`✅ Fees auto-generated for ${student.name}`);
//   } catch (error) {
//     console.error("❌ Error generating initial fees:", error);
//   }
// }
async function generateInitialFeesForNewStudent(student) {
  const room = await Room.findById(student.roomId);
  if (!room) return;

  const start = moment(student.joiningDate);

  await Fee.create({
    hostelId: student.hostelId,
    studentId: student._id,
    roomId: room._id,

    studentName: student.name,
    roomNumber: room.roomNumber,
    bedNumber: student.bedNumber,
    mobile: student.mobile,

    month: start.format("MMMM YYYY"),
    monthNumber: start.month() + 1,
    year: start.year(),

    totalAmount: room.rentPerMonth,
    pendingAmount: room.rentPerMonth,

    paymentStatus: "Pending",
    paymentMode: "N/A",

    feeStartDate: start.toDate(),
    feeDueDate: start.clone().add(1, "month").toDate(), // ⭐ correct
    joiningDate: student.joiningDate,
  });
}





if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ✅ Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });



// ✅ POST /api/students
router.post("/",  upload.fields([
    { name: "studentPhoto", maxCount: 2 }, // camera photo
    { name: "clickPhoto", maxCount: 2 },  // aadhar upload
  ]), async (req, res) => {
  try {

    const {
      hostelId,
      roomId,
      bedNumber,
      name,
      age,
      mobile,
      address,
      parentContact,
      joiningDate,
      leavingDate,
      deposit,
      refund
    } = req.body;


//   let studentPhotoPath = null;
// let clickPhotoPath = null;
let studentPhotoPaths = [];
let clickPhotoPaths = [];

// // ✅ Correct handling for upload.fields()
//  if (req.files?.studentPhoto) {
//       studentPhotoPaths = req.files.studentPhoto.map(f => `/uploads/${f.filename}`);
//     }
//     if (req.files?.clickPhoto) {
//       clickPhotoPaths = req.files.clickPhoto.map(f => `/uploads/${f.filename}`);
//     }
//   // Ensure at least one image is uploaded
//     if (studentPhotoPaths.length === 0 && clickPhotoPaths.length === 0) {
//       return res.status(400).json({
//         message: "Please upload at least one image (student photo or click photo)",
//       });
//     }
//     // Fallback: client may send base64 in studentPhotoBase64 + studentPhotoMime
//     if (!studentPhotoPaths && req.body) {
//       // Case 1: explicit base64 field
//       if (req.body.studentPhotoBase64) {
//         try {
//           const base64Data = req.body.studentPhotoBase64;
//           const mime = req.body.studentPhotoMime || "image/jpeg";
//           const ext = (mime.split("/")[1] || "jpg").split(";")[0];
//           const filename = `student-${Date.now()}.${ext}`;
//           const filePath = path.join("uploads", filename);
//           fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
//           studentPhotoPaths = `/uploads/${filename}`;
//           console.log("✅ Saved base64 image to:", studentPhotoPath);
//         } catch (e) {
//           console.error("Failed to save base64 image:", e);
//         }
//       } else if (typeof req.body.studentPhoto === "string" && req.body.studentPhoto.startsWith("data:")) {
//         // Case 2: client sent a data URI string in studentPhoto
//         try {
//           const dataUri = req.body.studentPhoto;
//           const parts = dataUri.split(',');
//           const meta = parts[0];
//           const base64Data = parts[1];
//           const mimeMatch = meta.match(/data:(.*);base64/);
//           const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
//           const ext = (mime.split('/')[1] || 'jpg').split(';')[0];
//           const filename = `student-${Date.now()}.${ext}`;
//           const filePath = path.join('uploads', filename);
//           fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
//           studentPhotoPaths = `/uploads/${filename}`;
//           console.log('✅ Saved dataURI image to:', studentPhotoPaths);
//         } catch (e) {
//           console.error('Failed to save dataURI image:', e);
//         }
//       }
//     }

// ✅ Handle uploaded files
if (req.files?.studentPhoto) {
  studentPhotoPaths = req.files.studentPhoto.map(f => `/uploads/${f.filename}`);
}
if (req.files?.clickPhoto) {
  clickPhotoPaths = req.files.clickPhoto.map(f => `/uploads/${f.filename}`);
}

// ✅ Fallback for base64 or data URI if no files uploaded
if (studentPhotoPaths.length === 0 && req.body) {
  if (req.body.studentPhotoBase64) {
    try {
      const base64Data = req.body.studentPhotoBase64;
      const mime = req.body.studentPhotoMime || "image/jpeg";
      const ext = (mime.split("/")[1] || "jpg").split(";")[0];
      const filename = `student-${Date.now()}.${ext}`;
      const filePath = path.join("uploads", filename);
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      studentPhotoPaths = [`/uploads/${filename}`]; // must be array
      console.log("✅ Saved base64 image to:", studentPhotoPaths);
    } catch (e) {
      console.error("Failed to save base64 image:", e);
    }
  } else if (typeof req.body.studentPhoto === "string" && req.body.studentPhoto.startsWith("data:")) {
    try {
      const dataUri = req.body.studentPhoto;
      const parts = dataUri.split(',');
      const meta = parts[0];
      const base64Data = parts[1];
      const mimeMatch = meta.match(/data:(.*);base64/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const ext = (mime.split('/')[1] || 'jpg').split(';')[0];
      const filename = `student-${Date.now()}.${ext}`;
      const filePath = path.join('uploads', filename);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      studentPhotoPaths = [`/uploads/${filename}`]; // must be array
      console.log('✅ Saved dataURI image to:', studentPhotoPaths);
    } catch (e) {
      console.error('Failed to save dataURI image:', e);
    }
  }
}

// ✅ Ensure at least one image
if (studentPhotoPaths.length === 0 && clickPhotoPaths.length === 0) {
  return res.status(400).json({
    message: "Please upload at least one image (student photo or click photo)",
  });
}

  // Optional: convert strings to numbers
    const depositNum = deposit ? parseFloat(deposit) : 0;
    const refundNum = refund ? parseFloat(refund) : 0;

    const student = new Student({
      hostelId,
      roomId,
      bedNumber,
      name,
      age,
      mobile,
      address,
      parentContact,
      joiningDate,
      leavingDate,
      deposit: depositNum,
      refund: refundNum,
      studentPhoto: studentPhotoPaths,
      clickPhoto: clickPhotoPaths,
       password: "1234",
        isPasswordChanged: false, 
    });

    await student.save();

    // Update room's filledBeds
    const room = await Room.findById(roomId);
    if (room) {
      room.filledBeds += 1;
      if (room.filledBeds >= room.totalBeds) room.status = "Full";
      await room.save();
    }

      // ✅ Auto-generate fees for new student
    await generateInitialFeesForNewStudent(student);


    res.status(200).json({
      message: "Student added successfully ✅",
      student,
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ GET available rooms only
router.get("/available-rooms/:hostelId", async (req, res) => {
  try {
    const rooms = await Room.find({
      hostelId: req.params.hostelId,
      status: "Available", // 👈 Only show available rooms
    });
    res.json(rooms);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});


// ✅ Change Student Room with fee check
router.put("/:id/change-room", async (req, res) => {
  try {
    const { newRoomId, newBedNumber } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 🔍 Check if student has any pending fees
    const pendingFees = await Fee.find({ studentId: student._id, paymentStatus: "Pending" });
    if (pendingFees.length > 0) {
      return res.status(400).json({
        message: "Cannot change room. Student has pending fees to be paid.",
      });
    }

    const oldRoom = await Room.findById(student.roomId);
    const newRoom = await Room.findById(newRoomId);
    if (!newRoom) return res.status(404).json({ message: "New room not found" });

    // 🏠 Free up old room bed
    if (oldRoom) {
      oldRoom.filledBeds = Math.max(0, oldRoom.filledBeds - 1);
      if (oldRoom.filledBeds < oldRoom.totalBeds) oldRoom.status = "Available";
      await oldRoom.save();
    }

    // 🏠 Occupy new room bed
    newRoom.filledBeds += 1;
    if (newRoom.filledBeds >= newRoom.totalBeds) newRoom.status = "Full";
    await newRoom.save();

    // 👤 Update student info
    student.roomId = newRoomId;
    student.bedNumber = newBedNumber;
    await student.save();

    res.json({ message: "Room changed successfully ✅", student, newRoom });
  } catch (error) {
    console.error("Error changing room:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ✅ GET all students for a hostel
router.get("/by-hostel/:hostelId", async (req, res) => {
  try {
    const students = await Student.find({ hostelId: req.params.hostelId })
      .populate("roomId", "roomNumber rentPerMonth") // optional
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ message: "Error fetching students" });
  }
});

/**
 * ✅ STUDENT CHANGE PASSWORD
 * PUT /api/students/change-password
 */
router.put("/change-password", async (req, res) => {
  try {
    const { studentId, oldPassword, newPassword } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    student.password = newPassword; // auto-hashed by pre-save hook
     student.isPasswordChanged = true; 
    await student.save();

    res.json({ message: "Password changed successfully ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Update student (PUT /api/students/:id)
router.put("/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStudent)
      return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student updated ✅", student: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🧹 Delete all fee records linked to this student
    await Fee.deleteMany({ studentId: student._id });

    // 🏠 Update the associated room (free up bed)
    if (student.roomId) {
      const room = await Room.findById(student.roomId);
      if (room) {
        // Free up one bed
        room.filledBeds = Math.max(0, room.filledBeds - 1);

        // Update room availability
        if (room.filledBeds < room.totalBeds) {
          room.status = "Available";
        }

        await room.save();
      }
    }

    // 🗑️ Finally delete the student
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      message: "Student deleted successfully ✅ (with fee records cleared)",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// router.post("/student-login", async (req, res) => {
//   try {
//     const { mobile, password } = req.body;

//     const student = await Student.findOne({ mobile });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const isMatch = await bcrypt.compare(password, student.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     const token = jwt.sign(
//       {
//         id: student._id,
//         role: "student",
//         hostelId: student.hostelId,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       message: "Login successful ✅",
//       token,
//       student: {
//         id: student._id,
//         name: student.name,
//         mobile: student.mobile,
//         hostelId: student.hostelId,
//           isPasswordChanged: student.isPasswordChanged,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.post("/student-login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const student = await Student.findOne({ mobile });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const hostel = await Hostel.findById(student.hostelId);

    // 🔴 BLOCK STUDENT LOGIN
    if (!hostel || hostel.subscriptionStatus === "BLOCKED") {
      return res.status(403).json({
        message: "Hostel access disabled. Please contact admin.",
      });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: "student",
        hostelId: student.hostelId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful ✅",
      token,
      student: {
        id: student._id,
        name: student.name,
        mobile: student.mobile,
        hostelId: student.hostelId,
        isPasswordChanged: student.isPasswordChanged,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
