'use client'

import {ChannelType, MemberRole} from "@prisma/client";

import {ServerWithMembersWithProfiles} from "@/types";
import {ActionTooptip} from "@/components/action-tooltip";
import {Plus, Settings} from "lucide-react";
import {useModal} from "@/hooks/use-modal-store";

interface ServerSectionProps {
    label: string;
    role?: MemberRole;
    sectionType: "channels" | "members";
    channelType?: ChannelType;
    server?: ServerWithMembersWithProfiles
}

export const ServerSection = ({label, role, sectionType, channelType, server}: ServerSectionProps) => {
    /**
     * onOpen: open modal
     */
    const {onOpen} = useModal()
    return (
        <div className={'flex items-center justify-between py-2'}>
            <p className={'text-xs uppercase text-semibold text-zinc-500 dark:text-zinc-400'}>{label}</p>
            {role !== MemberRole.GUEST && sectionType === 'channels' && (
                <ActionTooptip label={'Create Channel'} side={'top'}>
                    <button
                        onClick={() => onOpen("createChannel", { channelType})}
                        className={'text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition'}>
                        <Plus className={'h-4 w-4'}/>
                    </button>
                </ActionTooptip>)}
            {role === MemberRole.ADMIN && sectionType === 'members' && (
                <ActionTooptip label={'Manage Member'} side={'top'}>
                    <button
                        onClick={() => onOpen("members", {server})}
                        className={'text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition'}>
                        <Settings className={'h-4 w-4'}/>
                    </button>
                </ActionTooptip>
            )}
        </div>
    )
}
