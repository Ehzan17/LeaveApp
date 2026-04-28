import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

interface NotificationParams {
  userId: string | ObjectId;
  title: string;
  message: string;
  type?: "leave" | "balance" | "system";
  targetId?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type = "system",
  targetId,
}: NotificationParams) {
  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  await db.collection("notifications").insertOne({
    userId: typeof userId === "string" ? new ObjectId(userId) : userId,
    title,
    message,
    type,
    targetId: targetId || null,
    read: false,
    createdAt: new Date(),
  });
}
