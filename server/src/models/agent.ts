import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  description?: string;
  config: Record<string, any>;
  connections: mongoose.Types.ObjectId[]; // References to other agents
}

const AgentSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  config: { type: Schema.Types.Mixed, required: true },
  connections: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
});

export default mongoose.model<IAgent>('Agent', AgentSchema); 