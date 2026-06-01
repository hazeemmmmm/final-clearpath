import nodemailer from "nodemailer";
import { devConfig } from "../../config/env/dev.config.js";

export const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: devConfig.EMAIL,
        pass: devConfig.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: devConfig.EMAIL,
      to,
      subject,
      html,
    });
    console.log(`Email successfully sent to ${to}`);
  } catch (error) {
    console.warn("⚠️ Email not sent due to missing/invalid credentials. Logged instead:");
    console.warn(`To: ${to}\nSubject: ${subject}\n`);
    // Do not throw the error so the app can continue working without real email credentials
  }
};