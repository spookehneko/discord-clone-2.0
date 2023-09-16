"use client";

import qs from "query-string";
import { Video, VideoOff } from "lucide-react";
import { ActionTooptip } from "@/components/action-tooltip";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const ChatVideoButton = () => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const isVideo = searchParams?.get("video");

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathName || "",
        query: {
          video: isVideo ? undefined : true,
        },
      },
      {
        skipNull: true,
      }
    );
    router.push(url);
  };
  const Icon = isVideo ? VideoOff : Video;
  const tooltipLabel = isVideo ? "End Video Call" : "Start Video Call";

  return (
    <ActionTooptip side={"bottom"} label={tooltipLabel}>
      <button onClick={onClick} className={"hover:opacity-75 transition mr-4"}>
        <Icon className={"h-6 w-6 text-zinc-500 dark:text-zinc-400"} />
      </button>
    </ActionTooptip>
  );
};
