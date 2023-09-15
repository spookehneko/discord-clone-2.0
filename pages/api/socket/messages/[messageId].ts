import {NextApiRequest} from "next";
// types
import {NextApiResponseServerIo} from "@/types";
import {currentProfilePages} from "@/lib/current-profile-pages";
import {db} from "@/lib/db";
import {MemberRole} from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return res.status(405).json({error: "Method not allowed"})
    }
    try {
        /**
         * get profile from pages router
         */
        const profile = await currentProfilePages(req)

        /**
         * message id, server id, channel id
         */
        const {messageId, serverId, channelId} = req.query

        /**
         * content => request body
         */
        const {content} = req.body

        /**
         * no profile data => unauthorized, 401
         */
        if(!profile) {
            return res.status(401).json({error: "Unauthorized"})
        }
        /**
         * no server id => Server id missing, 400
         */
        if(!serverId) {
            return res.status(400).json({error: "Server id missing"})
        }
        /**
         * no channel id => Channel id missing, 400
         */
        if(!channelId) {
            return res.status(400).json({error: "Channel id missing"})
        }

        /**
         * fetch the server
         */
        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true
            }
        })
        /**
         * no server => Server not found, 404
         */
        if(!server) {
            return res.status(404).json({error: "Server not found"})
        }
        /**
         * find the channel
         */
        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string
            },
        })
        /**
         * no channel => Channel not found, 404
         */
        if(!channel) {
            return res.status(404).json({error: "Channel not found"})
        }

        // get the member
        const member = server.members.find(member => member.profileId === profile.id)

        /**
         * no member => Member not found, 404
         */
        if(!member) {
            return res.status(404).json({error: "Member not found"})
        }

        /**
         * get the message
         */

        let message = await db.message.findFirst({
            where: {
                id: messageId as string,
                channelId: channelId as string
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })
        /**
         * no message || message has been deleted => Message not found, 404
         */
        if(!message || message.deleted) {
            return res.status(404).json({error: "Message not found"});
        }

        /**
         * is message owner
         */
        const isMessageOwner = message.memberId === member.id;
        /**
         * is admin
         */
        const isAdmin = member.role === MemberRole.ADMIN;
        /**
         * is Moderator
         */
        const isModerator = member.role === MemberRole.MODERATOR
        /**
         * can modify => owner || admin || moderator
         */
        const canModify = isMessageOwner || isAdmin || isModerator
        /**
         * no access => unauthorized 401
         */
        if(!canModify) {
            return res.status(401).json({error: "Unauthorized"});
        }

        /**
         * request to delete => delete message <= soft delete
         * @fileUrl => null
         * @content => This message has been deleted
         * @deleted => true
         */
        if (req.method === "DELETE") {
            message = await db.message.update({
                where: {
                    id: messageId as string
                },
                data: {
                    fileUrl: null,
                    content: "This message has been deleted",
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        /**
         * request to update => update message ---------> *  owner can update
         * @content => content
         */
        if (req.method === "PATCH") {
            if(!isMessageOwner) {
                return res.status(401).json({error: "Unauthorized"})
            }

            message = await db.message.update({
                where: {
                    id: messageId as string
                },
                data: {
                    content
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }
        const updateKey = `chat:${channelId}:messages:update`;
        res?.socket?.server?.io?.emit(updateKey, message);
        return res.status(200).json(message)
    } catch (error) {
        console.log("[MESSAGE_ID]",error);
        return res.status(500).json({error: "Internal Server Error"})
    }
}