import mongoose from "mongoose";

export const connectionDB = () => {
  mongoose
    .connect(process.env.URI)
    .then(() => console.log("connected Sucessfully"))
    .catch((error) => {
      console.log("cannot connect", error);
    });
};
