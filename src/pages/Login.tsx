import { useEffect, useState } from "react";
import { auth, google, facebook } from "../lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, getIdToken } from "firebase/auth";
import type { User } from "firebase/auth";
import { CallPage } from "../components/VideoCall";
import { useToken } from "../context/TokenContext";

export default function Login() {
    const [user, setUser] = useState<User | null>(null);
    const { setToken } = useToken();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                const t = await getIdToken(u, false);
                setToken(t);
            } else {
                setToken(null);
            }
        });
        return () => unsub();
    }, [setToken]);

    const callBackend = async () => {
        const token = await getIdToken(auth.currentUser!, true);
        console.log("ID token prefix:", token?.slice(0, 20));
        const res = await fetch(import.meta.env.VITE_API_BASE + "/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        alert(await res.text());
    };

    if (user)
        return (
            <div className="min-h-screen grid place-items-center bg-neutral-50">
                <div className="w-full max-w-5xl">
                    <div className="mb-4 text-center">
                        <div>
                            Signed in as <b>{user.displayName || user.email}</b>
                        </div>
                        <div className="mt-2 space-x-2">
                            <button onClick={callBackend} className="border px-3 py-2 rounded">
                                Call backend
                            </button>
                            <button onClick={() => signOut(auth)} className="border px-3 py-2 rounded">
                                Sign out
                            </button>
                        </div>
                    </div>
                    <CallPage identity={user.uid} roomName="demo-room" />
                </div>
            </div>
        );

    return (
        <div className="min-h-screen grid place-items-center bg-neutral-50">
            <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-sm text-center">
                <h1 className="text-2xl font-semibold mb-6">Sign in to Learney Journey</h1>
                <div className="space-y-3">
                    <button
                        onClick={() => signInWithPopup(auth, google)}
                        className="w-full border px-4 py-2 rounded hover:bg-gray-50"
                    >
                        Continue with Google
                    </button>
                    <button
                        onClick={() => signInWithPopup(auth, facebook)}
                        className="w-full border px-4 py-2 rounded hover:bg-gray-50"
                    >
                        Continue with Facebook
                    </button>
                </div>
            </div>
        </div>
    );
}
