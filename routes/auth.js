const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
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
    password: req.body.password
  });
  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/login", (req, res) => {
  res.send("Login");
});
module.exports = router;
