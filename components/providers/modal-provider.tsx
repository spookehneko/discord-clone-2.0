'use client'

import {useEffect, useState} from "react";
import {InviteModal} from "@/components/modals/invite-modal";
import {CreateServerModal} from "@/components/modals/create-server-modal";


export const ModalProvider = () => {

    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <CreateServerModal/>
            <InviteModal/>
        </>
    )
}