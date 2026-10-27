import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");
  const username = (searchParams.get("username") || "").trim().slice(0, 24);

  if (!room || !username) {
    return NextResponse.json({ error: "room ve username gerekli" }, { status: 400 });
  }

  const identity = `${username}-${Math.random().toString(36).slice(2, 7)}`;

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity, name: username }
  );

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return NextResponse.json({ token: await at.toJwt() });
}