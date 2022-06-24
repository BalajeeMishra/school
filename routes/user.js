const express = require("express");
const router = express.Router();
const User = require("../models/user");
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapasync");
const passport = require("passport");
const { isLoggedIn } = require("../middleware");
const path = require("path");
var ejs = require("ejs");
var pdf = require("html-pdf");
const Mark = require("../models/studentadminside");
// var fetchUrl = require("fetch").fetchUrl;

router.get("/", async (req, res) => {
  // const user=await User.find({"_id":req.user._id});
  // const detail=await Detail.find({userId:req.user._id});
  // const userData=user[0];
  // const detailData=detail[0];
  //  res.render("profile",{userData,detailData});
  res.render("school");
});

router.get("/dashboard", async (req, res) => {
  res.render("dashboard", {
    user: req.user,
  });
});

router.get(
  "/resultpublish/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const id = req.params.id;
    const markOfUser = await Mark.find({ userId: id });
    if (typeof markOfUser[0] == "undefined") {
      return res.send("your result is not published yet...");
    }
    const pdfName = markOfUser[0].pdf_path;
    if (pdfName) {
      return res.render("result.ejs", { fileName: pdfName });
    }
    const { markDetail } = markOfUser[0];
    const fileName = markOfUser[0].name + Date.now() + ".pdf";
    const data = {
      val: "balajee",
      currentUser: req.user,
      success: 0,
      error: 0,
      result: markDetail,
    };
    var m = __dirname.slice(0, __dirname.length - 7);
    ejs.renderFile(
      path.join(__dirname.slice(0, __dirname.length - 7), "views/report.ejs"),
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
          // res.attachment('report.pdf');
          Mark.findOneAndUpdate(
            { userId: id },
            { pdf_path: fileName },
            { upsert: true },
            async function (err, doc) {
              if (err) return res.send(500, { error: err });
              return res.render("result.ejs", { fileName });
            }
          );
        });
      }
    );
  })
);

router.get(
  "/register",
  wrapAsync(async (req, res, next) => {
    const name = "";
    const email = "";

    res.render("register", { name, email });
  })
);

router.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    try {
      const { name, email, password, password2 } = req.body;
      if (password != password2) {
        // errors.push({ msg: 'Passwords do not match' });
        return res.render("register", { name, email, password, password2 });
      }
      if (password.length < 6) {
        return res.render("register", { name, email, password, password });
      }

      const user = new User({ name, username: email, email });
      const registeredUser = await User.register(user, password);

      if (typeof registeredUser != "undefined") {
        res.redirect("/login");
      } else {
        res.redirect("/register");
      }
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);
router.get("/login", async (req, res) => {
  res.render("login");
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "welcome back!");
    //  const redirectUrl ="/dashboard";
    const redirectUrl = "/";
    delete req.session.returnTo;
    //if admin will there...
    if (req.user.admin == true) {
      return res.redirect("/admin/control");
    }
    return res.redirect(redirectUrl);
  }
);
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You have Logged out successfully!");
  res.redirect("/login");
});
module.exports = router;
