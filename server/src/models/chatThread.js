const mongoose = require("mongoose");
const Joi = require("joi");

// ChatThread Schema
const chatThreadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  title: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatThread = mongoose.model("ChatThread", chatThreadSchema);

// Joi Validation
const validate = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().label("Title"),
    userId: Joi.string(), // Optional, required if threads are user-specific
  });
  return schema.validate(data);
};

module.exports = { ChatThread, validate };