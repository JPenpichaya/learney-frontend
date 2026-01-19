// src/pages/LiveRoomPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    LiveKitRoom,
    VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { auth } from "../lib/firebase";
import { getIdToken } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

type TokenResponse = { url: string; token: string };

export default function LiveRoomPage() {
    const [params] = useSearchParams();
    const nav = useNavigate();
    const courseId = params.get("courseId");
    const [data, setData] = useState<TokenResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) return;

        (async () => {
            try {
                const idToken = await getIdToken(auth.currentUser!, false);
                const res = await fetch(`${API_BASE}/live/token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ courseId }),
                });

                if (!res.ok) throw new Error(await res.text());
                const d = await res.json();

                setData({
                    url: d.url.replace(/^https?:\/\//, "wss://"),
                    token: d.token,
                });
            } catch (e: any) {
                setError(e.message);
            }
        })();
    }, [courseId]);

    if (error)
        return (
            <div className="p-8" >
                <p className="text-red-600" > {error} </p>
                <button onClick={() => nav("/courses")}> Back </button>
            </div>
        );

    if (!data) return <p className="p-8" > Connecting…</p>;

    return (
        <div className="h-screen bg-black" >
            <LiveKitRoom
                serverUrl={data.url}
                token={data.token}
                connect
                audio
                video
            >
                <VideoConference />
            </LiveKitRoom>
        </div>
    );
}
