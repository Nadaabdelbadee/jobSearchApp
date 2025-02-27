import userModel from "../../DB/models/users.model.js";
import { OTPTypes, providers, role } from "../../enums/enums.js";
import { decodedToken, tokenTypes } from "../../middleware/auth.js";
import { Compare } from "../../utilities/bcrypt/compare.js";
import { Hash } from "../../utilities/bcrypt/hash.js";
import cloudinary from "../../utilities/cloudinary/cloudinary.js";
import { Encrypt } from "../../utilities/crypto-js/encrypt.js";
import { asyncHandler } from "../../utilities/errorHandling/errorHandling.js";
import {
  generateVerificationCode,
  validateVerificationCode,
} from "../../utilities/sendEmailEvent/sendEmailEvent.js";
import { GenerateToken } from "../../utilities/token/generateToken.js";

// ======================================== signUp ========================================
export const signUp = asyncHandler(async (req, res, next) => {
  const {
    fName,
    lName,
    email,
    password,
    cPassword,
    gender,
    DOB,
    mobileNumber,
  } = req.body;

  if (await userModel.findOne({ email })) {
    return next(new Error("Email already exist", { cause: 409 }));
  }
  const user = await userModel.create({
    fName,
    lName,
    email,
    password,
    cPassword,
    DOB,
    mobileNumber,
    gender,
  });

  await generateVerificationCode({
    data: email,
    otpType: OTPTypes.confirmEmail,
  });

  return res.status(200).json({ msg: "Done", user });
});
// ======================================== confirmEmail ========================================
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { code, email } = req.body;
  let user = await userModel.findOne({
    email,
    isConfirmed: { $exists: false },
  });
  if (!user) {
    return next(new Error("email not found", { cause: 400 }));
  }

  const result = validateVerificationCode({
    inputCode: code,
    type: OTPTypes.confirmEmail,
  });
  if (result == "No verification code generated.") {
    return next(new Error("No verification code generated.", { cause: 500 }));
  } else if (result == "Verification code has expired.") {
    return next(new Error("Verification code has expired.", { cause: 500 }));
  } else if (result == "Invalid verification code.") {
    return next(new Error("Invalid verification code.", { cause: 500 }));
  } else if (result == "Verification successful!") {
    user = await userModel.updateOne(
      { email },
      { isConfirmed: true },
      { new: true }
    );
    return res.status(200).json({ msg: "Done", user });
  }
});
// ======================================== signIn ========================================
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({
    email,
    isConfirmed: true,
    providers: providers.System,
  });
  if (!user) {
    return next(
      new Error("user not found or not confirmed yet", { cause: 400 })
    );
  }
  console.log(user.password);

  const comparePass = await Compare({ key: password, hashed: user.password });
  console.log(comparePass);

  if (!comparePass) {
    return next(new Error("Invalid password", { cause: 400 }));
  }
  const access_Token = await GenerateToken({
    payload: { email, id: user._id },
    SIGNATURE:
      user.role == role.User
        ? process.env.SIGNATURE_TOKEN_USER
        : process.env.SIGNATURE_TOKEN_ADMIN,
    option: { expiresIn: "1h" },
  });
  const refresh_Token = await GenerateToken({
    payload: { email, id: user._id },
    SIGNATURE:
      user.role == role.User
        ? process.env.REFRESH_TOKEN_USER
        : process.env.REFRESH_TOKEN_ADMIN,
    option: { expiresIn: "1w" },
  });
  return res.status(200).json({ msg: "done", access_Token, refresh_Token });
});
// ======================================== forgetPassword ========================================
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  let user = await userModel.findOne({
    email,
    deletedAt: { $exists: false },
    providers: providers.System,
  });
  if (!user) {
    return next(new Error("email not found", { cause: 400 }));
  }

  await generateVerificationCode({
    data: email,
    otpType: OTPTypes.forgetPassword,
  });
  return res.status(200).json({ msg: "done" });
});
// ======================================== confirmResetPass ========================================
export const confirmResetPass = asyncHandler(async (req, res, next) => {
  const { code, email, newPassword, cNewPassword } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("email not found", { cause: 400 }));
  }
  const hashPass = await Hash({
    key: newPassword,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
  });
  const result = validateVerificationCode({
    inputCode: code,
    type: OTPTypes.forgetPassword,
  });
  if (result == "No verification code generated.") {
    return next(new Error("No verification code generated.", { cause: 500 }));
  } else if (result == "Verification code has expired.") {
    return next(new Error("Verification code has expired.", { cause: 500 }));
  } else if (result == "Invalid verification code.") {
    return next(new Error("Invalid verification code.", { cause: 500 }));
  } else if (result == "Verification successful!") {
    user = await userModel.updateOne(
      { email },
      { password: hashPass, changeCredentialTime: Date.now() },
      { new: true }
    );
    return res.status(200).json({ msg: "Done", user });
  }
});
// ==================================== refreshToken =====================================
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { authorization } = req.body;
  const user = await decodedToken({
    authorization,
    tokenType: tokenTypes.refresh,
    next,
  });
  console.log(user);

  const access_Token = await GenerateToken({
    payload: { email: user.email, id: user._id },
    SIGNATURE:
      user.role == role.User
        ? process.env.SIGNATURE_TOKEN_USER
        : process.env.SIGNATURE_TOKEN_ADMIN,
    option: { expiresIn: "1h" },
  });
  return res.status(201).json({ msg: "done", token: { access_Token } });
});
// ==================================== updateAccount =====================================
export const updateAccount = asyncHandler(async (req, res, next) => {
  if (req.body.mobileNumber) {
    req.body.mobileNumber = await Encrypt({
      key: req.body.mobileNumber,
      SECRET_KEY: process.env.SECRET_KEY,
    });
  }
  const user = await userModel.updateOne({ _id: req.user._id }, req.body, {
    new: true,
  });
  return res.status(201).json({ msg: "done", user });
});
// ==================================== getUserData =====================================
export const getUserData = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ _id: req.user._id });
  if (!user) {
    return next(new Error("User not found", { cause: 400 }));
  }
  console.log(user);
  return res.status(201).json({ msg: "done", user });
});
// ==================================== getAnotherUserData =====================================
export const getAnotherUserData = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await userModel
    .findOne({ _id: userId, isConfirmed: true })
    .select("fName lName mobileNumber profilePic coverPic");
  if (!user) {
    return next(new Error("User not found", { cause: 400 }));
  }

  return res.status(201).json({ msg: "done", user });
});
// ==================================== updatePassword =====================================
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, cNewPassword } = req.body;
  const compare = await Compare({
    key: oldPassword,
    hashed: req.user.password,
  });
  if (!compare) {
    return next(new Error("invalid old password"));
  }
  const hashNewPass = await Hash({
    key: newPassword,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
  });
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { password: hashNewPass, changeCredentialTime: Date.now() },
    { new: true }
  );

  return res.status(201).json({ msg: "done", user });
});
// ==================================== uploadProfilePic =====================================
export const uploadProfilePic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("please uplaod image", { cause: 409 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "jobSearch-app/users/profilePic",
    }
  );
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { profilePic: { secure_url, public_id } },
    { new: true }
  );
  return res.status(201).json({ msg: "done", user });
});
// ==================================== uploadCoverPic =====================================
export const uploadCoverPic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("please uplaod image", { cause: 409 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "jobSearch-app/users/coverPic",
    }
  );
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { coverPic: { secure_url, public_id } },
    { new: true }
  );
  return res.status(201).json({ msg: "done", user });
});
// ==================================== deleteProfilePic =====================================
export const deleteProfilePic = asyncHandler(async (req, res, next) => {
  await cloudinary.uploader.destroy(req.user.profilePic.public_id);
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { $unset: { profilePic: 0 } },
    { new: true }
  );
  return res.status(201).json({ msg: "done", user });
});
// ==================================== deletecoverPic =====================================
export const deletecoverPic = asyncHandler(async (req, res, next) => {
  await cloudinary.uploader.destroy(req.user.coverPic.public_id);
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { $unset: { coverPic: 0 } },
    { new: true }
  );
  return res.status(201).json({ msg: "done", user });
});
// ==================================== softDelete =====================================
export const softDelete = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOneAndUpdate(
    { _id: req.user._id, deletedAt: { $exists: false } },
    { deletedAt: Date.now() }
  );

  if (!user) {
    return next(new Error("User not found", { cause: 400 }));
  }
  return res.status(201).json({ msg: "done", user });
});
