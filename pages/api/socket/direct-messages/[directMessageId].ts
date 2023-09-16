import { db } from "@/lib/db";
import { NextApiRequest } from "next";
import { MemberRole } from "@prisma/client";
// types
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    /**
     * get profile from pages router
     */
    const profile = await currentProfilePages(req);

    /**
     * direct Message Id
     */
    const { directMessageId, conversationId } = req.query;

    /**
     * content => request body
     */
    const { content } = req.body;

    /**
     * no profile data => unauthorized, 401
     */
    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    /**
     * no Conversation Id => Conversation Id missing, 400
     */
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation id missing" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });
    /**
     * no conversation => Conversation not found => 404
     */
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    /**
     * find the member in the server
     */
    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    /**
     * no member => member not found => 404
     */
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    /**
     * get the message
     */

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });
    /**
     * no message || message has been deleted => Message not found, 404
     */
    if (!directMessage || directMessage.deleted) {
      return res.status(404).json({ error: "Message not found" });
    }

    /**
     * is message owner
     */
    const isMessageOwner = directMessage.memberId === member.id;
    /**
     * is admin
     */
    const isAdmin = member.role === MemberRole.ADMIN;
    /**
     * is Moderator
     */
    const isModerator = member.role === MemberRole.MODERATOR;
    /**
     * can modify => owner || admin || moderator
     */
    const canModify = isMessageOwner || isAdmin || isModerator;
    /**
     * no access => unauthorized 401
     */
    if (!canModify) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    /**
     * request to delete => delete message <= soft delete
     * @fileUrl => null
     * @content => This message has been deleted
     * @deleted => true
     */
    if (req.method === "DELETE") {
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          fileUrl: null,
          content: "This message has been deleted",
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    /**
     * request to update => update message ---------> *  owner can update
     * @content => content
     */
    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }
    const updateKey = `chat:${conversation.id}:messages:update`;
    res?.socket?.server?.io?.emit(updateKey, directMessage);
    return res.status(200).json(directMessage);
  } catch (error) {
    console.log("[MESSAGE_ID]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
