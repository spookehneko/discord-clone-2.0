import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    /**
     * get current profile
     */
    const profile = await currentProfile();
    /**
     * searchParams from url
     */
    const { searchParams } = new URL(req.url);
    /**
     * get server id from search params
     */
    const serverId = searchParams.get("serverId");
    /**
     * unauthorized
     * */
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    /**
     * no server id throw error 400
     */
    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    /**
     * no params.memberId throw error 400
     */
    if (!params.memberId) {
      return new NextResponse("Member ID Missing", { status: 400 });
    }

    /**
     * kick the member from the server
     * profile id check the user is an admin of the server
     */
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          deleteMany: {
            id: params.memberId,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("[MEMBER_ID_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    /**
     * get current profile
     */
    const profile = await currentProfile();
    /**
     * searchParams from url
     */
    const { searchParams } = new URL(req.url);

    /**
     * get role from request body
     */
    const { role } = await req.json();

    /**
     * get server id from search params
     */
    const serverId = searchParams.get("serverId");

    /**
     * unauthorized
     * */
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    /**
     * no server id throw error 400
     */
    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    /**
     * no params.memberId throw error 400
     */
    if (!params.memberId) {
      return new NextResponse("Member ID Missing", { status: 400 });
    }

    /**
     * update the server
     * profile id check the user is an admin of the server
     */

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId,
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server, { status: 200 });
  } catch (error) {
    console.log("[MEMBER_ID_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
