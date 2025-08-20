
import  { Document,Types } from "mongoose";

// Define an interface for the ChatMessage document
export interface IChatMessage extends Document {
  threadId: Types.ObjectId;
  sender: "user" | "assistant" |"tool";
  text: string;
  versions?: string[]; // Array of message versions
  activeVersionIndex?: number; // Index of currently active version
  createdAt: Date;
}

// Interface for message request body
export interface MessageRequestBody {
  text: string;
  sender: string;
  threadId: string;
}

// Interface for regeneration request
export interface RegenerateMessageRequest {
  messageId: string;
  threadId: string;
}