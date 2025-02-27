import jwt from "jsonwebtoken";

export const GenerateToken = async ({ payload = {}, SIGNATURE, option }) => {
  return jwt.sign(payload, SIGNATURE, option);  
};