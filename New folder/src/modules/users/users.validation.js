import Joi from "joi";
import { gender, role } from "../../enums/enums.js";
import { generalRules } from "../../utilities/generalRules/generalRules.js";

export const signUpSchema = {
  body: Joi.object({
    fName: Joi.string().min(3).max(30).alphanum().required(),
    lName: Joi.string().min(3).max(30).alphanum().required(),
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    cPassword: generalRules.password.valid(Joi.ref("password")).required(),
    DOB: Joi.date().iso().less("now").required(),
    mobileNumber: Joi.string()
      .regex(/^01[0125][0-9]{8}$/)
      .required(),
    gender: Joi.string().valid(gender.male, gender.female).required(),
    role: Joi.string().valid(role.Admin, role.User),
  }),
};
export const confirmEmailSchema = {
  body: Joi.object({
    code: Joi.string().length(5).required(),
    email: generalRules.email.required(),
  }),
};
export const signInSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
    password: generalRules.password.required(),
  }),
};
export const forgetPasswordSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
  }),
};
export const confirmResetPassSchema = {
  body: Joi.object({
    code: Joi.string().length(5).required(),
    email: generalRules.email.required(),
    newPassword: generalRules.password.required(),
    cNewPassword: generalRules.password
      .valid(Joi.ref("newPassword"))
      .required(),
  }),
};
export const updateAccountSchema = {
  body: Joi.object({
    fName: Joi.string().min(3).max(30).alphanum(),
    lName: Joi.string().min(3).max(30).alphanum(),
    DOB: Joi.date().iso().less("now"),
    mobileNumber: Joi.string().regex(/^01[0125][0-9]{8}$/),
    gender: Joi.string().valid(gender.male, gender.female),
  }),
};

export const getAnotherUserDataSchema = {
  params: Joi.object({
    userId: generalRules.id.required(),
  }),
};
export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: generalRules.password.required(),
    newPassword: generalRules.password.required(),
    cNewPassword: generalRules.password
      .valid(Joi.ref("newPassword"))
      .required(),
  }),
};
