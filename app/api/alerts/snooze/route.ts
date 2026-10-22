import { NextRequest, NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal Server Error";
}

const SNOOZE_DURATIONS: Record<string, number> = {
  "30 mins": 30 * 60 * 1000,
  "1 hour": 60 * 60 * 1000,
  "Tomorrow": 24 * 60 * 60 * 1000,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, userId, duration } = body;

    if (!alertId || !userId || !duration) {
      return NextResponse.json(
        { error: "alertId, userId, and duration are required" },
        { status: 400 }
      );
    }

    const ms = SNOOZE_DURATIONS[duration];
    if (!ms) {
      return NextResponse.json(
        { error: `Invalid duration. Must be one of: ${Object.keys(SNOOZE_DURATIONS).join(", ")}` },
        { status: 400 }
      );
    }

    const snoozeUntil = new Date(Date.now() + ms).toISOString();

    // Try to update in the real database if admin key is available
    try {
      const { hasInsforgeAdminKey, insforgeAdmin } = await import("@/lib/insforge-admin");
      if (hasInsforgeAdminKey) {
        const { data, error } = await insforgeAdmin.database
          .from("alerts")
          .update({ status: "snoozed", snoozed_until: snoozeUntil })
          .eq("id", alertId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ status: "snoozed", until: snoozeUntil, alert: data });
      }
    } catch {
      // Fall through to mock response
    }

    // Simulated success response (demo / no DB key)
    return NextResponse.json({
      status: "snoozed",
      alertId,
      duration,
      until: snoozeUntil,
      simulated: true,
    });
  } catch (err: unknown) {
    console.error("Error in POST /api/alerts/snooze:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
