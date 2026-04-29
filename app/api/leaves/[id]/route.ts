import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/roleGuard";
import { ObjectId } from "mongodb";
import { generateLeaveLetter } from "@/lib/pdfGenerator";
import { sendLeaveEmail } from "@/lib/emailSender";
import { logActivity } from "@/lib/activityLogger";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, ["principal"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid leave ID" },
        { status: 400 }
      );
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { message: "Invalid leave status" },
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
        { message: "Leave request not found" },
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
        { message: "Already rejected" },
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

    const referenceId = `REF-${Date.now()}`;

    if (status === "rejected") {
      const claimResult = await db.collection("leaves").updateOne(
        { _id: new ObjectId(id), status: "pending" },
        {
          $set: {
            status: "rejected",
            "approvals.principal": "rejected",
            reviewedBy: auth.userId,
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

        await logActivity({
          userId: auth.userId,
          userName: auth.userName || "Principal",
          role: "principal",
          action: "REJECTED_LEAVE",
          targetId: id,
          targetType: "leave",
          message: `${teacher.name}'s leave was rejected`,
        });

        await createNotification({
          userId: leave.userId,
          title: "Leave Rejected",
          message: `Your ${leave.leaveType} request was rejected by Principal.`,
          type: "leave",
          targetId: id,
        });
      } catch (sideEffectError) {
        console.error("PRINCIPAL REJECTION SIDE EFFECT ERROR:", sideEffectError);
      }

      return NextResponse.json({
        message: "Leave rejected successfully",
      });
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

    const claimResult = await db.collection("leaves").updateOne(
      { _id: new ObjectId(id), status: "pending" },
      {
        $set: {
          status: "approved",
          "approvals.principal": "approved",
          reviewedBy: auth.userId,
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

    const balanceResult = await db.collection("users").updateOne(
      {
        _id: leave.userId,
        [`leaveBalance.${leaveType}`]: { $gte: leaveDays },
      },
      {
        $inc: {
          [`leaveBalance.${leaveType}`]: -leaveDays,
        },
      }
    );

    if (balanceResult.modifiedCount === 0) {
      await db.collection("leaves").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: "pending",
            "approvals.principal": "pending",
          },
          $unset: {
            reviewedBy: "",
            reviewedAt: "",
          },
        }
      );

      return NextResponse.json(
        { message: "Insufficient leave balance" },
        { status: 400 }
      );
    }

    try {
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
            pdfUrl,
          },
        }
      );

      await logActivity({
        userId: auth.userId,
        userName: auth.userName || "Principal",
        role: "principal",
        action: "APPROVED_LEAVE",
        targetId: id,
        targetType: "leave",
        message: `${teacher.name}'s leave was approved`,
      });

      await createNotification({
        userId: leave.userId,
        title: "Leave Approved",
        message: `Your ${leave.leaveType} request was approved by Principal.`,
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
    } catch (sideEffectError) {
      console.error("PRINCIPAL APPROVAL SIDE EFFECT ERROR:", sideEffectError);
    }

    return NextResponse.json({
      message: "Leave approved successfully",
    });
  } catch (error) {
    console.error("LEAVE STATUS UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Unable to update leave status. Please try again." },
      { status: 500 }
    );
  }
}
