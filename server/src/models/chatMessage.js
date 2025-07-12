const mongoose = require("mongoose");
const Joi = require("joi");

// ChatMessage Schema
const chatMessageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatThread", required: true },
  sender: { type: String, enum: ["user", "assistant"], required: true }, 
  text: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

// Joi Validation
const validate = (data) => {
  const schema = Joi.object({
    threadId: Joi.string().required().label("Thread ID"),
    sender: Joi.string().valid("user", "assistant").required().label("Sender"),
    text: Joi.string().required().label("Message Text"),
  });
  return schema.validate(data);
};

module.exports = { ChatMessage, validate };