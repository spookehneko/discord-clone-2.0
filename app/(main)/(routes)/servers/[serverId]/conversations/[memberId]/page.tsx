import {currentProfile} from "@/lib/current-profile";
import {redirectToSignIn} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {redirect} from "next/navigation";
import {getOrCreateConversation} from "@/lib/conversation";
import {ChatHeader} from "@/components/chat/chat-header";
import {ChatMessages} from "@/components/chat/chat-messages";
import {ChatInput} from "@/components/chat/chat-input";
import {MediaRoom} from "@/components/media-room";

interface MemberIdPageProps {
    params: {
        memberId: string;
        serverId: string
    },
    searchParams: {
        video?: boolean
    }
}

const MemberIdPage = async ({params, searchParams}: MemberIdPageProps) => {
    const profile = await currentProfile()
    if (!profile) return redirectToSignIn()

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        },
        include: {
            profile: true
        }
    })

    if (!currentMember) {
        return redirect('/')
    }

    const conversation = await getOrCreateConversation(currentMember.id, params.memberId)

    if (!conversation) {
        return redirect(`/server/${params.serverId}`)
    }

    const {memberOne, memberTwo} = conversation

    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

    return (
        <div className={'bg-white dark:bg-[#313338] flex flex-col h-full'}>
            <ChatHeader
                serverId={params.serverId}
                name={otherMember.profile.name}
                type={"conversation"}
                imageUrl={otherMember.profile.imageUrl}
            />
            {searchParams.video && <MediaRoom chatId={conversation.id} video={true} audio={true} />}
            {!searchParams.video && (
                <>
                    <ChatMessages
                        member={currentMember}
                        name={otherMember.profile.name}
                        type={'conversation'}
                        chatId={conversation.id}
                        apiUrl={'/api/direct-messages'}
                        paramKey={'conversationId'}
                        paramValue={conversation.id}
                        socketUrl={'/api/socket/direct-messages'}
                        socketQuery={{
                            conversationId: conversation.id
                        }}
                    />
                    <ChatInput
                        name={otherMember.profile.name}
                        type={'conversation'}
                        apiUrl={'/api/socket/direct-messages'}
                        query={{
                            conversationId: conversation.id
                        }}
                    />
                </>
            )}
        </div>
    )


}

export default MemberIdPage