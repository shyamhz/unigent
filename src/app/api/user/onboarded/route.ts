import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;

    // Only mark onboarded - don't set connections since user skipped
    await client.users.updateUser(userId, {
      publicMetadata: {
        ...meta,
        onboarded: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to mark onboarded:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
