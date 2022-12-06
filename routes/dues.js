const express = require("express");
const router = express.Router();
const Detail = require("../models/Detail");
const Dues = require("../models/dues");
const MonthlyPlan = require("../models/monthly");
var sessData;
var x = 100;
var date = new Date();
var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";
var n = date.getMonth();
var nameofmonth = month[date.getMonth()];
//route for dues detail
router.get("/detail", async (req, res) => {
  const dues = await Dues.find({ userId: req.user._id });
  res.render("dues", { month, monthbynum: n + 1, dues: dues[0] });
});

// /dues/all route for managing dues after registration
router.get("/all", async (req, res) => {
  const count = req.session.count;
  console.log(req?.user);
  const nameDetail = await Detail.find({ userId: req.user?._id });

  if (typeof nameDetail[0] == "undefined") {
    return res.send("first do your registration");
  }

  const duesDetail = await Dues.find({ userId: req.user._id });
  //back dues
  const duesBack = duesDetail[0].feesDetail[0].dues;
  const monthlyplan = await MonthlyPlan.find({});
  const monthly = monthlyplan[0].monthly;
  const standard = nameDetail[0].classofs;
  //value to paid
  var fees = duesDetail[0].feesDetail[0].valuetopaid;
  const total = duesBack + fees;
  const comment_id = duesDetail[0].feesDetail[0]._id;

  Dues.update(
    { "feesDetail._id": comment_id },
    {
      $set: {
        "feesDetail.$.total": total,
      },
    },
    function (err, model) {
      if (err) {
        return res.send(err);
      }
      return res.render("payment", {
        nameofmonth,
        fees,
        duesBack,
        total,
        count,
      });
    }
  );
});

module.exports = router;
