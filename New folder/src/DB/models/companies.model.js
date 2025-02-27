import mongoose from "mongoose";

const companiesSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numberOfEmployees: {
      type: Number,
      required: true,
      min: [11, "Number of employees must be at least 11"],
      max: [20, "Number of employees cannot exceed 20"],
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
    },
    CreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    logo: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    HRs: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    bannedAt: Date,
    deletedAt: Date,
    legalAttachment: {
      secure_url: String,
      public_id: String,
    },
    approvedByAdmin: Boolean,
  },
  { timestamps: true }
);

const companiesModel =
  mongoose.model.Companies || mongoose.model("Companies", companiesSchema);

export default companiesModel;
