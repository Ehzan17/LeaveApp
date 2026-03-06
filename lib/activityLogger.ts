import clientPromise from "@/lib/mongodb";

interface LogParams {
  userId: string;
  userName: string;
  role: string;
  action: string;
  targetId?: string;
  targetType?: string;
  message: string;
}

export async function logActivity(params: LogParams) {
  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  await db.collection("activity_logs").insertOne({
    userId: params.userId,
    userName: params.userName,
    role: params.role,
    action: params.action,
    targetId: params.targetId || null,
    targetType: params.targetType || null,
    message: params.message,
    createdAt: new Date(),
  });
}