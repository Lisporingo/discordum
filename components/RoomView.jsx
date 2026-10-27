"use client";

import { useEffect, useRef, useState } from "react";
import {
  useChat,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track, VideoPresets } from "livekit-client";

/* ---------- Sağ taraf: kişi + konuşunca yeşil halka ---------- */
function ParticipantItem({ participant }) {
  const speaking = useIsSpeaking(participant);
  const name = participant.name || participant.identity;

  return (
    <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/5">
      <div
        className={`w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold transition-all ${
          speaking ? "ring-4 ring-green-500" : "ring-0"
        }`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <span className="truncate text-sm">
        {name}
        {participant.isLocal ? " (sen)" : ""}
      </span>
    </div>
  );
}

/* ---------- Üst: kamera ve ekran paylaşımı alanı ---------- */
function Stage() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  if (tracks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 bg-black/20 max-h-[55%] overflow-auto">
      {tracks.map((t) => {
        const isScreen = t.source === Track.Source.ScreenShare;
        return (
          <div
            key={`${t.participant.identity}_${t.source}`}
            className={`relative bg-black rounded overflow-hidden aspect-video ${
              isScreen ? "lg:col-span-2" : ""
            }`}
          >
            <VideoTrack
              trackRef={t}
              className="w-full h-full object-contain"
            />
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
              {t.participant.name || t.participant.identity}
              {isScreen ? " (ekran)" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Orta: yazılı sohbet ---------- */
function ChatPanel() {
  const { chatMessages, send, isSending } = useChat();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function submit(e) {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    setText("");
    await send(msg);
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {chatMessages.length === 0 && (
          <p className="text-gray-500 text-sm">
            Henüz mesaj yok. (Mesajlar kalıcı değildir, sayfa yenilenince silinir.)
          </p>
        )}
        {chatMessages.map((m, i) => (
          <div key={m.id || i}>
            <span className="font-semibold text-indigo-300">
              {m.from?.name || m.from?.identity || "?"}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {new Date(m.timestamp).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <div className="text-sm break-words">{m.message}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="px-4 pb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSending}
          placeholder="Mesaj yaz..."
          className="w-full px-3 py-2 rounded bg-[#383a40] outline-none"
        />
      </form>
    </div>
  );
}

/* ---------- Alt: Mic / Cam / Ekran butonları ---------- */
function Controls() {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } =
    useLocalParticipant();

  async function run(fn, silent = false) {
    try {
      await fn();
    } catch (e) {
      console.error(e);
      if (!silent) alert("Hata: " + (e.message || e));
    }
  }

  const btn = (active) =>
    `px-4 py-2 rounded font-semibold text-sm ${
      active ? "bg-green-600 hover:bg-green-700" : "bg-[#4e5058] hover:bg-[#6d6f78]"
    }`;

  return (
    <div className="h-16 bg-[#232428] flex items-center justify-center gap-3 shrink-0">
      <button
        className={btn(isMicrophoneEnabled)}
        onClick={() =>
          run(() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled))
        }
      >
        {isMicrophoneEnabled ? "🎤 Mikrofon Açık" : "🔇 Mikrofon Kapalı"}
      </button>

      <button
        className={btn(isCameraEnabled)}
        onClick={() =>
          run(() => localParticipant.setCameraEnabled(!isCameraEnabled))
        }
      >
        {isCameraEnabled ? "📷 Kamera Açık" : "📷 Kamera Kapalı"}
      </button>

      <button
        className={btn(isScreenShareEnabled)}
        onClick={() =>
          run(
            () =>
              localParticipant.setScreenShareEnabled(!isScreenShareEnabled, {
                audio: true,
                resolution: VideoPresets.h1080.resolution,
              }),
            true
          )
        }
      >
        {isScreenShareEnabled ? "🖥️ Paylaşımı Durdur" : "🖥️ Ekran Paylaş"}
      </button>
    </div>
  );
}

/* ---------- Hepsini birleştiren ana bileşen ---------- */
export default function RoomView({ roomName }) {
  const participants = useParticipants();
  const state = useConnectionState();

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-black/30 font-semibold shrink-0">
          # {roomName}
        </div>
        <Stage />
        <ChatPanel />
        <Controls />
      </div>

      <aside className="w-60 bg-[#2b2d31] p-3 overflow-y-auto shrink-0">
        <h3 className="text-xs uppercase text-gray-400 mb-2">
          Sesteki kişiler, {participants.length}
        </h3>
        {participants.map((p) => (
          <ParticipantItem key={p.identity} participant={p} />
        ))}
      </aside>
    </div>
  );
}