import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  from: Date,

  to: Date,

  reason: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  reviewedBy: String,

  reviewedAt: Date,

  pdfUrl: String,
});

export default mongoose.models.Leave ||
  mongoose.model("Leave", LeaveSchema);