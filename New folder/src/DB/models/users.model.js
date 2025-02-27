import mongoose from "mongoose";
import { gender, OTPTypes, providers, role } from "../../enums/enums.js";
import { Hash } from "../../utilities/bcrypt/hash.js";
import { Encrypt } from "../../utilities/crypto-js/encrypt.js";
import { Decrypt } from "../../utilities/crypto-js/decrypt.js";

const userSchema = mongoose.Schema(
  {
    fName: {
      type: String,
      required: true,
    },
    lName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    providers: {
      type: String,
      enum: Object.values(providers),
      default: providers.System,
    },
    gender: {
      type: String,
      enum: Object.values(gender),
      default: gender.male,
    },
    DOB: {
      type: Date,
      required: true,
      checkDOB: {
        validator: function (dob) {
          const today = moment();
          if (moment(dob).isAfter(today)) {
            return false;
          }
          const age = today.diff(dob, "years");
          return age >= 18;
        },
        message: "DOB must be equal or greater than 18 years",
      },
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(role),
      default: role.User,
    },
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    OTP: [
      {
        code: { type: String, required: true },
        type: {
          type: String,
          enum: Object.values(OTPTypes),
          required: true,
        },
        expiresIn: { type: Date, required: true },
      },
    ],
    isConfirmed: Boolean,
    deletedAt: Date,
    bannedAT: Date,
    changeCredentialTime: Date,
  },
  
  { timestamps: true }
);

userSchema.virtual('userName').get(function() {
  return `${this.fName} ${this.lName}`;
});

userSchema.set('toJSON', { virtuals: true });

userSchema.pre("save", async function (next, doc) {
  console.log("============ pre save ==============");
  console.log(this);
  if (this.isModified("password")) {
    this.password = await Hash({
      key: this.password,
      SALT_ROUNDS: process.env.SALT_ROUNDS,
    });
  }
  if (this.isModified("mobileNumber")) {
    this.mobileNumber = await Encrypt({
      key: this.mobileNumber,
      SECRET_KEY: process.env.SECRET_KEY,
    });
  }
  next();
});

userSchema.post("findOne", async function (doc, next) {
  console.log("============ post findOne ==============");
  if (doc && doc.mobileNumber) {
    doc.mobileNumber = await Decrypt({
      key: doc.mobileNumber,
      SECRET_KEY: process.env.SECRET_KEY,
    });
  }
});

const userModel = mongoose.model.User || mongoose.model("User", userSchema);

export default userModel;
