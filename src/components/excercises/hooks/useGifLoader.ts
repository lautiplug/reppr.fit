import { useState } from "react";

export function useGifLoader() {
  const [gifLoaded, setGifLoaded] = useState(false);

  return { gifLoaded, onLoad: () => setGifLoaded(true) };
}
