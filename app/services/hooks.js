import { useEffect, useRef } from 'react';

export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export const useAnimationFrame = (callback, interval=0, running=true) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef();
  const startTimeRef = useRef();
  const previousTimeRef = useRef();
  const tickNumber = useRef(1);
  const status = useRef(false);

  const animate = time => {
    const timeElapsed = time - startTimeRef.current;
    const newTick = Math.round(timeElapsed / interval);
    if (newTick > tickNumber.current) {
      tickNumber.current = newTick;
      callback(timeElapsed, tickNumber.current, time - previousTimeRef.current)

      previousTimeRef.current = time;
    }

    if (status.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }

  useEffect(() => {
    status.current = running;

    if (running) {
      startTimeRef.current = new Date().getTime();
      previousTimeRef.current = new Date().getTime();
      tickNumber.current = 1;

      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current)
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
    }
  }, [running]);
}
