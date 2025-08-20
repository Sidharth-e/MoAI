import mongoose, { Schema } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { IChatThread } from "../interface/chatThread.interface";


// ChatThread Schema
const chatThreadSchema = new Schema<IChatThread>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add toJSON transformation to convert ObjectId to string
chatThreadSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret._id = ret._id.toString();
    if (ret.userId) {
      ret.userId = ret.userId.toString();
    }
    return ret;
  }
});

// ChatThread Model
const ChatThread = mongoose.model<IChatThread>("ChatThread", chatThreadSchema);

// Joi Validation Function
const validate = (data: Record<string, any>): ValidationResult => {
  const schema = Joi.object({
    title: Joi.string().required().label("Title"),
    userId: Joi.string().optional(), // Optional, if threads are user-specific
  });
  return schema.validate(data);
};

// Export the ChatThread model and validate function
export { ChatThread, validate, IChatThread };