import clientPromise from "@/lib/mongodb";

export interface LeaveLimits {
  CL: number;
  VL: number;
  OD: number;
  DL: number;
  CML: number;
}

export interface SystemSettings {
  leaveLimits: LeaveLimits;
  emailNotifications: boolean;
  academicYearStart: string;
  academicYearEnd: string;
  updatedAt?: Date;
}

export const defaultLeaveLimits: LeaveLimits = {
  CL: 12,
  VL: 10,
  OD: 10,
  DL: 5,
  CML: 0,
};

export const defaultSystemSettings: SystemSettings = {
  leaveLimits: defaultLeaveLimits,
  emailNotifications: true,
  academicYearStart: "",
  academicYearEnd: "",
};

export async function getSystemSettings(): Promise<SystemSettings> {
  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  const settings = await db
    .collection<SystemSettings>("system_settings")
    .findOne({ key: "global" } as any);

  return {
    ...defaultSystemSettings,
    ...(settings || {}),
    leaveLimits: {
      ...defaultLeaveLimits,
      ...(settings?.leaveLimits || {}),
    },
  };
}

export async function saveSystemSettings(
  updates: Partial<SystemSettings>
): Promise<SystemSettings> {
  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  const current = await getSystemSettings();
  const next: SystemSettings = {
    ...current,
    ...updates,
    leaveLimits: {
      ...current.leaveLimits,
      ...(updates.leaveLimits || {}),
    },
    updatedAt: new Date(),
  };

  await db.collection("system_settings").updateOne(
    { key: "global" },
    {
      $set: {
        ...next,
        key: "global",
      },
    },
    { upsert: true }
  );

  return next;
}
