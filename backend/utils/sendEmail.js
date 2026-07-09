import nodemailer from "nodemailer";

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,
    },
  });

export const sendEmail =
  async (
    to,
    subject,
    text,
    html = null
  ) => {
    try {
      await transporter.sendMail({
        from: `"Hostel Management" <${process.env.EMAIL_USER}>`,

        to,

        subject,

        text,

        html: html || text,
      });

      console.log(
        `Email sent to ${to}`
      );
    } catch (error) {
      console.error(
        "Email sending error:",
        error.message
      );

      throw error;
    }
  };