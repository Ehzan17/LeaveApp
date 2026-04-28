"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const leaveTypes = ["CL", "VL", "OD", "DL", "CML"] as const;

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    leaveLimits: { CL: 12, VL: 10, OD: 10, DL: 5, CML: 0 },
    emailNotifications: true,
    academicYearStart: "",
    academicYearEnd: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchSettings = async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.settings) {
      setSettings(data.settings);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    const token = sessionStorage.getItem("token");
    setSaving(true);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.message || "Unable to save settings");
      return;
    }

    toast.success(data.message || "Settings saved");
  };

  const resetBalances = async () => {
    const token = sessionStorage.getItem("token");
    setResetting(true);

    const res = await fetch("/api/admin/settings/reset-balances", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    setResetting(false);
    setConfirmOpen(false);

    if (!res.ok) {
      toast.error(data.message || "Unable to reset balances");
      return;
    }

    toast.success(data.message || "Leave balances reset");
  };

  if (loading) {
    return <div className="text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="mt-1 text-sm text-gray-400">
          Manage leave limits, notifications, and academic year resets.
        </p>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Leave Limits</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {leaveTypes.map((type) => (
              <label key={type} className="block">
                <span className="text-sm text-gray-400">{type}</span>
                <input
                  type="number"
                  min={0}
                  value={settings.leaveLimits[type]}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      leaveLimits: {
                        ...settings.leaveLimits,
                        [type]: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-black/40 p-3"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-gray-400">Academic Year Start</span>
            <input
              type="date"
              value={settings.academicYearStart}
              onChange={(e) =>
                setSettings({ ...settings, academicYearStart: e.target.value })
              }
              className="mt-2 w-full rounded-xl border border-gray-700 bg-black/40 p-3"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-400">Academic Year End</span>
            <input
              type="date"
              value={settings.academicYearEnd}
              onChange={(e) =>
                setSettings({ ...settings, academicYearEnd: e.target.value })
              }
              className="mt-2 w-full rounded-xl border border-gray-700 bg-black/40 p-3"
            />
          </label>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-black/20 p-4">
          <span>
            <span className="block font-medium">Email Notifications</span>
            <span className="text-sm text-gray-400">
              Send approval and rejection emails with PDF attachments.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) =>
              setSettings({ ...settings, emailNotifications: e.target.checked })
            }
            className="h-5 w-5"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="rounded-xl bg-red-600 px-5 py-3 font-medium hover:bg-red-700"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 font-medium text-yellow-300 hover:bg-yellow-500/20"
          >
            Reset All Leave Balances
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111] p-6 shadow-2xl">
            <h3 className="text-xl font-semibold">Confirm balance reset</h3>
            <p className="mt-3 text-sm text-gray-400">
              This will reset every non-admin user's leave balances to the
              configured defaults. Users and leave history will not be deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl bg-gray-800 px-4 py-2 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={resetBalances}
                disabled={resetting}
                className="rounded-xl bg-red-600 px-4 py-2 hover:bg-red-700"
              >
                {resetting ? "Resetting..." : "Reset Balances"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
