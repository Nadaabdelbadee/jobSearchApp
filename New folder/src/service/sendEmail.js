import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.paswword,
    },
  });

  const info = await transporter.sendMail({
    from: `"nada" <${process.env.email}>`,
    to: to ? to : "nadabadee2022@gmail.com",
    subject: subject ? subject : "Hello ✔",
    html: html ? html : "<b>Hello world?</b>",
  });
  if (info.accepted.length) {
    return true;
  } else return false;
};
