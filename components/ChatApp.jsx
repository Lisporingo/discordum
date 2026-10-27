"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import { VideoPresets } from "livekit-client";
import RoomView from "./RoomView";

// Sabit odalar. İstediğin gibi değiştir (id'ler küçük harf, boşluksuz olsun).
const ROOMS = [
  { id: "genel", name: "Genel" },
  { id: "oyun", name: "Oyun" },

];

// SES KALİTESİ AYARLARI BURADA
const roomOptions = {
  audioCaptureDefaults: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  },
  publishDefaults: {
    audioPreset: { maxBitrate: 256000 },
    dtx: false,
    screenShareEncoding: { maxBitrate: 4000000, maxFramerate: 30 },
  },
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
  },
  adaptiveStream: true,
  dynacast: true,
};

export default function ChatApp({ nickname }) {
  const [activeRoom, setActiveRoom] = useState(ROOMS[0].id);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setToken("");
    setError("");

    fetch(
      `/api/token?room=${encodeURIComponent(activeRoom)}&username=${encodeURIComponent(nickname)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.token) setToken(data.token);
        else setError(data.error || "Token alınamadı");
      })
      .catch(() => !cancelled && setError("Sunucuya ulaşılamadı"));

    return () => {
      cancelled = true;
    };
  }, [activeRoom, nickname]);

  const room = ROOMS.find((r) => r.id === activeRoom);

  return (
    <div className="flex h-screen bg-[#313338] text-gray-100">
      {/* SOL: Odalar */}
      <aside className="w-60 bg-[#2b2d31] flex flex-col shrink-0">
        <div className="h-12 px-4 flex items-center font-bold border-b border-black/30">
          Sunucum
        </div>
        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
          <p className="px-2 pt-2 text-xs uppercase text-gray-400">Odalar</p>
          {ROOMS.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoom(r.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                activeRoom === r.id
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              🔊 {r.name}
            </button>
          ))}
        </div>
        <div className="p-3 bg-[#232428] text-sm truncate">👤 {nickname}</div>
      </aside>

      {/* ORTA + SAĞ */}
      <main className="flex-1 min-w-0">
        {error && (
          <div className="p-6 text-red-400">Hata: {error}</div>
        )}
        {!error && !token && (
          <div className="p-6 text-gray-400">Bağlanıyor...</div>
        )}
        {token && (
          <LiveKitRoom
            key={activeRoom}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            token={token}
            connect={true}
            audio={true}
            video={false}
            options={roomOptions}
            className="h-full"
          >
            <RoomView roomName={room.name} />
            <RoomAudioRenderer />
            <StartAudio
              label="Sesi duymak için tıkla"
              className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded bg-indigo-500 font-semibold z-50"
            />
          </LiveKitRoom>
        )}
      </main>
    </div>
  );
}