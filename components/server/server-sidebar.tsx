import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { redirectToSignIn } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import { currentProfile } from "@/lib/current-profile";
import { ChannelType, MemberRole } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerMember } from "@/components/server/server-member";
import { ServerHeader } from "@/components/server/server-header";
import { ServerSearch } from "@/components/server/server-search";
import { ServerSection } from "@/components/server/server-section";
import { ServerChannel } from "@/components/server/server-channel";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

interface ServerSidebarProps {
  serverId: string;
}

/**
 * iconMap: ChannelType -> Icon
 * @param channel
 * @constructor
 * @returns Icon
 */

const iconMap = {
  [ChannelType.TEXT]: <Hash className={"mr-2 h-4 w-4"} />,
  [ChannelType.AUDIO]: <Mic className={"mr-2 h-4 w-4"} />,
  [ChannelType.VIDEO]: <Video className={"mr-2 h-4 w-4"} />,
};

/**
 * Role Icon map
 * @param role
 * @constructor
 * @returns Icon
 */

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className={"mr-2 h-4 w-4 text-indigo-500"} />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className={"mr-2 h-4 w-4 text-rose-500"} />,
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  /**
   * profile: currentProfile
   */

  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  /**
   * server: Match serverId and profileId
   */

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
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

  if (!server) {
    return redirect("/");
  }

  /**
   * TextChannels: ChannelType.TEXT
   */

  const textChannels = server?.channels?.filter(
    (channel) => channel.type === ChannelType.TEXT
  );

  /**
   * AudioChannels: ChannelType.AUDIO
   */

  const audioChannels = server?.channels?.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );

  /**
   * VideoChannels: ChannelType.VIDEO
   */

  const videoChannels = server?.channels?.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );

  /**
   * Members: without logged-in user
   */
  const members = server?.members?.filter(
    (member) => member.profileId !== profile.id
  );

  if (!server) {
    return redirect("/");
  }

  /**
   * current logged-in user role
   */

  const role = server.members?.find(
    (member) => member.profileId === profile?.id
  )?.role;

  return (
    <div
      className={`
        flex 
        flex-col
        h-full
        text-primary
        w-full
        dark:bg-[#2B2D31]
        bg-[#f2f3f5]
    `}
    >
      <ServerHeader server={server} role={role} />
      <ScrollArea className={"flex-1 px-3"}>
        <div className={"mt-2"}>
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  icon: roleIconMap[member.role],
                  name: member.profile.name,
                  id: member.profile.id,
                })),
              },
            ]}
          />
        </div>
        <Separator className={"bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"} />
        {!!textChannels?.length && (
          <div className={"mb-2"}>
            <ServerSection
              label={"Text Channels"}
              sectionType={"channels"}
              channelType={ChannelType.TEXT}
              role={role}
            />
            <div className={"space-y-2"}>
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className={"mb-2"}>
            <ServerSection
              label={"Voice Channels"}
              sectionType={"channels"}
              channelType={ChannelType.AUDIO}
              role={role}
            />
            <div className={"space-y-2"}>
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!videoChannels?.length && (
          <div className={"mb-2"}>
            <ServerSection
              label={"Video Channels"}
              sectionType={"channels"}
              channelType={ChannelType.VIDEO}
              role={role}
            />
            <div className={"space-y-2"}>
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className={"mb-2"}>
            <ServerSection
              label={"Members"}
              sectionType={"members"}
              role={role}
              server={server}
            />
            <div className={"space-y-2"}>
              {members.map((member) => (
                <ServerMember key={member.id} member={member} server={server} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
