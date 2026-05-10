import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[WARNING] RESEND_API_KEY is not defined. Email will not be sent.");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "RepUp <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("[ERROR] Failed to send email via Resend:", error);
      throw new Error(error.message);
    }

    console.log("[SUCCESS] Email sent successfully:", data?.id);
  } catch (error) {
    console.error("[ERROR] Email sending failed:", error);
    throw error;
  }
};
