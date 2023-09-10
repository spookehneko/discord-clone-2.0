import {currentProfile} from "@/lib/current-profile";
import {redirectToSignIn} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";
import {ChannelType} from "@prisma/client";
import {ServerHeader} from "@/components/server/server-header";

interface ServerSidebarProps {
    serverId: string;
}

export const ServerSidebar = async ({
                                        serverId
                                    }: ServerSidebarProps) => {

    /**
     * profile: currentProfile
     */

    const profile = await currentProfile()

    if (!profile) {
        return redirectToSignIn()
    }

    /**
     * server: Match serverId and profileId
     */

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

    /**
     * TextChannels: ChannelType.TEXT
     */

    const textChannels = server?.channels?.filter((channel) => channel.type === ChannelType.TEXT)

    /**
     * AudioChannels: ChannelType.AUDIO
     */

    const audioChannels = server?.channels?.filter((channel) => channel.type === ChannelType.AUDIO)

    /**
     * VideoChannels: ChannelType.VIDEO
     */

    const videoChannels = server?.channels?.filter((channel) => channel.type === ChannelType.VIDEO)

    /**
     * Members: without logged-in user
     */
    const members = server?.members?.filter((member) => member.profileId !== profile.id)

    if (!server) {
        return redirect("/")
    }

    const role = server.members?.find((member) => member.profileId === profile?.id)?.role;


    return (<div className={`
        flex 
        flex-col
        h-full
        text-primary
        w-full
        dark:bg-[#2B2D31]
        bg-[#f2f3f5]
    `}>
        <ServerHeader
            server={server}
            role={role}
        />
    </div>)
}