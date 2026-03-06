import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface AuthUser {
  userId: string;
  userName: string;
  role: string;
}

export function requireRole(
  req: NextRequest,
  allowedRoles: string[]
): AuthUser | NextResponse {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
      name: string;
      role: string;
    };

    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    return {
      userId: decoded.userId,
      userName: decoded.name, // ✅ properly mapped
      role: decoded.role,
    };

  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}