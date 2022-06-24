//setting schema for monthly plan

const mongoose = require("mongoose");
const MonthlySchema = new mongoose.Schema({
  monthly: [
    {
      class: String,
      fees: Number,
      _id: false,
    },
  ],
  listed: {
    type: Boolean,
    default: false,
  },
});

const MonthlyPlan = mongoose.model("MonthlyPlan", MonthlySchema);
module.exports = MonthlyPlan;
