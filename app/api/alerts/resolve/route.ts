import { NextRequest, NextResponse } from "next/server";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal Server Error";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, userId } = body;

    if (!alertId || !userId) {
      return NextResponse.json(
        { error: "alertId and userId are required" },
        { status: 400 }
      );
    }

    // Try to update in the real database if admin key is available
    try {
      const { hasInsforgeAdminKey, insforgeAdmin } = await import("@/lib/insforge-admin");
      if (hasInsforgeAdminKey) {
        const { data, error } = await insforgeAdmin.database
          .from("alerts")
          .update({ status: "resolved", resolved_at: new Date().toISOString() })
          .eq("id", alertId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ status: "resolved", alert: data });
      }
    } catch {
      // Fall through to mock response
    }

    // Simulated success response (demo / no DB key)
    return NextResponse.json({
      status: "resolved",
      alertId,
      resolvedAt: new Date().toISOString(),
      simulated: true,
    });
  } catch (err: unknown) {
    console.error("Error in POST /api/alerts/resolve:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
