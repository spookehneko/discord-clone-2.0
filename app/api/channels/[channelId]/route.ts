import {NextResponse} from "next/server";
import {currentProfile} from "@/lib/current-profile";
import {db} from "@/lib/db";
import {MemberRole} from "@prisma/client";

export async function DELETE(req: Request, {params}: {
    params: {
        channelId: string
    }
}) {
    try {
        /**
         * Get the current profile
         */
        const profile = await currentProfile()
        /**
         * no logged-in user => unauthorized access, 401
         */
        if (!profile) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        /**
         * search params => serverId
         */
        const {searchParams} = new URL(req.url)
        const serverId = searchParams.get("serverId");
        /**
         * no server id => server id missing , 400
         */
        if (!serverId) {
            return new NextResponse('Server id missing', {status: 400})
        }
        /**
         * no params channel id => channel id missing, 400
         */
        if (!params.channelId) {
            return new NextResponse('Channel id missing', {status: 400})
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
                            in: [MemberRole.MODERATOR, MemberRole.ADMIN]
                        }
                    }
                }
            },
            data: {
                channels: {
                    delete: {
                        id: params.channelId,
                        name: {
                            not: "general"
                        }
                    }
                }
            }
        })

        return NextResponse.json(server, {status: 200})

    } catch (error) {
        console.log("[Channel_ID_DELETE]", error);
        return new NextResponse("Internal Server Error", {status: 500})
    }
}