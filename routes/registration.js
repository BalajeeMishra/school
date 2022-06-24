const express = require("express");
const router = express.Router();
const Detail = require("../models/Detail");
const { isLoggedIn } = require("../middleware");
const { isAdmin } = require("../middleware");
const RegistrationStatus = require("../models/registration");
// /registration/of_student
router.get("/of_student", isLoggedIn, isAdmin, async (req, res) => {
  const totalRegistration = await RegistrationStatus.find({});
  res.render("adminrelated/newRegistration", { totalRegistration });
});

module.exports = router;
