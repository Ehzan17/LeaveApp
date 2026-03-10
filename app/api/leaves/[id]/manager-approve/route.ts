import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { generateLeaveLetter } from "@/lib/pdfGenerator";
import { sendLeaveEmail } from "@/lib/emailSender";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await context.params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    if (decoded.role !== "manager") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const leave = await db.collection("leaves").findOne({
      _id: new ObjectId(id),
    });

    if (!leave) {
      return NextResponse.json(
        { message: "Leave not found" },
        { status: 404 }
      );
    }

    const teacher = await db.collection("users").findOne({
      _id: leave.userId,
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    /* Generate reference ID */
    const referenceId = `REF-${Date.now()}`;

    /* Generate PDF */
    const pdfUrl = await generateLeaveLetter({
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      department: teacher.department,
      fromDate: leave.from,
      toDate: leave.to,
      status: "approved",
      referenceId,
    });

    /* Send Email */
    await sendLeaveEmail({
      to: teacher.email,
      teacherName: teacher.name,
      status: "approved",
      pdfPath: pdfUrl,
    });

    /* Update Leave */
    await db.collection("leaves").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "approved",
          "approvals.manager": "approved",
          pdfUrl,
        },
      }
    );

    return NextResponse.json({
      message: "Leave approved by Manager",
    });

  } catch (error) {

    console.error("MANAGER APPROVAL ERROR:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}