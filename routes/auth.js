const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res) => {
  // Lets validate the data we create a user
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(40).send(error.details[0].message);
  }
  // Checking if user is already in the database

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).send("Email already exists");
  }
  // Hash the password
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/login", async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("Email or password is not valid");
    }
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(400).send("Email or password is wrong");
    }
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).send(token);
    // res.send("Succcess");
  } catch (error) {
    console.log("err", error);
  }
});
module.exports = router;
