"use client"

import {ServerWithMembersWithProfiles} from "@/types";
import {MemberRole} from "@prisma/client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {ChevronDownIcon, LogOut, PlusCircle, Settings, Trash, UserPlus, Users} from "lucide-react";
import {useModal} from "@/hooks/use-modal-store";

interface ServerHeaderProps {
    server: ServerWithMembersWithProfiles;
    role?: MemberRole;
}

export const ServerHeader = ({server, role}: ServerHeaderProps) => {
    /**
     * onOpen: Modal store
     * @see @/hooks/use-modal-store
     * set type of modal and pass data
     */
    const {onOpen} = useModal()

    /**
     * isAdmin: For Admin
     */
    const isAdmin = role === MemberRole.ADMIN
    /**
     * isModerator: For admin or moderator
     */
    const isModerator = isAdmin || role === MemberRole.MODERATOR

    return (<DropdownMenu>
        <DropdownMenuTrigger
            className={'focus:outline-none'}
            asChild
        >
            <button
                className={'w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition'}
            >
                {server.name}
                <ChevronDownIcon
                    className={'ml-auto w-5 h-5'}
                />
            </button>
        </DropdownMenuTrigger>
        {/*Dropdown content*/}
        <DropdownMenuContent className={'w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]'}>
            {isModerator && (
                <DropdownMenuItem
                    onClick={() => onOpen('invite', {server})}
                    className={'text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer'}>
                    Invite People
                    <UserPlus className={'ml-auto w-4 h-4'}/>
                </DropdownMenuItem>
            )}
            {isAdmin && (
                <DropdownMenuItem
                    onClick={() => onOpen("editServer", {server})}
                    className={'px-3 py-2 text-sm cursor-pointer'}>
                    Server Settings
                    <Settings className={'ml-auto w-4 h-4'}/>
                </DropdownMenuItem>
            )}
            {isAdmin && (
                <DropdownMenuItem
                    onClick={() => onOpen("members", {server})}
                    className={'px-3 py-2 text-sm cursor-pointer'}>
                    Manage Members
                    <Users className={'ml-auto w-4 h-4'}/>
                </DropdownMenuItem>
            )}
            {isModerator && (
                <DropdownMenuItem
                    onClick={() => onOpen("createChannel", {server})}
                    className={'px-3 py-2 text-sm cursor-pointer'}>
                    Create Channel
                    <PlusCircle className={'ml-auto w-4 h-4'}/>
                </DropdownMenuItem>
            )}
            {isModerator && (
                <DropdownMenuSeparator/>
            )}
            {isAdmin && (
                <DropdownMenuItem
                    onClick={() => onOpen('deleteServer', {server})}
                    className={'text-rose-500 px-3 py-2 text-sm cursor-pointer'}>
                    Delete Server
                    <Trash className={'ml-auto w-4 h-4'}/>
                </DropdownMenuItem>
            )}
            {!isAdmin && (
                <DropdownMenuItem
                    onClick={() => onOpen('leaveServer', {server})}
                    className={'text-rose-500 px-3 py-2 text-sm cursor-pointer'}>
                    Leave Server
                    <LogOut className={'ml-auto w-4 h-4'}/>
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>)
}