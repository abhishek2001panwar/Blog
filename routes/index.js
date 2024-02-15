var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const fs = require("fs");
const upload = require("./multer");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
router.get("/about", function (req, res, next) {
  res.render("about");
});
router.get("/contact", isLoggedIn, function (req, res, next) {
  res.render("contact");
});
router.get("/Bookmark", isLoggedIn, function (req, res, next) {
  res.render("bookmark");
});
router.get("/Admin", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOneAndUpdate({ username: req.session.passport.user });
  res.render("Admin",{ user });
});
router.get("/food", function (req, res, next) {
  res.render("food");
});

router.post("/Queries", isLoggedIn, async function (req, res, next) {
  const user = await userModel.find({ username: req.session.passport.user });
  const userData = new userModel({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  });
  await userData.save();
  res.render("/", { userData, user });
});

router.post("/contact_submit", function (req, res, next) {
  const userData = new userModel({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  });
  userData.save();
  res.redirect("/");
});
router.get("/login", function (req, res, next) {
  res.render("login");
});
router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  const posts = await postModel.find().populate("user");
  res.render("profile", { user, posts });
});

router.get("/blog", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  const posts = await postModel.find().populate("user");
  res.render("blog", { user, posts });
});
router.get("/addblog", isLoggedIn, function (req, res, next) {
  res.render("addblog");
});
router.get("/MyBlog", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");

  res.render("MyBlog", { user });
});
router.post("/fileupload", isLoggedIn,upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename,
   await user.save();
  res.redirect("/profile");
});

router.post("/createblog", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    category: req.body.category,
    highlight: req.body.highlight,
    name: req.body.name,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/blog");
});

router.post("/register", function (req, res) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    profileImage:String,
  });
  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/blog");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/blog",
    failureRedirect: "/login",
  })
);
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
