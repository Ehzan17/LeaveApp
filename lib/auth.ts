import jwt from "jsonwebtoken";

export interface JWTPayload {
  userId: string;
  role: "teacher" | "admin" | "principal";
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}