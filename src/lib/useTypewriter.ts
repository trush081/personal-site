'use client';

import { useEffect, useRef, useState } from 'react';

const HOLD = 50; // ticks to wait after message is complete before rendering next message
const DELAY = 50; // tick length in mS

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return undefined;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

// Types out each message one character at a time, pausing between messages.
const useTypewriter = (messages: string[], loopMessage = false) => {
  const [idx, updateIter] = useState(0); // points to current message
  const [message, updateMessage] = useState(messages[0]);
  const [char, updateChar] = useState(0); // points to current char
  const [isActive, setIsActive] = useState(true); // disable when all messages are printed

  useInterval(() => {
    let newIdx = idx;
    let newChar = char;
    if (char - HOLD >= messages[idx].length) {
      newIdx += 1;
      newChar = 0;
    }
    if (newIdx === messages.length) {
      if (loopMessage) {
        updateIter(0);
        updateChar(0);
      } else {
        setIsActive(false);
      }
    } else {
      updateMessage(messages[newIdx].slice(0, newChar));
      updateIter(newIdx);
      updateChar(newChar + 1);
    }
  }, isActive ? DELAY : null);

  return {
    message,
    pause: () => setIsActive(false),
    resume: () => idx < messages.length && setIsActive(true),
  };
};

export default useTypewriter;
