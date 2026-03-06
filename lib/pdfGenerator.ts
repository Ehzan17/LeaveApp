import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface LeaveLetterData {
  teacherName: string;
  teacherEmail: string;
  department: string;
  fromDate: string;
  toDate: string;
  status: "approved" | "rejected";
  referenceId: string;
}

export async function generateLeaveLetter(data: LeaveLetterData) {
  const lettersDir = path.join(process.cwd(), "public", "letters");

  if (!fs.existsSync(lettersDir)) {
    fs.mkdirSync(lettersDir, { recursive: true });
  }

  const fileName = `leave_${data.referenceId}.pdf`;
  const filePath = path.join(lettersDir, fileName);

  const doc = new PDFDocument({
    margin: 50,
    font: path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf"),
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text("ST. PAULS COLLEGE", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text("Official Leave Confirmation Letter", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text(`Reference ID: ${data.referenceId}`);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`);
  doc.moveDown(2);

  doc.fontSize(12);
  doc.text("To,");
  doc.text(data.teacherName);
  doc.text(`${data.department} Department`);
  doc.text(data.teacherEmail);
  doc.moveDown(1.5);

  const statusText =
    data.status === "approved"
      ? "has been APPROVED"
      : "has been REJECTED";

  doc.text(
    `This is to formally inform you that your leave request from ${data.fromDate} to ${data.toDate} ${statusText} by the Principal of the institution.`
  );

  doc.moveDown(3);

  doc.text("_____________________________");
  doc.text("Principal");
  doc.text("St. Pauls College");

  doc.end();

  return `/letters/${fileName}`;
}