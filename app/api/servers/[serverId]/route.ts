import {NextResponse} from "next/server";
import {currentProfile} from "@/lib/current-profile";
import {db} from "@/lib/db";

export async function PATCH(req: Request, {params}: {
    params: {
        serverId: string
    }
}) {
    try {
        /**
         * Check if the user is logged in
         */
        const profile = await currentProfile()

        /**
         * Get the name and image url from the request body
         */
        const {name, imageUrl} = await req.json()

        if (!profile) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        /**
         * check serverId
         */

        if (!params.serverId) {
            return new NextResponse("Server ID Missing", {status: 400})
        }

        /**
         * update the server
         */

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                name,
                imageUrl
            }
        })

        return NextResponse.json(server, {
            status: 200
        })
    } catch (error) {
        console.log("[SERVER_ID] [PATCH]", error)
        return new NextResponse("Internal Server Error", {status: 500})
    }
}