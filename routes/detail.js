const express = require("express");
const router = express.Router();
const Detail = require("../models/Detail");
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../controlError/wrapasync");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });
const MonthlyPlan = require("../models/monthly");
const Dues = require("../models/dues");
const RegistrationStatus = require("../models/registration");

//just a home route type where we get redirected after submission of your detail.
router.get(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    res.render("afterdetail");
  })
);

//route for adding your detail before admission.
router.get(
  "/addmoreinformation",
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    var detail = await Detail.find({ userId: req.user._id });
    if (typeof detail[0] !== "undefined") {
      // var time=moment(detail[0].birthday).utc().format('YYYY/MM/DD');
      var date = new Date(detail[0].birthday);
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var todayDate = String(date.getDate()).padStart(2, "0");
      var datePattern = year + "-" + month + "-" + todayDate;
    }
    res.render("addmoreinformation", {
      name: req.user.name,
    });
  })
);

//posting value here of your detail.
router.post(
  "/addmoreinformation",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    const user = req.user._id;
    const { age, mobno, birthday, gender, classofs, address, image } = req.body;
    const information = new Detail({
      age,
      mobno,
      birthday,
      gender,
      userId: user,
      classofs,
      address,
      image,
      name: req.user.name,
    });
    //below if block is for checking whether your uploaded file is valid or not.
    if (typeof req.file != undefined) {
      const { path, filename } = req.file;
      information.images = {
        url: path,
        filename,
      };
    }
    await information.save();
    //other part i  mean after adding all your details.
    var fees;
    const nameDetail = await Detail.find({ userId: req.user._id });
    const standard = nameDetail[0].classofs;
    const monthlyplan = await MonthlyPlan.find({});
    const monthly = monthlyplan[0].monthly;
    monthly.forEach((e) => {
      if (e.class == standard) {
        fees = e.fees;
      }
    });

    //above after saving information i have found fees for him/her(monthlyplan).
    //then instantiate dues page for him taking valuetopaid and monthlyfees.
    const newDuesPage = new Dues({ userId: req.user._id, name: req.user.name });
    const arrayObj = [{}];
    arrayObj[0].val = fees;
    newDuesPage.feesDetail = await arrayObj.map((f) => ({
      valuetopaid: f.val,
      yourmonthlyfees: f.val,
    }));
    await newDuesPage.save();
    //instantiate registrationstatus which will be confirmed from admin side
    const newRegistrationStatus = new RegistrationStatus({
      userId: req.user._id,
      name: req.user.name,
      mobno,
    });
    await newRegistrationStatus.save();
  })
);
module.exports = router;
