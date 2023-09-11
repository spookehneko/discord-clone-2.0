'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"


import {useModal} from "@/hooks/use-modal-store";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Check, Copy, RefreshCw} from "lucide-react";
import {useOrigin} from "@/hooks/use-origin";
import {useState} from "react";
import axios from "axios";

export const InviteModal = () => {
    /**
     * @hooks
     * Modal state
     * @type {{isOpen: boolean, onClose: function, type: string, data: any}}
     *
     * Origin state
     * @type {string}
     */
    const {onOpen, isOpen, onClose, type, data} = useModal()
    const origin = useOrigin()

    /**
     * @state
     *
     */
    const [copied, setCoppied] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)


    const isModalOpen = isOpen && type === 'invite'
    const server = data?.server

    /**
     * inviteUrl
     * http://localhost:3000/invite/1b7033d8-ee35-45e1-b187-a9427f17f788
     */
    const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

    /**
     * copy the invite url to clipboard
     */

    const onCopy = () => {
        navigator.clipboard.writeText(inviteUrl)
        setCoppied(true)

        setTimeout(() => {
            setCoppied(false)
        }, 1000)
    }

    /**
     * Generate a new invite url
     */

    const onNew = async () => {
        try {
            setIsLoading(true)
            const response = await axios.patch(`/api/servers/${server?.id}/invite-code`);

            onOpen('invite', {
                server: response.data
            })

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (<Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent className={'bg-white text-black p-0 overflow-hidden rounded-lg'}>
            <DialogHeader className={'pt-8 px-6'}>
                <DialogTitle className={'text-2xl text-center font-bold'}>
                    Invite Friends
                </DialogTitle>
            </DialogHeader>
            <div className={'p-6'}>
                <Label className={'uppercase text-xs text-zinc-500 dark:text-secondary/70 font-bold'}>
                    Server invite link
                </Label>
                <div className="flex items-center mt-2 gap-x-2">
                    <Input
                        readOnly
                        disabled={isLoading}
                        className={'bg-zinc-300/50 border-0 focus-visible: ring-0 text-black focus-visible:ring-offset-0'}
                        value={inviteUrl}
                    />
                    {/*copy button*/}
                    <Button size={'icon'} onClick={onCopy} disabled={isLoading}>
                        {copied
                            ? <Check className={'w-4 h-4'}/>
                            : <Copy className={'w-4 h-4'}/>
                        }
                    </Button>
                </div>
                <Button
                    onClick={onNew}
                    disabled={isLoading}
                    variant={'link'}
                    size={'sm'}
                    className={'text-xs text-zinc-500 mt-4'}
                >
                    Generate a new link
                    <RefreshCw className={'w-4 h-4 ml-2'}/>
                </Button>
            </div>
        </DialogContent>
    </Dialog>)
}