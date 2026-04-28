import nodemailer from "nodemailer";
import path from "path";
import { getSystemSettings } from "@/lib/systemSettings";

interface SendLeaveEmailParams {
  to: string;
  teacherName: string;
  status: "approved" | "rejected" | string;
  pdfPath: string;
  leaveDetails?: {
    fromDate?: string;
    toDate?: string;
    leaveType?: string;
    days?: number;
    reason?: string;
    referenceId?: string;
  };
}

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("en-GB") : "-";

export async function sendLeaveEmail({
  to,
  teacherName,
  status,
  pdfPath,
  leaveDetails,
}: SendLeaveEmailParams) {
  const settings = await getSystemSettings();

  if (!settings.emailNotifications) {
    return;
  }

  const isApproved = status === "approved";
  const subject = isApproved ? "Leave Approved" : "Leave Rejected";
  const statusColor = isApproved ? "#16a34a" : "#dc2626";
  const statusText = isApproved ? "APPROVED" : "REJECTED";
  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}${pdfPath}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
          <div style="background:#7f1d1d;color:#ffffff;padding:22px 28px;">
            <h1 style="margin:0;font-size:22px;">St. Paul's College</h1>
            <p style="margin:6px 0 0;font-size:13px;opacity:.9;">Leave Management System</p>
          </div>

          <div style="padding:28px;">
            <p style="margin:0 0 16px;font-size:15px;">Dear ${teacherName},</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">
              Your leave request has been
              <strong style="color:${statusColor};">${statusText}</strong>.
              Please find the official leave form attached as a PDF.
            </p>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
              <tbody>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;">From</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${formatDate(leaveDetails?.fromDate)}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;">To</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${formatDate(leaveDetails?.toDate)}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;">Leave Type</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${leaveDetails?.leaveType || "-"}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;">Days</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${leaveDetails?.days || "-"}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;">Reason</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${leaveDetails?.reason || "-"}</td>
                </tr>
              </tbody>
            </table>

            <a href="${downloadUrl}" style="display:inline-block;background:#991b1b;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">
              Download PDF
            </a>

            <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">
              Regards,<br/>
              St. Paul's College Administration
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"St. Paul's College" <${process.env.EMAIL_USER}>`,
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
