import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: Request) {
  try {
    /**
     * Check if user is logged in
     */
    const profile = await currentProfile();
    /**
     * Get the name and type of the channel from the request body
     */
    const { name, type } = await req.json();
    /**
     * Get the serverId from the query string
     */
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    /**
     * check user profile
     */
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    /**
     * check if serverId is provided
     */
    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }
    /**
     * check if the name is 'general'
     */
    if (name === "general") {
      return new NextResponse("Name Cannot be 'general'.", { status: 400 });
    }
    /**
     *
     */
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.error("CHANNELS_POST", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
