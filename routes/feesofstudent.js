const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const { isAdmin } = require("../middleware");
const wrapAsync = require("../controlError/wrapasync");
const MonthlyPlan = require("../models/monthly");

router.get(
  "/fees-menu",
  isLoggedIn,
  isAdmin,
  wrapAsync(async (req, res) => {
    const fees_setting = [
      {
        class: "First",
        fees: 10,
      },
      {
        class: "Second",
        fees: 20,
      },
      {
        class: "Third",
        fees: 30,
      },
      {
        class: "Fourth",
        fees: 40,
      },
      {
        class: "Fifth",
        fees: 50,
      },
      {
        class: "Sixth",
        fees: 60,
      },
      {
        class: "Seventh",
        fees: 70,
      },
      {
        class: "Eighth",
        fees: 80,
      },
      {
        class: "Ninth",
        fees: 90,
      },
      {
        class: "Tenth",
        fees: 100,
      },
    ];

    if ((await MonthlyPlan.find({})).length == 0) {
      const newMonthlyPlan = new MonthlyPlan({});
      newMonthlyPlan.monthly = await fees_setting.map((f) => ({
        class: f.class,
        fees: f.fees,
      }));
      await newMonthlyPlan.save();
      MonthlyPlan.findOneAndUpdate(
        { _id: newMonthlyPlan._id },
        { listed: true },
        { upsert: true },
        function (err, doc) {
          if (err) return res.send(500, { error: err });
          return res.send("hello");
        }
      );
    }
    return res.send("already created");
  })
);

module.exports = router;
