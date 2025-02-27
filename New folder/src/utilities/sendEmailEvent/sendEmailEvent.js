import { customAlphabet } from "nanoid";
import moment from "moment";
import { Hash } from "../bcrypt/hash.js";
import { sendEmail } from "../../service/sendEmail.js";
import userModel from "../../DB/models/users.model.js";

let verificationData = {};

export const generateVerificationCode = async ({ data, otpType }) => {
  const email = data;
  const codeSended = customAlphabet("1234567890", 5)();
  const hash = await Hash({
    key: codeSended,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
  });

  const user = await userModel.findOne({ email });
  const expirationTime = moment().add(10, "minutes");
  const otp = {
    code: hash,
    type: otpType,
    expiresIn: expirationTime,
  };

  user.OTP.push(otp);
  await user.save();
  await sendEmail(email, "confirm OTP", codeSended);

  verificationData = {
    code: codeSended,
    type: otpType,
    expirationTime: expirationTime,
  };

  console.log(`Verification code: ${codeSended}`);
  console.log(`Expires at: ${expirationTime}`);
  return codeSended;
};

// Validate the verification code
export const validateVerificationCode = ({ inputCode, type }) => {
  if (!verificationData.code) {
    return "No verification code generated.";
  }
  const currentTime = moment();
  if (currentTime.isAfter(verificationData.expirationTime)) {
    return "Verification code has expired.";
  }
  if (inputCode === verificationData.code && type === verificationData.type) {
    return "Verification successful!";
  } else {
    return "Invalid verification code.";
  }
};
