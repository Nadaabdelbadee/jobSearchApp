import mongoose from "mongoose";
import { jobLocation, workingTime } from "../../enums/enums.js";

const jobOppSchema = mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      enum: Object.values(jobLocation),
    },
    workingTime: {
      type: String,
      enum: Object.values(workingTime),
    },
    seniorityLevel: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    technicalSkills: [
      {
        type: String,
        required: true,
      },
    ],
    softSkills: [
      {
        type: String,
        required: true,
      },
    ],
    updatedBy: {
      type: mongoose.Schema.type.Object,
      ref: "HR",
    },
    addedBy: {
      type: mongoose.Schema.type.Object,
      ref: "HR",
    },
    closed: Boolean,
    companyId: {
      type: mongoose.Schema.type.Object,
      ref: "Companies",
    },
    
  },
  { timestamps: true }
);

const jobOppModel =
  mongoose.model.JobOpp || mongoose.model("JobOpp", jobOppSchema);

export default jobOppModel;
