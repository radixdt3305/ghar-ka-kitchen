import { useState, useEffect, useCallback } from "react";

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(0);
  const isActive = seconds > 0;

  const start = useCallback(
    () => setSeconds(initialSeconds),
    [initialSeconds],
  );

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return { seconds, isActive, start };
}
