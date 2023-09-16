import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    /**
     * get profile for pages router
     */
    const profile = await currentProfilePages(req);

    /**
     * body => content, fileUrl
     * query => serverId, channelId
     */
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    /**
     * no profile => unauthorized => 401
     */
    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    /**
     * no server id => server id missing => 400
     */
    if (!serverId) {
      return res.status(400).json({ message: "Server id missing" });
    }
    /**
     * no channel id => channel id missing => 400
     */
    if (!channelId) {
      return res.status(400).json({ message: "Channel id missing" });
    }
    /**
     * no content => content missing => 400
     */
    if (!content) {
      return res.status(400).json({ message: "Content missing" });
    }

    /**
     * get server and confirm that profile is a member of the server
     */
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    /**
     * no server => server not found => 404
     */
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    /**
     * find the channel in the server
     */
    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });
    /**
     * no channel => channel not found => 404
     */
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    /**
     * find the member in the server
     */
    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    /**
     * no member => member not found => 404
     */
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    /**
     * create the message
     */
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channelId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(201).json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
