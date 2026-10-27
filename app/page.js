"use client";

import { useState, useEffect } from "react";
import ChatApp from "../components/ChatApp";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("nickname");
    if (saved) setInput(saved);
  }, []);

  function join(e) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    localStorage.setItem("nickname", name);
    setNickname(name);
  }

  if (nickname) {
    return <ChatApp nickname={nickname} />;
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={join}
        className="bg-[#2b2d31] p-8 rounded-lg w-96 space-y-4 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-center">Hoş geldin</h1>
        <p className="text-sm text-gray-400 text-center">
          Bir rumuz seç ve odaya katıl.
        </p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={24}
          placeholder="Rumuzun"
          className="w-full px-3 py-2 rounded bg-[#1e1f22] outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="w-full py-2 rounded bg-indigo-500 hover:bg-indigo-600 font-semibold"
        >
          Katıl
        </button>
      </form>
    </div>
  );
}