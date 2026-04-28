import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

interface LeaveLetterData {
  teacherName: string;
  teacherEmail: string;
  department: string;
  designation?: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  days?: number;
  balance?: number;
  usedLeaves?: number;
  lastLeave?: string;
  status: "approved" | "rejected";
  referenceId: string;
}

const pageWidth = 595.28;
const pageHeight = 841.89;
const safe = (val: unknown) => (val === 0 || val ? String(val) : "-");

const fitText = (text: string, maxChars: number) =>
  text.length > maxChars ? `${text.slice(0, maxChars - 3)}...` : text;

export async function generateLeaveLetter(
  data: LeaveLetterData
): Promise<string> {
  try {
    const lettersDir = path.join(process.cwd(), "public", "letters");

    if (!fs.existsSync(lettersDir)) {
      fs.mkdirSync(lettersDir, { recursive: true });
    }

    const fileName = `leave_${data.referenceId}.pdf`;
    const filePath = path.join(lettersDir, fileName);
    const logoPath = path.join(process.cwd(), "public", "stpaulslogo.png");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const logo = fs.existsSync(logoPath)
      ? await pdfDoc.embedPng(fs.readFileSync(logoPath))
      : null;

    const from = new Date(data.fromDate).toLocaleDateString("en-GB");
    const to = new Date(data.toDate).toLocaleDateString("en-GB");
    const statusText = data.status.toUpperCase();
    const statusColor =
      data.status === "approved" ? rgb(0.02, 0.45, 0.18) : rgb(0.75, 0.05, 0.08);

    const rows = [
      ["Department", safe(data.department), "Reference No.", data.referenceId],
      ["Applicant", safe(data.teacherName), "Designation", safe(data.designation)],
      ["Leave Type", "Casual Leave", "No. of Days", safe(data.days || 1)],
      ["Date(s)", `${from} - ${to}`, "Status", statusText],
      ["Reason", safe(data.reason), "Balance", safe(data.balance || 0)],
      ["Leaves Availed", safe(data.usedLeaves || 0), "Last Leave", safe(data.lastLeave)],
    ];

    const drawText = (
      targetPage: PDFPage,
      text: string,
      x: number,
      y: number,
      options?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> }
    ) => {
      targetPage.drawText(text, {
        x,
        y,
        size: options?.size || 8,
        font: options?.bold ? boldFont : font,
        color: options?.color || rgb(0.08, 0.08, 0.08),
      });
    };

    const drawCentered = (
      text: string,
      y: number,
      options?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> }
    ) => {
      const size = options?.size || 9;
      const selectedFont = options?.bold ? boldFont : font;
      const textWidth = selectedFont.widthOfTextAtSize(text, size);
      drawText(page, text, (pageWidth - textWidth) / 2, y, options);
    };

    const drawCopy = (topY: number, copyLabel: string) => {
      const left = 40;
      const width = pageWidth - left * 2;
      const rowHeight = 23;
      const colWidths = [92, 178, 92, 178];
      let y = topY;

      page.drawRectangle({
        x: left,
        y: y - 346,
        width,
        height: 346,
        borderColor: rgb(0.22, 0.22, 0.22),
        borderWidth: 1,
      });

      if (logo) {
        page.drawImage(logo, {
          x: left + 14,
          y: y - 45,
          width: 34,
          height: 34,
        });
      }

      drawCentered("ST. PAUL'S COLLEGE, KALAMASSERY", y - 22, {
        size: 11,
        bold: true,
      });
      drawCentered("Leave Application / Approval Form", y - 39, {
        size: 9,
        bold: true,
      });

      drawText(page, copyLabel, left + width - 78, y - 25, {
        size: 7,
        bold: true,
        color: rgb(0.35, 0.35, 0.35),
      });

      drawText(page, `Status: ${statusText}`, left + width - 98, y - 43, {
        size: 8,
        bold: true,
        color: statusColor,
      });

      y -= 70;

      rows.forEach((row) => {
        let x = left;

        row.forEach((cell, index) => {
          const cellWidth = colWidths[index];
          page.drawRectangle({
            x,
            y,
            width: cellWidth,
            height: rowHeight,
            borderColor: rgb(0.25, 0.25, 0.25),
            borderWidth: 0.7,
          });

          drawText(page, fitText(cell, index % 2 === 0 ? 20 : 32), x + 5, y + 8, {
            size: 7.5,
            bold: index % 2 === 0,
            color: index % 2 === 0 ? rgb(0.18, 0.18, 0.18) : rgb(0.05, 0.05, 0.05),
          });

          x += cellWidth;
        });

        y -= rowHeight;
      });

      if (data.status === "rejected") {
        drawText(page, "Rejection note:", left, y - 18, { bold: true });
        drawText(page, fitText(safe(data.reason), 92), left + 78, y - 18);
      }

      y -= 70;
      drawText(page, "Signature of Applicant", left, y, { bold: true });
      page.drawLine({
        start: { x: left, y: y + 18 },
        end: { x: left + 150, y: y + 18 },
        thickness: 0.7,
        color: rgb(0.2, 0.2, 0.2),
      });

      drawText(page, "Principal / Authorised Signatory", left + width - 180, y, {
        bold: true,
      });
      page.drawLine({
        start: { x: left + width - 180, y: y + 18 },
        end: { x: left + width - 8, y: y + 18 },
        thickness: 0.7,
        color: rgb(0.2, 0.2, 0.2),
      });

      drawText(page, `Generated: ${new Date().toLocaleDateString("en-GB")}`, left, y - 26, {
        size: 7,
        color: rgb(0.35, 0.35, 0.35),
      });
    };

    drawCopy(pageHeight - 36, "Office Copy");
    page.drawLine({
      start: { x: 40, y: pageHeight / 2 },
      end: { x: pageWidth - 40, y: pageHeight / 2 },
      thickness: 0.7,
      color: rgb(0.6, 0.6, 0.6),
      dashArray: [5, 5],
    });
    drawCopy(pageHeight / 2 - 20, "Applicant Copy");

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);

    return `/letters/${fileName}`;
  } catch (err) {
    console.error("PDF GENERATION ERROR:", err);
    throw err;
  }
}
