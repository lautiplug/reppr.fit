import { useState, useRef } from "react";

export function useGifLoader() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [gifLoaded, setGifLoaded] = useState(() => imgRef.current?.complete ?? false);

  return { gifLoaded, imgRef, onLoad: () => setGifLoaded(true) };
}
