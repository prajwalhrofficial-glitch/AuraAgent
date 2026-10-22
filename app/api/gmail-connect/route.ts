import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clientId: "mock-google-client-id-1234"
  });
}

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: "Authorization code and User ID are required." },
        { status: 400 }
      );
    }

    // Bypass real Google OAuth exchange and database integration entirely
    // Instantly return success to simulate the connection
    return NextResponse.json({ success: true, isSimulated: true });

  } catch (err: any) {
    console.error("Gmail connect mock exception:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
