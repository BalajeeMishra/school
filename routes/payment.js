const express = require("express");
const router = express.Router();
const paypal = require("paypal-rest-sdk");
const RegistrationStatus = require("../models/registration");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AaDj1YMVe67NhG_QpfHP9gHqAFkk39joVHT6FXvPYWdJv91gbARHR-zq55BIYjVGY2ElUzo5F77EHo7l",
  client_secret:
    "EMz97ri2AOTA06J4SIcORBpaQK4FrZOYI9RvLKLlwuzNO6dnpUY5L5O05gbaQGrX2xdls9UqIgTVny1G",
});

const moment = require("moment");
var date = new Date();
router.get("/success", async (req, res) => {
  //this part we need to feex i  mean  on other places....
  const registrationNumber = req.user.name + Date.now();
  const registration = await RegistrationStatus.find({ userId: req.user._id });
  RegistrationStatus.findOneAndUpdate(
    { userId: req.user._id },
    {
      status: true,
      registrationNumber: registrationNumber,
      payment_timing: date,
    },
    { upsert: true },
    async function (err, doc) {
      if (err) return res.send(500, { error: err });
    }
  );

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "1.00",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async (error, payment) => {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        // await Cart.deleteMany({});
        // req.flash("success", " order placed ");
        res.render("successofregis", { registrationNumber });
      }
    }
  );
});

router.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: process.env.RETURN_URL || "http://localhost:3000/success",
      cancel_url: process.env.CANCEL_URL || "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: "1.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "1.00",
        },
        description: "This is the payment description.",
      },
    ],
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

router.get("/cancel", (req, res) => {
  //   req.flash("error", "payment cancelled try again");
  //   res.redirect("/");
  res.send("done");
});
module.exports = router;
