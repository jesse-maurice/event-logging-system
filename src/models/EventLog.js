import {
  model,
  Schema,
} from 'mongoose';

const EventLogSchema = new Schema({
  eventType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sourceAppId: { type: String, required: true },
  dataPayload: { type: Object, required: true },
  hash: { type: String, required: true },
  previousHash: { type: String, required: true },
});

export default model("EventLog", EventLogSchema);
