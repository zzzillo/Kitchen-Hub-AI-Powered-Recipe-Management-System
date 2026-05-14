import { useEffect, useState } from "react";

export const useRotatingIndex = (itemCount: number, intervalMs: number) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (itemCount <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % itemCount);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [intervalMs, itemCount]);

  return activeIndex;
};
