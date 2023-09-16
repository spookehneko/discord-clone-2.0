import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: {
      channelId: string;
    };
  }
) {
  try {
    /**
     * Get the current profile
     */
    const profile = await currentProfile();
    /**
     * no logged-in user => unauthorized access, 401
     */
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    /**
     * search params => serverId
     */
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    /**
     * no server id => server id missing , 400
     */
    if (!serverId) {
      return new NextResponse("Server id missing", { status: 400 });
    }
    /**
     * no params channel id => channel id missing, 400
     */
    if (!params.channelId) {
      return new NextResponse("Channel id missing", { status: 400 });
    }
    /**
     * delete the channel of the server
     */
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.MODERATOR, MemberRole.ADMIN],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("[Channel_ID_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      channelId: string;
    };
  }
) {
  try {
    /**
     * Get the current profile
     */
    const profile = await currentProfile();
    /**
     * no logged-in user => unauthorized access, 401
     */
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    /**
     * name, type from req body
     * search params => serverId
     */
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    /**
     * no server id => server id missing , 400
     */
    if (!serverId) {
      return new NextResponse("Server id missing", { status: 400 });
    }
    /**
     * no params channel id => channel id missing, 400
     */
    if (!params.channelId) {
      return new NextResponse("Channel id missing", { status: 400 });
    }
    /**
     * check if the name is 'general'
     */
    if (name === "general") {
      return new NextResponse("Name Cannot be 'general'.", { status: 400 });
    }

    /**
     * update the channel of the server
     */
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.MODERATOR, MemberRole.ADMIN],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("[Channel_ID_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
