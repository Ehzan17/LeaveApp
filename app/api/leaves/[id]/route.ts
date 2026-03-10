import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/roleGuard";
import { ObjectId } from "mongodb";
import { generateLeaveLetter } from "@/lib/pdfGenerator";
import { sendLeaveEmail } from "@/lib/emailSender";
import { logActivity } from "@/lib/activityLogger";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const auth = requireRole(req, ["principal"]);
  if (auth instanceof NextResponse) return auth;

  try {

    // ✅ Next.js dynamic params fix
    const params = await context.params;
    const id = params.id;

    const { status } = await req.json();

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { message: "Status must be approved or rejected" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const leave = await db.collection("leaves").findOne({
      _id: new ObjectId(id),
    });

    if (!leave) {
      return NextResponse.json(
        { message: "Leave request not found" },
        { status: 404 }
      );
    }

    if (leave.status !== "pending") {
      return NextResponse.json(
        { message: "Leave already reviewed" },
        { status: 400 }
      );
    }

    // Fetch teacher
    const teacher: any = await db.collection("users").findOne({
      _id: leave.userId,
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    // Generate reference ID
    const referenceId = `REF-${Date.now()}`;

    // Generate PDF
    const pdfUrl = await generateLeaveLetter({
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      department: teacher.department,
      fromDate: leave.from,
      toDate: leave.to,
      status,
      referenceId,
    });

    // Send email
    await sendLeaveEmail({
      to: teacher.email,
      teacherName: teacher.name,
      status,
      pdfPath: pdfUrl,
    });

    // Update leave record
    await db.collection("leaves").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          reviewedBy: auth.userId,
          reviewedAt: new Date(),
          pdfUrl,
        },
      }
    );

    // ✅ Activity log (Teacher name + dates)
    await logActivity({
      userId: auth.userId,
      userName: auth.userName || "Principal",
      role: "principal",
      action: status === "approved" ? "APPROVED_LEAVE" : "REJECTED_LEAVE",
      targetId: id,
      targetType: "leave",
      message: `${teacher.name}'s leave from ${new Date(
        leave.from
      ).toLocaleDateString()} to ${new Date(
        leave.to
      ).toLocaleDateString()} was ${status}`,
    });

    return NextResponse.json({
      message: `Leave ${status} successfully`,
    });

  } catch (error) {
    console.error("LEAVE APPROVAL ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong", error: String(error) },
      { status: 500 }
    );
  }
}