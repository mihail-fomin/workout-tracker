import { NextResponse } from "next/server";
import { initiateOAuth } from "@/lib/samsung-health";

export async function GET() {
  try {
    const authUrl = initiateOAuth();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating Samsung Health OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 }
    );
  }
}
