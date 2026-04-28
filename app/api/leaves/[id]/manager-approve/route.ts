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

    if (decoded.role !== "manager") {
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
        { message: "Already approved" },
        { status: 400 }
      );
    }

    if (leave.status === "rejected") {
      return NextResponse.json(
        { message: "Cannot approve rejected leave" },
        { status: 400 }
      );
    }

    if (leave.approvals?.sfCoordinator !== "approved") {
      return NextResponse.json(
        { message: "SF Coordinator approval is required first" },
        { status: 400 }
      );
    }

    const teacher: any = await db.collection("users").findOne({
      _id: leave.userId,
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    const leaveType = leave.leaveType;
    const leaveDays = leave.days || 1;
    const currentBalance = teacher.leaveBalance?.[leaveType];

    if (currentBalance === undefined) {
      return NextResponse.json(
        { message: "Invalid leave type" },
        { status: 400 }
      );
    }

    if (currentBalance < leaveDays) {
      return NextResponse.json(
        { message: "Insufficient leave balance" },
        { status: 400 }
      );
    }

    await db.collection("users").updateOne(
      { _id: leave.userId },
      {
        $inc: {
          [`leaveBalance.${leaveType}`]: -leaveDays,
        },
      }
    );

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
      balance: currentBalance - leaveDays,
      usedLeaves: 0,
      lastLeave: "-",
      status: "approved",
      referenceId,
    });

    await sendLeaveEmail({
      to: teacher.email,
      teacherName: teacher.name,
      status: "approved",
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
          status: "approved",
          "approvals.manager": "approved",
          reviewedBy: decoded.userId,
          reviewedAt: new Date(),
          pdfUrl,
        },
      }
    );

    await createNotification({
      userId: leave.userId,
      title: "Leave Approved",
      message: `Your ${leave.leaveType} request was approved by Manager.`,
      type: "leave",
      targetId: id,
    });

    if (currentBalance - leaveDays <= 2) {
      await createNotification({
        userId: leave.userId,
        title: "Leave Balance Low",
        message: `Your ${leaveType} balance is now ${currentBalance - leaveDays}.`,
        type: "balance",
        targetId: id,
      });
    }

    return NextResponse.json({
      message: "Leave approved and email sent",
    });
  } catch (error) {
    console.error("MANAGER APPROVAL ERROR:", error);

    return NextResponse.json(
      { message: "Unable to approve leave. Please try again." },
      { status: 500 }
    );
  }
}
