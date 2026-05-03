"use client";

import { useEffect, useState } from "react";

export function useTypewriter(
  text: string,
  startTyping: boolean,
  speed: number = 20
) {

  const [displayedText, setDisplayedText] =
    useState("");

  useEffect(() => {

    if (!startTyping) {
      setDisplayedText("");
      return;
    }

    let index = 0;

    const interval = setInterval(() => {

      index++;

      setDisplayedText(
        text.slice(0, index)
      );

      if (index >= text.length) {
        clearInterval(interval);
      }

    }, speed);

    return () => {
      clearInterval(interval);
    };

  }, [text, startTyping, speed]);

  return displayedText;
}