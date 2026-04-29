import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { generateLeaveLetter } from "@/lib/pdfGenerator";
import { sendLeaveEmail } from "@/lib/emailSender";
import { createNotification } from "@/lib/notifications";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: string;
    };

    if (decoded.role !== "manager" && decoded.role !== "sf_coordinator") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid leave ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const leave: any = await db.collection("leaves").findOne({
      _id: new ObjectId(id),
    });

    if (!leave) {
      return NextResponse.json(
        { message: "Leave not found" },
        { status: 404 }
      );
    }

    if (leave.status === "approved") {
      return NextResponse.json(
        { message: "Cannot reject approved leave" },
        { status: 400 }
      );
    }

    if (leave.status === "rejected") {
      return NextResponse.json(
        { message: "Already rejected" },
        { status: 400 }
      );
    }

    const approvalField =
      decoded.role === "sf_coordinator"
        ? "approvals.sfCoordinator"
        : "approvals.manager";

    const teacher: any = await db.collection("users").findOne({
      _id: leave.userId,
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    const claimResult = await db.collection("leaves").updateOne(
      {
        _id: new ObjectId(id),
        status: { $ne: "approved" },
        [approvalField]: "pending",
      },
      {
        $set: {
          status: "rejected",
          [approvalField]: "rejected",
          reviewedBy: decoded.userId,
          reviewedAt: new Date(),
        },
      }
    );

    if (claimResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "This leave has already been handled" },
        { status: 409 }
      );
    }

    try {
      const referenceId = `REF-${Date.now()}`;
      const pdfUrl = await generateLeaveLetter({
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        department: teacher.department,
        designation: teacher.designation,
        fromDate: leave.from,
        toDate: leave.to,
        reason: leave.reason,
        days: leave.days,
        balance: teacher.leaveBalance?.[leave.leaveType] || 0,
        usedLeaves: 0,
        lastLeave: "-",
        status: "rejected",
        referenceId,
      });

      await sendLeaveEmail({
        to: teacher.email,
        teacherName: teacher.name,
        status: "rejected",
        pdfPath: pdfUrl,
        leaveDetails: {
          fromDate: leave.from,
          toDate: leave.to,
          leaveType: leave.leaveType,
          days: leave.days,
          reason: leave.reason,
          referenceId,
        },
      });

      await db.collection("leaves").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            pdfUrl,
          },
        }
      );

      await createNotification({
        userId: leave.userId,
        title: "Leave Rejected",
        message: `Your ${leave.leaveType} request was rejected by ${
          decoded.role === "sf_coordinator" ? "SF Coordinator" : "Manager"
        }.`,
        type: "leave",
        targetId: id,
      });
    } catch (sideEffectError) {
      console.error("LEAVE REJECT SIDE EFFECT ERROR:", sideEffectError);
    }

    return NextResponse.json({
      message: "Leave rejected successfully",
    });
  } catch (error) {
    console.error("LEAVE REJECT ERROR:", error);

    return NextResponse.json(
      { message: "Unable to reject leave. Please try again." },
      { status: 500 }
    );
  }
}
