const { Router } = require("express");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require("bcrypt");
const router = Router();

// /api/auth/register
router.post(
  "/register",
  [
    check("email", "Incorrect email").isEmail(),
    check("password", "Minimal length of password is 6").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      console.log(req.body);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Incorrect registration data",
        });
      }

      const { email, password } = req.body;

      

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res.status(400).json({ message: "Unavailable email" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({ email: email, password: hashedPassword });

      await user.save();

      res.status(201).json({message: "User created"});

    } catch (e) {
      res.status(500).json({ message: "Server error. Try again" });
    }
  }
);

// /api/auth/login
router.post(
  "/login", 
  [
    check("email", "Incorrect email").normalizeEmail().isEmail(),
    check("password", "Enter password").exists(),
  ], 
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Incorrect login data",
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({email});

      if (!user) {
        return res.status(400).json({message: 'User not found'});
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({message: 'Incorrect password, try again'});
      }

      const token = jwt.sign(
        {userId: user.id},
        config.get('jwtSecret'),
        {expiresIn: '1h'}
      );

      res.json({
        token: token,
        userId: user.id
      });

    } catch (e) {
      res.status(500).json({ message: "Server error. Try again" });
    }
  }
);

module.exports = router;
