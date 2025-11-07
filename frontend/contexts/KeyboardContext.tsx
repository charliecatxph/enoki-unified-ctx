"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Poppins } from "next/font/google";
import styles from "../styles/VirtualKeyboard.module.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

interface KeyboardContextType {
  initKeyboard: (opts?: {
    initialValue?: string;
    placeholder?: string;
  }) => Promise<string>;
  flushKeyboard: () => string;
  killKeyboard: () => void;
}

const KeyboardContext = createContext<KeyboardContextType | null>(null);

export const useKeyboard = () => {
  const ctx = useContext(KeyboardContext);
  if (!ctx) throw new Error("useKeyboard must be inside KeyboardProvider");
  return ctx;
};

export const KeyboardProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [placeholder, setPlaceholder] = useState("Type something...");
  const [inputValue, setInputValue] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const [shift, setShift] = useState(false);

  const resolverRef = useRef<(val: string) => void>(null);

  // === Public API ===
  const initKeyboard = useCallback(
    (opts?: { initialValue?: string; placeholder?: string }) => {
      setPlaceholder(opts?.placeholder || "Type something...");
      setInputValue(opts?.initialValue || "");
      setIsVisible(true);
      setCapsLock(false);
      setShift(false);

      return new Promise<string>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    []
  );

  const flushKeyboard = useCallback(() => {
    const val = inputValue;
    setInputValue("");
    setIsVisible(false);
    if (resolverRef.current) {
      resolverRef.current(val);
      resolverRef.current = null;
    }
    return val;
  }, [inputValue]);

  const killKeyboard = useCallback(() => {
    const val = inputValue;
    setIsVisible(false);
    setInputValue("");
    if (resolverRef.current) {
      resolverRef.current(val);
      resolverRef.current = null;
    }
  }, [inputValue]);

  // === Keyboard logic ===
  const baseLayout = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "<<"],
    ["TAB", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["CAPS", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "ENTER"],
    ["SHIFT", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "SHIFT"],
    ["SPACE"],
  ];

  const shiftSymbols: Record<string, string> = {
    "`": "~",
    "1": "!",
    "2": "@",
    "3": "#",
    "4": "$",
    "5": "%",
    "6": "^",
    "7": "&",
    "8": "*",
    "9": "(",
    "0": ")",
    "-": "_",
    "=": "+",
    "[": "{",
    "]": "}",
    "\\": "|",
    ";": ":",
    "'": '"',
    ",": "<",
    ".": ">",
    "/": "?",
  };

  const processKey = (key: string) => {
    if (key === "<<") {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (key === "SPACE") {
      setInputValue((prev) => prev + " ");
    } else if (key === "ENTER") {
      flushKeyboard();
    } else if (key === "CAPS") {
      setCapsLock((prev) => !prev);
    } else if (key === "SHIFT") {
      setShift((prev) => !prev);
    } else if (key === "TAB") {
      setInputValue((prev) => prev + "    ");
    } else {
      const isLetter = key.length === 1 && /[a-zA-Z]/.test(key);
      let char = key;

      // apply shift or caps lock
      if (shift && shiftSymbols[key]) char = shiftSymbols[key];
      else if (shift || capsLock) char = key.toUpperCase();
      else char = key.toLowerCase();

      setInputValue((prev) => prev + char);
      if (shift) setShift(false); // shift only applies once
    }
  };

  return (
    <KeyboardContext.Provider
      value={{
        initKeyboard,
        flushKeyboard,
        killKeyboard,
      }}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={styles.keyboardOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.target === e.currentTarget && killKeyboard()}
          >
            {/* Text box display */}
            <motion.div
              className="bg-slate-900/20 w-full h-[40vh]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "circOut" }}
            >
              <div
                className={`bg-[#212121] text-white h-full px-7 py-5 ${poppins.className} overflow-y-scroll`}
              >
                <div className="bg-[#212121] text-white h-full w-[80%] m-auto px-7 px-5">
                  {inputValue ? (
                    inputValue
                  ) : (
                    <span className="text-gray-500">{placeholder}</span>
                  )}
                  {inputValue && <span className="animate-pulse">_</span>}
                </div>
              </div>
            </motion.div>

            {/* Keyboard UI */}
            <motion.div
              className={styles.keyboard}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "circOut" }}
            >
              <div className="flex justify-between py-5 px-5">
                <div>
                  {capsLock && (
                    <span className="text-white font-semibold text-sm ml-4 bg-red-600 px-5 py-2 rounded-lg">
                      Caps Lock ON
                    </span>
                  )}
                  {shift && (
                    <span className="text-white font-semibold text-sm ml-4 bg-yellow-600 px-5 py-2 rounded-lg">
                      Shift Lock On
                    </span>
                  )}
                </div>

                <button className={styles.closeButton} onClick={killKeyboard}>
                  ×
                </button>
              </div>

              <div className={styles.keyboardBody}>
                {baseLayout.map((row, i) => (
                  <div key={i} className={styles.keyboardRow}>
                    {row.map((key) => (
                      <button
                        key={key}
                        className={`${styles.key} ${
                          key === "<<"
                            ? `!bg-red-500`
                            : key === "ENTER"
                            ? `!bg-white !text-black`
                            : key === "SPACE"
                            ? styles.spaceKey
                            : key === "SHIFT"
                            ? `${styles.key} ${
                                shift ? "!bg-blue-600 !text-white" : ""
                              }`
                            : key === "CAPS"
                            ? `${styles.key} ${
                                capsLock ? "!bg-blue-600 !text-white" : ""
                              }`
                            : ""
                        }`}
                        onClick={() => processKey(key)}
                      >
                        {shift && shiftSymbols[key]
                          ? shiftSymbols[key]
                          : shift || capsLock
                          ? key.toUpperCase()
                          : key}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-neutral-600 font-[300] w-max mx-auto my-3 text-sm  px-5 py-2 rounded-lg">
                E-Noki Virtual Keyboard (v0.1.0 beta)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </KeyboardContext.Provider>
  );
};
