import { NextRequest, NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal Server Error";
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, userId, flagged } = body;

    if (!alertId || !userId || typeof flagged !== "boolean") {
      return NextResponse.json(
        { error: "alertId, userId, and flagged (boolean) are required" },
        { status: 400 }
      );
    }

    // Try to update in the real database if admin key is available
    try {
      const { hasInsforgeAdminKey, insforgeAdmin } = await import("@/lib/insforge-admin");
      if (hasInsforgeAdminKey) {
        const { data, error } = await insforgeAdmin.database
          .from("alerts")
          .update({
            is_follow_up: flagged,
            follow_up_flagged_at: flagged ? new Date().toISOString() : null,
          })
          .eq("id", alertId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ flagged, alert: data });
      }
    } catch {
      // Fall through to mock response
    }

    // Simulated success response (demo / no DB key)
    return NextResponse.json({
      flagged,
      alertId,
      flaggedAt: flagged ? new Date().toISOString() : null,
      simulated: true,
    });
  } catch (err: unknown) {
    console.error("Error in PATCH /api/alerts/followup:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
