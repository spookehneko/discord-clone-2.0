import {useEffect, useState} from "react";
/**
 * use origin for reading current URL
 */
export const useOrigin = () => {
    const [mounted, setMounted] = useState<boolean>(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const origin = typeof window !== 'undefined' && window.location.origin || ''

    if (!mounted) return "";

    return origin;
}