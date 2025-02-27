import Joi from "joi";
import { Types } from "mongoose";

const idValidation = (value, helper) => {
  const isValidId = Types.ObjectId.isValid(value);
  return isValidId ? value : helper.message(`Invalid id :${value}`);
};

export const generalRules = {
  email: Joi.string().email({
    tlds: { allow: true },
    minDomainSegments: 2,
    maxDomainSegments: 2,
  }),
  password: Joi.string().regex(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
  ),
  id: Joi.string().custom(idValidation),
  headers: Joi.object({
    authorization: Joi.string().required(),
    "cache-control": Joi.string(),
    "postman-token": Joi.string(),
    "content-type": Joi.string(),
    "content-length": Joi.string(),
    host: Joi.string(),
    "user-agent": Joi.string(),
    accept: Joi.string(),
    "accept-encoding": Joi.string(),
    connection: Joi.string(),
  }),
  file: Joi.object({
    size: Joi.number().positive().required(),
    path: Joi.string().required(),
    filename: Joi.string().required(),
    destination: Joi.string().required(),
    mimetype: Joi.string().required(),
    encoding: Joi.string().required(),
    originalname: Joi.string().required(),
    fieldname: Joi.string().required(),
  }),
};
