import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/roleGuard";
import clientPromise from "@/lib/mongodb";
import { getSystemSettings } from "@/lib/systemSettings";
import { logActivity } from "@/lib/activityLogger";

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await getSystemSettings();
    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const result = await db.collection("users").updateMany(
      { role: { $nin: ["admin"] } },
      {
        $set: {
          leaveBalance: settings.leaveLimits,
        },
      }
    );

    await logActivity({
      userId: auth.userId,
      userName: auth.userName || "Admin",
      role: "admin",
      action: "RESET_LEAVE_BALANCES",
      targetType: "users",
      message: `Reset leave balances for ${result.modifiedCount} user(s)`,
    });

    return NextResponse.json({
      message: `Reset leave balances for ${result.modifiedCount} user(s)`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("RESET BALANCES ERROR:", error);
    return NextResponse.json(
      { message: "Unable to reset leave balances. Please try again." },
      { status: 500 }
    );
  }
}
