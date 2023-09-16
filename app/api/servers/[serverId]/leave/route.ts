import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    /**
     * Get the current profile
     */
    const profile = await currentProfile();

    /**
     * unauthorized if not logged in
     */
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    /**
     * if the serverId from the params is missing
     */
    if (!params.serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    /**
     * Leave from the server
     */

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: {
          not: profile.id,
        },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("SERVER_ID_LEAVE_PATCH_ERROR: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
