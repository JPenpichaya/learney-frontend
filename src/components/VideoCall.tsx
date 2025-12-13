import React, { use, useEffect, useMemo, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { auth } from "../lib/firebase";
import { onIdTokenChanged, getIdToken } from "firebase/auth";
import { useSearchParams } from "react-router-dom";

type TokenResponse = { url: string; token: string };

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
  identity: string; // e.g. displayName or uid you pass in
  roomName?: string; // optional default if no ?room=
}

export const CallPage: React.FC<CallPageProps> = ({
  identity,
  roomName = "demo-room",
}) => {
  const [params] = useSearchParams();
  const urlRoom = params.get("room") || roomName; // ① read from URL
  const [idToken, setIdToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = useMemo(
    () => `${window.location.origin}/call?room=${encodeURIComponent(urlRoom)}`,
    [urlRoom]
  );

  // ② wait for Firebase auth (handles refresh, login, logout)
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setIdToken(null);
        setError("Please sign in first.");
        return;
      }
      const t = await getIdToken(user, false);
      setIdToken(t);
      setError(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setTokenData(null); // reset token when room changes
  }, []);

  // fetch LiveKit token when auth & room ready
  useEffect(() => {
    if (!idToken || !identity || !urlRoom) return;
    (async () => {
      try {
        const res = await fetch(
          "https://learney-journey-24285490035.asia-southeast1.run.app/token",
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
          const text = await res.text();
          throw new Error(
            `Failed to fetch token (${res.status}): ${text || "no body"}`
          );
        }
        const data: TokenResponse = await res.json();
        // ③ prefer wss: (your backend can also return wss://)
        const serverUrl = data.url.replace(/^http(s)?:\/\//, "wss://");
        setTokenData({ url: serverUrl, token: data.token });
      } catch (e: any) {
        setError(e.message || "Token fetch failed");
      }
    })();
  }, [idToken, identity, urlRoom]);

  //TODO TEST
  useEffect(() => {
    async () => {
      try {
        const res = await fetch(
          "https://learney-journey-24285490035.asia-southeast1.run.app/token",
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
          const text = await res.text();
          throw new Error(
            `Failed to fetch token (${res.status}): ${text || "no body"}`
          );
        }
        const data: TokenResponse = await res.json();
        // ③ prefer wss: (your backend can also return wss://)
        const serverUrl = data.url.replace(/^http(s)?:\/\//, "wss://");
        setTokenData({ url: serverUrl, token: data.token });
      } catch (e: any) {
        setError(e.message || "Token fetch failed");
      }
    }
  }, []);

  if (error && !tokenData)
    return <p className="text-red-600 p-4">Error: {error}</p>;
  if (!tokenData) return <p className="p-4 text-gray-500">Connecting…</p>;

  return (
    <div className="h-screen relative">
      <LiveKitRoom
        serverUrl={tokenData.url} // e.g. wss://livekit.learneyjourney.com
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

        <div className="absolute bottom-6 right-6">
          <RaiseHandButton />
        </div>
      </LiveKitRoom>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-90 pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded shadow">
          <span className="text-sm">Invite link:</span>
          <input
            readOnly
            value={shareUrl}
            className="border rounded px-2 py-1 w-[320px] text-sm"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};
