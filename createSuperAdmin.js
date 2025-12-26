// createSuperAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const readline = require("readline");
const bcrypt = require("bcryptjs");
const SuperAdmin = require("./models/SuperAdmin");

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

const createSuperAdmin = async () => {
  try {
    rl.question("Enter Super Admin Name: ", (name) => {
      rl.question("Enter Super Admin Email: ", (email) => {
        rl.question("Enter Super Admin Password: ", async (password) => {
          if (!name || !email || !password) {
            console.error("⚠️ All fields are required!");
            rl.close();
            process.exit(1);
          }

          // Check if already exists
          const exists = await SuperAdmin.findOne({ email });
          if (exists) {
            console.error("⚠️ A SuperAdmin with this email already exists!");
            rl.close();
            process.exit(1);
          }

          // Hash the password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          // Create SuperAdmin
          const superAdmin = new SuperAdmin({
            name,
            email,
            password: hashedPassword,
            role: "superadmin",
          });

          await superAdmin.save();
          // console.log("✅ SuperAdmin created successfully!");
          rl.close();
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error("❌ Error creating SuperAdmin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
