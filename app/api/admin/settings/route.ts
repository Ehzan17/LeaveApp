import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/roleGuard";
import { getSystemSettings, saveSystemSettings } from "@/lib/systemSettings";
import { logActivity } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const settings = await getSystemSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const settings = await saveSystemSettings({
      leaveLimits: body.leaveLimits,
      emailNotifications: Boolean(body.emailNotifications),
      academicYearStart: body.academicYearStart || "",
      academicYearEnd: body.academicYearEnd || "",
    });

    await logActivity({
      userId: auth.userId,
      userName: auth.userName || "Admin",
      role: "admin",
      action: "UPDATED_SYSTEM_SETTINGS",
      targetType: "system_settings",
      message: "System settings were updated",
    });

    return NextResponse.json({
      message: "Settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error("SETTINGS UPDATE ERROR:", error);
    return NextResponse.json(
      { message: "Unable to save settings. Please try again." },
      { status: 500 }
    );
  }
}
