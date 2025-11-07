"use client";

import { useKeyboard } from "@/contexts/KeyboardContext";

export default function ExamplePage() {
  const { initKeyboard } = useKeyboard();

  const handleClick = async () => {
    const value = await initKeyboard({
      placeholder: "Enter your message",
      initialValue: "",
    });
    console.log("User typed:", value);
  };

  return (
    <div className="p-10">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Open Keyboard
      </button>
    </div>
  );
}
