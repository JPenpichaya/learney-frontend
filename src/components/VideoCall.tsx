import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  LiveKitRoom,
  VideoConference,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { auth } from "./firebase.ts";
import { onIdTokenChanged, getIdToken } from "firebase/auth";
import { useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

type TokenResponse = { url: string; token: string };

function normalizeLiveKitWsUrl(url: string) {
  // If backend returns https://... turn it into wss://...
  if (url.startsWith("wss://") || url.startsWith("ws://")) return url;
  if (url.startsWith("https://")) return url.replace(/^https:\/\//, "wss://");
  if (url.startsWith("http://")) return url.replace(/^http:\/\//, "ws://");
  // fallback
  return `wss://${url.replace(/^\/+/, "")}`;
}

const RaiseHandButton: React.FC = () => {
  const room = useRoomContext();
  const handleRaiseHand = () => {
    if (!room?.localParticipant) return;
    room.localParticipant.setMetadata(JSON.stringify({ hand: "up" }));
  };

  return (
    <button
      onClick={handleRaiseHand}
      className="px-3 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
    >
      ✋ Raise Hand
    </button>
  );
};

interface CallPageProps {
  identity: string; // displayName or uid
  roomName?: string; // default if no ?room=
}

export const CallPage: React.FC<CallPageProps> = ({
  identity,
  roomName = "demo-room",
}) => {
  const [params] = useSearchParams();
  const urlRoom = params.get("room") || roomName;

  const [idToken, setIdToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  const shareUrl = useMemo(
    () => `${window.location.origin}/call?room=${encodeURIComponent(urlRoom)}`,
    [urlRoom]
  );

  // 1) Track Firebase auth & idToken
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setIdToken(null);
        setTokenData(null);
        setError("Please sign in first.");
        return;
      }
      const t = await getIdToken(user, false);
      setIdToken(t);
      setError(null);
    });
    return () => unsub();
  }, []);

  // 2) Reset token when room changes
  useEffect(() => {
    setTokenData(null);
    setError(null);
  }, [urlRoom]);

  const fetchToken = useCallback(async () => {
    if (!idToken) throw new Error("Missing auth token (please sign in again).");
    if (!identity) throw new Error("Missing identity.");
    if (!urlRoom) throw new Error("Missing room.");

    setLoadingToken(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ room: urlRoom, identity }),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to fetch token (${res.status}): ${text || "no body"}`);
      }

      const data: TokenResponse = await res.json();
      setTokenData({
        url: normalizeLiveKitWsUrl(data.url),
        token: data.token,
      });
    } finally {
      setLoadingToken(false);
    }
  }, [idToken, identity, urlRoom]);

  // 3) Auto-fetch LiveKit token when ready
  useEffect(() => {
    if (!idToken || !identity || !urlRoom) return;
    fetchToken().catch((e: any) => setError(e?.message || "Token fetch failed"));
  }, [idToken, identity, urlRoom, fetchToken]);

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-[#FDF5DE] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">Can’t join room</div>
          <p className="text-sm text-red-600 mt-2">{error}</p>
          <button
            onClick={() => fetchToken().catch((e: any) => setError(e?.message || "Retry failed"))}
            className="mt-4 rounded-2xl bg-[#464B9F] px-4 py-2 text-white font-bold hover:opacity-95 disabled:opacity-60"
            disabled={loadingToken}
          >
            {loadingToken ? "Retrying…" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-[#FDF5DE] flex items-center justify-center p-6">
        <div className="text-sm text-slate-700/80">
          {loadingToken ? "Connecting to Live Room…" : "Preparing…"}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative bg-black">
      <LiveKitRoom
        serverUrl={tokenData.url}
        token={tokenData.token}
        connect
        audio
        video
        options={{
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: { simulcast: true, videoCodec: "vp8" },
        }}
        connectOptions={{
          rtcConfig: {
            iceServers: [
              { urls: ["stun:turn.learneyjourney.com:3478"] },
              {
                urls: ["turns:turn.learneyjourney.com:5349"],
                username: "turnuser",
                credential: "turnpass",
              },
            ],
          },
        }}
        style={{ height: "100%" }}
      >
        <VideoConference />

        <div className="absolute bottom-6 right-6 z-50">
          <RaiseHandButton />
        </div>
      </LiveKitRoom>

      {/* Invite Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl shadow border border-slate-200">
          <span className="text-sm font-semibold text-slate-800">Invite:</span>
          <input
            readOnly
            value={shareUrl}
            className="border border-slate-200 rounded-xl px-2 py-1 w-[320px] text-sm bg-white"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl text-sm font-bold"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};
