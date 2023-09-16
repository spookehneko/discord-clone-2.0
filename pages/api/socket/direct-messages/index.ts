import {NextApiRequest} from "next";
import {NextApiResponseServerIo} from "@/types";
import {currentProfilePages} from "@/lib/current-profile-pages";
import {db} from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
    if (req.method !== 'POST') {
        return res.status(405).json({message: "Method not allowed"})
    }
    try {
        /**
         * get profile for pages router
         */
        const profile = await currentProfilePages(req)

        /**
         * body => content, fileUrl
         * query => serverId, channelId
         */
        const {content, fileUrl} = req.body;
        const { conversationId} = req.query;

        /**
         * no profile => unauthorized => 401
         */
        if (!profile) {
            return res.status(401).json({message: "Unauthorized"})
        }

        /**
         * no Conversation id => Conversation Id missing => 400
         */
        if (!conversationId) {
            return res.status(400).json({message: "Conversation id missing"})
        }
        /**
         * no content => content missing => 400
         */
        if (!content) {
            return res.status(400).json({message: "Content missing"})
        }

        const conversation  = await db.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    {
                        memberOne: {
                            profileId: profile.id
                        }
                    },
                    {
                        memberTwo: {
                            profileId: profile.id
                        }
                    }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        })
        /**
         * no conversation => Conversation not found => 404
         */
        if (!conversation) {
            return res.status(404).json({message: "Conversation not found"})
        }

        /**
         * find the member in the server
         */
        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

        /**
         * no member => member not found => 404
         */
        if (!member) {
            return res.status(404).json({message: "Member not found"})
        }
        /**
         * create the message
         */
        const message = await db.directMessage.create({
            data: {
                content,
                fileUrl,
                conversationId: conversationId as string,
                memberId: member.id,
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        const coversationKey = `chat:${conversationId}:messages`;

        res?.socket?.server?.io?.emit(coversationKey, message)

        return res.status(201).json(message)
    } catch (error) {
        console.error("[DIRECT_MESSAGES_POST]", error)
        res.status(500).json({error: 'Internal server error'})
    }

}