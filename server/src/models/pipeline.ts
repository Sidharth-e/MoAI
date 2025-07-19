import mongoose, { Schema, Document } from 'mongoose';

export interface IPipeline extends Document {
  name: string;
  description?: string;
  steps: mongoose.Types.ObjectId[]; // References to agents
}

const PipelineSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  steps: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
});

export default mongoose.model<IPipeline>('Pipeline', PipelineSchema); 