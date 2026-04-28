import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  return jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET as string) as {
    userId: string;
    role: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");
    const userId = new ObjectId(user.userId);

    const notifications = await db
      .collection("notifications")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    const unreadCount = await db
      .collection("notifications")
      .countDocuments({ userId, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("NOTIFICATIONS LOAD ERROR:", error);
    return NextResponse.json(
      { message: "Unable to load notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    await db.collection("notifications").updateMany(
      { userId: new ObjectId(user.userId), read: false },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("NOTIFICATIONS UPDATE ERROR:", error);
    return NextResponse.json(
      { message: "Unable to update notifications." },
      { status: 500 }
    );
  }
}
