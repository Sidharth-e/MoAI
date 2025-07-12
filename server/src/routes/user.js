const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

// Middleware example (for req.user) - ensure you use authentication middleware before these routes!

// Get user by ID from req.user._id (from auth token)
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id; // populated by authentication middleware
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "No user found" });
    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get user by email
router.get("/email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });
    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get user by Azure oid
router.get("/oid/:oid", async (req, res) => {
  try {
    const { oid } = req.params;
    const user = await User.findOne({ oid });
    if (!user) return res.status(404).send({ message: "User not found" });
    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all users (for admin)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({ users });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;