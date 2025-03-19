import { useState, useEffect, useCallback, useRef } from "react";

type UseTimerProps = {
  initialTime: number; // in seconds
  onTimeEnd?: () => void;
  autoStart?: boolean;
};

type UseTimerReturn = {
  time: number; // remaining time in seconds
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  formattedTime: string; // time in MM:SS format
};

export function useTimer({
  initialTime,
  onTimeEnd,
  autoStart = false
}: UseTimerProps): UseTimerReturn {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const onTimeEndRef = useRef(onTimeEnd);
  const intervalRef = useRef<number | null>(null);

  // Update ref when onTimeEnd changes
  useEffect(() => {
    onTimeEndRef.current = onTimeEnd;
  }, [onTimeEnd]);

  // Format seconds to MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const formattedTime = formatTime(time);

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning && time > 0) {
      setIsRunning(true);
    }
  }, [isRunning, time]);

  // Pause the timer
  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
    }
  }, [isRunning]);

  // Reset the timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(initialTime);
  }, [initialTime]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            // Time has ended
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (onTimeEndRef.current) {
              onTimeEndRef.current();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    formattedTime
  };
}
