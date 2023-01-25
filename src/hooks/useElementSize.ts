import { useLayoutEffect, useState } from "react";

export const useElementSize = (ref: React.RefObject<HTMLElement>) => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useLayoutEffect(() => {
        const updateSize = () => {
            if (ref.current) {
                const box = ref.current.getBoundingClientRect();
                setSize({
                    width: box.width,
                    height: box.height,
                });
            }
        };
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, [ref]);
    return size;
}