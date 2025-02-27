import userModel from "../DB/models/users.model.js";
import { asyncHandler } from "../utilities/errorHandling/errorHandling.js";
import { Verify } from "../utilities/token/verify.js";

export const roles = {
  user: "user",
  admin: "admin",
};

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};
export const decodedToken = async ({ authorization, tokenType, next }) => {
  const [prefix, token] = authorization?.split(" ") || [];
  if (!prefix || !token) {
    return next(new Error("token not found", { cause: 400 }));
  }
  let ACCESS_SIGNATURE = undefined;
  let REFRESH_SIGNATURE = undefined;
  let SIGNATURE = undefined;
  if (prefix == process.env.PREFIX_ADMIN_TOKEN) {
    ACCESS_SIGNATURE = process.env.SIGNATURE_TOKEN_ADMIN;
    REFRESH_SIGNATURE = process.env.REFRESH_TOKEN_ADMIN;
  } else if (prefix == process.env.PREFIX_USER_TOKEN) {
    ACCESS_SIGNATURE = process.env.SIGNATURE_TOKEN_USER;
    REFRESH_SIGNATURE = process.env.REFRESH_TOKEN_USER;
  } else {
    return next(new Error("invalid token prefix", { cause: 401 }));
  }

  const decoded = await Verify({
    token,
    SIGNATURE:
      tokenType === tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE,
  });

  if (!decoded?.id) {
    return next(new Error("invalid token payload", { cause: 400 }));
  }
  const user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new Error("user not found", { cause: 401 }));
  }

  if (user.isDeleted) {
    return next(new Error("user deleted", { cause: 401 }));
  }
  if (parseInt(user?.changeCredentialTime?.getTime() / 1000) >= decoded.iat) {
    return next(new Error("expired Token", { cause: 401 }));
  }
  return user;
};

export const authentication = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  const user = await decodedToken({
    authorization,
    tokenType: tokenTypes.access,
    next,
  });
  req.user = user;
  next();
});

export const authorization = (role = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(new Error("Access denied", { cause: 403 }));
    }
    next();
  });
};
