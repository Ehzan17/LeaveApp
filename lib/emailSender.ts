import nodemailer from "nodemailer";
import path from "path";

interface SendLeaveEmailParams {
  to: string;
  teacherName: string;
  status: string;
  pdfPath: string;
}

export async function sendLeaveEmail({
  to,
  teacherName,
  status,
  pdfPath,
}: SendLeaveEmailParams) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject =
    status === "approved"
      ? "Leave Application Approved"
      : "Leave Application Rejected";

  const html = `
    <h2>Leave Application Status</h2>
    <p>Dear ${teacherName},</p>
    <p>Your leave request has been <b>${status.toUpperCase()}</b>.</p>
    <p>Please find the official confirmation letter attached.</p>
    <br/>
    <p>Regards,<br/>St. Pauls College Administration</p>
  `;

  await transporter.sendMail({
    from: `"St. Pauls College" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: path.basename(pdfPath),
        path: path.join(process.cwd(), "public", pdfPath),
      },
    ],
  });
}