
import  { Document,Types } from "mongoose";

// Define an interface for the ChatMessage document
export interface IChatMessage extends Document {
  threadId: Types.ObjectId;
  sender: "user" | "assistant";
  text: string;
  createdAt: Date;
}

// Interface for message request body
export interface MessageRequestBody {
  text: string;
  sender: string;
  threadId: string;
}