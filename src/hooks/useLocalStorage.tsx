// src/hooks/useLocalStorage.ts
import { useEffect, useState } from "react";

export const useLocalStorage = <S,>(
  key: string,
  initialState: S | (() => S),
): [S, React.Dispatch<React.SetStateAction<S>>] => {
  const [state, setState] = useState<S>(() => {
    if (typeof window === "undefined") {
      return typeof initialState === "function"
        ? (initialState as () => S)()
        : initialState;
    }
    const item = window.localStorage.getItem(key);
    return item
      ? parse<S>(item)
      : typeof initialState === "function"
        ? (initialState as () => S)()
        : initialState;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
};

const parse = <T,>(value: string): T => {
  try {
    return JSON.parse(value);
  } catch {
    return value as T;
  }
};
