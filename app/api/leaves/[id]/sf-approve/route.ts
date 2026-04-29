import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
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

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    if (decoded.role !== "sf_coordinator") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid leave ID" },
        { status: 400 }
      );
    }

    // ✅ FETCH LEAVE FIRST (important)
    const leave: any = await db.collection("leaves").findOne({
      _id: new ObjectId(id),
    });

    if (!leave) {
      return NextResponse.json(
        { message: "Leave not found" },
        { status: 404 }
      );
    }

    // ✅ prevent re-approval
    if (leave.approvals?.sfCoordinator === "approved") {
      return NextResponse.json(
        { message: "Already approved by SF Coordinator" },
        { status: 400 }
      );
    }

    // ✅ prevent approving rejected leave
    if (leave.status === "rejected") {
      return NextResponse.json(
        { message: "Cannot approve rejected leave" },
        { status: 400 }
      );
    }

    const result = await db.collection("leaves").updateOne(
      {
        _id: new ObjectId(id),
        status: { $ne: "rejected" },
        "approvals.sfCoordinator": "pending",
      },
      {
        $set: {
          "approvals.sfCoordinator": "approved"
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "This leave has already been handled" },
        { status: 409 }
      );
    }

    try {
      await createNotification({
        userId: leave.userId,
        title: "Leave Forwarded",
        message: `Your ${leave.leaveType} request was approved by SF Coordinator and forwarded to Manager.`,
        type: "leave",
        targetId: id,
      });
    } catch (sideEffectError) {
      console.error("SF APPROVAL SIDE EFFECT ERROR:", sideEffectError);
    }

    return NextResponse.json({
      message: "Leave approved by SF Coordinator",
      result,
    });

  } catch (error) {
    console.error("SF APPROVAL ERROR:", error);

    return NextResponse.json(
      { message: "Unable to approve leave. Please try again." },
      { status: 500 }
    );
  }
}
