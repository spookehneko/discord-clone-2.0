import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";

import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    /**
     * Check if the user is logged in
     */
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    /**
     * check serverId
     */

    if (!params.serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    /**
     * update the server || add a new invite code
     */
    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("[SERVER_ID] [PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
