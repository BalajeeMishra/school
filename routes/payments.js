const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Dues = require("../models/dues");
var pdf = require("html-pdf");
const path = require("path");
var ejs = require("ejs");
const RegistrationStatus = require("../models/registration");
const { isLoggedIn } = require("../middleware");
const { isAdmin } = require("../middleware");
var sessData;
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

var razorpay = new Razorpay({
  key_id: "rzp_test_OPoBXNxk6Zaego",
  key_secret: "zN3Fnv7AZ3pahjdQklYGTPA8",
});
//amount to pay
router.post("/order", async (req, res) => {
  const { data } = req.body;
  // amount: data.paided,
  var options = {
    amount: "20", // amount in the smallest currency unit
    currency: "INR",
  };
  razorpay.orders.create(options, (err, order) => {
    res.json(order);
  });
});
//callback url from payment.ejs
router.post("/is-order-complete", async (req, res) => {
  const duesDetail = await Dues.find({ userId: req.user._id });
  const comment_id = duesDetail[0].feesDetail[0]._id;
  const total = duesDetail[0].feesDetail[0].total;
  const youhvtpft = duesDetail[0].feesDetail[0].total; //you have to pay for current month
  const totalpaidedyet = duesDetail[0].feesDetail[0].totalpaidedyet;
  razorpay.payments
    .fetch(req.body.razorpay_payment_id)
    .then((paymentDocument) => {
      if (paymentDocument.status == "captured") {
        sessData = req.session;
        sessData.count = 1;
        const amount = paymentDocument.amount;
        const valuetoenter = total - amount / 100;
        Dues.update(
          { "feesDetail._id": comment_id },
          {
            $set: {
              "feesDetail.$.total": valuetoenter,
              "feesDetail.$.dues": valuetoenter,
              "feesDetail.$.paided": amount / 100,
              "feesDetail.$.valuetopaid": 0,
              "feesDetail.$.totalpaidedyet": totalpaidedyet + amount / 100,
            },
          },
          function (err, model) {
            if (err) {
              return res.send(err);
            }
          }
        );
        return res.redirect("/payment/pdf_detail");
      }
      return res.send("cancel");
    });
});

//for getting payment detail
router.get("/pdf_detail", async (req, res) => {
  const duesDetail = await Dues.find({ userId: req.user._id });
  const pdfName = duesDetail.pdf_path;
  if (pdfName) {
    return res.render("paymentShow.ejs", { fileName: pdfName });
  }
  const { paymentDetail } = duesDetail[0];
  const fileName = duesDetail[0].name + Date.now() + ".pdf";
  const data = {
    currentUser: req.user,
    success: 0,
    error: 0,
    payment: paymentDetail,
  };
  var m = __dirname.slice(0, __dirname.length - 7);
  ejs.renderFile(
    path.join(
      __dirname.slice(0, __dirname.length - 7),
      "views/paymentDetail.ejs"
    ),
    data,
    {},
    function (err, str) {
      if (err) {
        console.log(err);
        return res.send(err).status(400);
      }

      // str now contains your rendered html
      pdf.create(str).toFile(`${m}/public/${fileName}`, function (err, data) {
        if (err) return res.send(err);
        Dues.findOneAndUpdate(
          { userId: req.user._id },
          { pdf_path: fileName },
          { upsert: true },
          async function (err, doc) {
            if (err) return res.send(500, { error: err });
            return res.render("paymentShow.ejs", { fileName });
          }
        );
      });
    }
  );
});

//fees at admin(i mean submission of fees at admin)
router.get("/entered_detail", isLoggedIn, isAdmin, async (req, res) => {
  res.render("adminrelated/feesatadmin");
});
//managing post after admin request for fee submission
router.post("/entered_detail", async (req, res) => {
  const findByRegistration = await RegistrationStatus.find(req.body);
  res.redirect("/dues/all");
});

module.exports = router;
