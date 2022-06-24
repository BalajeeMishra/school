const express = require("express");
const router = express.Router();
const Detail = require("../models/Detail");
const { isLoggedIn } = require("../middleware");
const { isAdmin } = require("../middleware");
const wrapAsync = require("../controlError/wrapasync");
const User = require("../models/user");
const Mark = require("../models/studentadminside");
var done;

router.get("/", isLoggedIn, isAdmin, (req, res) => {
  res.send("result uploaded successfully...");
});

router.get(
  "/student",
  isLoggedIn,
  isAdmin,
  wrapAsync(async (req, res, next) => {
    res.render("adminrelated/fillinformation");
  })
);
router.post(
  "/student",
  isLoggedIn,
  isAdmin,
  wrapAsync(async (req, res, next) => {
    done = req.body;

    res.redirect("/result/detail");
  })
);
// redirect of last route
router.get("/detail", isLoggedIn, isAdmin, async (req, res) => {
  var selected_student = await Detail.find(done);
  res.render("adminrelated/aboutstudent", { selected_student });
});
router.get("/markfillup/:id", isLoggedIn, isAdmin, async (req, res) => {
  res.render("adminrelated/studentmarkfillup", {
    id: req.params.id,
  });
});
router.post("/markfillup/:id", isLoggedIn, isAdmin, async (req, res) => {
  const arrayObj = [];
  for (var i in req.body) {
    arrayObj.push({ key: i, val: req.body[i] });
  }
  const userMark = await User.find({ _id: req.params.id });
  const newMark = new Mark({ userId: req.params.id, name: userMark[0].name });
  newMark.markDetail = await arrayObj.map((f) => ({
    subject: f.key,
    mark: f.val,
  }));
  await newMark.save();
  Detail.findOneAndUpdate(
    { userId: req.params.id },
    { resultShow: true },
    { upsert: true },
    function (err, doc) {
      if (err) return res.send(500, { error: err });

      return res.redirect("/result/detail");
    }
  );

  // console.log(update)
  // req.flash("success", "Result added successfully!")
});

router.get(
  "/delete-result/:id",
  isLoggedIn,
  isAdmin,
  wrapAsync(async (req, res, next) => {
    const result = await Mark.find({ userId: req.params.id });
    const deletedResult = await Mark.findByIdAndDelete(result[0]._id);
    Detail.findOneAndUpdate(
      { userId: req.params.id },
      { resultShow: false },
      { upsert: true },
      function (err, doc) {
        if (err) return res.send(500, { error: err });
        return res.redirect("/result/detail");
      }
    );
  })
);

module.exports = router;
