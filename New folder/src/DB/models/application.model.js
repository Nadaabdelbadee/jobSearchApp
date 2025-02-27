import mongoose from "mongoose";
import { status } from "../../enums/enums.js";

const applicationSchema = mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.type.Object,
      ref: "JobOpp",
    },
    userId: {
      type: mongoose.Schema.type.Object,
      ref: "User",
    },
    userCV: {
      secure_url: String,
      public_id: String,
    },
    status: {
      type: String,
      enum: Object.values(status),
    },
    
  },
  { timestamps: true }
);

const applicationModel =
  mongoose.model.Application ||
  mongoose.model("Application", applicationSchema);

export default applicationModel;
