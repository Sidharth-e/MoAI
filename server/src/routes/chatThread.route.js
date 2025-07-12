const router = require("express").Router();
const { ChatThread, validate } = require("../models/chatThread");

// Create new chat thread
router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    const userId = req.user._id; // adjust as per your authentication
    if (error) return res.status(400).send({ message: error.details[0].message });

    const thread = new ChatThread({ userId, ...req.body });
    await thread.save();
    res.status(201).send({ message: "Chat thread created", thread });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all chat threads for a user
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;
    const threads = await ChatThread.find({ userId }).sort({ createdAt: -1 });
    res.status(200).send({ threads });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;