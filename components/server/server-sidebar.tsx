import {currentProfile} from "@/lib/current-profile";
import {redirectToSignIn} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";

interface ServerSidebarProps {
    serverId: string;
}

export const ServerSidebar = async ({
                                        serverId
                                    }: ServerSidebarProps) => {

    const profile = await currentProfile()

    if (!profile) {
        return redirectToSignIn()
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc"
                }
            },
            members: {
                include: {
                    profile: true
                },
                orderBy: {
                    role: "asc"
                }
            }
        }
    })

    if (!server) {
        return redirect("/")
    }

    return <div>
        server sidebar component
    </div>
}