const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// ✅ Add Expense
router.post("/", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get Monthly Expenses By Hostel
router.get("/:hostelId", async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await Expense.find({
      hostelId: req.params.hostelId,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: 1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;