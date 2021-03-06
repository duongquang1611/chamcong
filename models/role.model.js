import mongoose from "mongoose";
import moment from "moment";
const { Types, Schema, model } = mongoose;

var roleSchema = new Schema({
  name: { type: String, required: true, default: null },
  code: { type: String, required: true, default: null },
  level: { type: Number, default: null },
});
roleSchema.index({ "$**": "text" });
export default model("Role", roleSchema);
