import { Router } from "express";
import { confirmEmail, confirmResetPass, deletecoverPic, deleteProfilePic, forgetPassword, getAnotherUserData, getUserData, refreshToken, signIn, signUp, softDelete, updateAccount, updatePassword, uploadCoverPic, uploadProfilePic } from "./users.service.js";
import { confirmEmailSchema, confirmResetPassSchema, forgetPasswordSchema, getAnotherUserDataSchema, signInSchema, signUpSchema, updateAccountSchema, updatePasswordSchema } from "./users.validation.js";
import { validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/auth.js";
import { multerHost } from "../../middleware/multer.js";
import { filesTypes } from "../../enums/enums.js";

const userRouter = Router();

userRouter.post("/signUp", validation(signUpSchema), signUp);
userRouter.patch("/confirmEmail", validation(confirmEmailSchema), confirmEmail);
userRouter.post("/signIn", validation(signInSchema), signIn);
userRouter.patch("/forgetPassword", validation(forgetPasswordSchema), forgetPassword);
userRouter.patch("/confirmResetPass", validation(confirmResetPassSchema), confirmResetPass);
userRouter.patch("/refreshToken", refreshToken);
userRouter.patch("/updateAccount",validation(updateAccountSchema) ,authentication, updateAccount);
userRouter.get("/getUserData",authentication, getUserData);
userRouter.get("/getAnotherUserData/:userId",validation(getAnotherUserDataSchema) ,authentication, getAnotherUserData);
userRouter.patch("/updatePassword",validation(updatePasswordSchema) ,authentication, updatePassword);
userRouter.patch("/uploadProfilePic",multerHost(filesTypes.Image).single("attachment") ,authentication, uploadProfilePic);
userRouter.patch("/uploadCoverPic",multerHost(filesTypes.Image).single("attachment") ,authentication, uploadCoverPic);
userRouter.delete("/deleteProfilePic",authentication, deleteProfilePic);
userRouter.delete("/deletecoverPic",authentication, deletecoverPic);
userRouter.delete("/softDelete",authentication, softDelete);

export default userRouter;
