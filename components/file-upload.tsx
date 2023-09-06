'use client'

import {UploadDropzone} from "@/lib/uploadthing";
import {X} from 'lucide-react'
import Image from 'next/image'

import "@uploadthing/react/styles.css"

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string;
    endpoint: "messageFile" | "serverImage"
}

export const FileUpload = ({onChange, value, endpoint}: FileUploadProps) => {

    const fileType = value?.split(".").pop()

    if (value && fileType !== 'pdf') {
        return (
            <div className={'relative h-20 w-20'}>
                <Image
                    fill
                    src={value}
                    alt={'upload'}
                    className={'rounded-full'}
                    layout={'fill'}
                />
                <button
                    className={'p-1 rounded-full text-white bg-rose-500 absolute top-0 right-0 shadow-sm'}
                    onClick={() => onChange("")}
                    type={'button'}
                >
                    <X className={'h-4 w-4'}/>
                </button>
            </div>
        )
    }

    return (<UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0]?.url)
            }}
            onUploadError={(err) => {
                console.error(err)
            }}
        />
    )
}