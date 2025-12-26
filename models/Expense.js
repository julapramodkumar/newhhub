const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto calculate total
expenseSchema.pre("save", function (next) {
  this.total = this.quantity * this.price;
  next();
});

module.exports = mongoose.model("Expense", expenseSchema);