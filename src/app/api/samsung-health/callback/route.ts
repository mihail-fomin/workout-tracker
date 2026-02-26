import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens } from "@/lib/samsung-health";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Samsung Health OAuth error:", error);
      return NextResponse.redirect(
        new URL("/settings/integrations?error=oauth_denied", request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=no_code", request.url)
      );
    }

    const tokens = await exchangeCodeForTokens(code);

    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    const existingToken = await prisma.samsungHealthToken.findFirst();

    if (existingToken) {
      await prisma.samsungHealthToken.update({
        where: { id: existingToken.id },
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt,
        },
      });
    } else {
      await prisma.samsungHealthToken.create({
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt,
        },
      });
    }

    return NextResponse.redirect(
      new URL("/settings/integrations?success=connected", request.url)
    );
  } catch (error) {
    console.error("Error handling Samsung Health callback:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=callback_failed", request.url)
    );
  }
}
