import mongoose, { Schema} from "mongoose";
import Joi, { ValidationResult } from "joi";
import { IChatMessage } from "../interface/chatMessage.interface";


// ChatMessage Schema
const chatMessageSchema = new Schema<IChatMessage>({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatThread", required: true },
  sender: { type: String, enum: ["user", "assistant","tool"], required: true },
  text: { type: String, required: true },
  versions: { 
    type: [String], 
    default: function(this: any) {
      // Initialize versions array with the current text
      return [this.text];
    }
  },
  activeVersionIndex: { 
    type: Number, 
    default: 0 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ChatMessage Model
const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);

// Joi Validation Function
const validate = (data: Record<string, any>): ValidationResult => {
  const schema = Joi.object({
    threadId: Joi.string().required().label("Thread ID"),
    sender: Joi.string().valid("user", "assistant","tool").required().label("Sender"),
    text: Joi.string().required().label("Message Text"),
  });
  return schema.validate(data);
};

// Export the ChatMessage model and validate function
export { ChatMessage, validate, IChatMessage };