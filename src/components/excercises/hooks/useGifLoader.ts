import { useState, useEffect, useRef } from "react";

export function useGifLoader() {
  const [gifLoaded, setGifLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setGifLoaded(true);
  }, []);

  return { gifLoaded, imgRef, onLoad: () => setGifLoaded(true) };
}
