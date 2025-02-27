import { connectionDB } from "./DB/connectionDB.js";
import userRouter from "./modules/users/users.controller.js";
import { globalErrorHandler } from "./utilities/errorHandling/errorHandling.js";
import { rateLimit } from 'express-rate-limit'
const limiter = rateLimit({
  limit:5,
  windowMs:2*60*1000
})
const bootstrap = (app, express) => {
  app.use(express.json());
app.use(limiter)
  connectionDB();
  app.get("/", (req, res, next) => {
    return res.status(200).json({ msg: "Hello on my JobSearchApp" });
  });
  app.use("/users" , userRouter)
  app.use("*", (req, res, next) => {
    return next(new Error(`invalid URL ${req.originalUrl}`, { cause: 404 }));
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
