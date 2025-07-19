import mongoose, { Document} from 'mongoose';

export interface IChatThread extends Document {
  userId?: mongoose.Types.ObjectId; // Optional, if threads are user-specific
  title: string;
  createdAt: Date;
}


