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
            <div className="min-h-screen grid place-items-center ">
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
        <div className="min-h-screen min-w-screen grid place-items-center bg-[url('/img/BGLogin.svg')] bg-cover">
            <div className=" absolute min-w-screen min-h-screen opacity-30 bg-[url('/img/LerneyJourneyBgStar.gif')]"></div>
            <div className="p-8 bg-white rounded-4xl shadow-lg w-full max-w-sm text-center justify-items-center">
                <img src="/img/Learney-Journey_logo.png" alt="" className="max-w-80 object-cover mb-2" />
                <h1 className="text-2xl  mb-4.5">Login to Start</h1>
                <div className="space-y-2 mb-2">
                    <button
                        onClick={() => signInWithPopup(auth, google)}
                        className="w-full flex rounded-full shadow-md hover:shadow-lg bg-white ">
                        <div className=" flex w-full text-center content-center justify-items-center justify-center items-center">
                            <div className="flex-none w-10   "><img src="/img/Google_Icon.svg" alt="" className="w-8" /></div>
                            <p className="flex-0.5 w-full ml-2 max-w-50 text-start">Continue with Google</p>
                        </div>
                    </button>
                    <p className="text-center font-medium">or</p>
                    <button
                        onClick={() => signInWithPopup(auth, facebook)}
                       className="w-full flex border px-4 py-2 rounded-full shadow-md hover:shadow-lg bg-white">
                        <div className="flex w-full text-center content-center justify-items-center justify-center items-center">
                         <div className="flex-none w-10"><img src="/img/FaceBook_Icon.svg" alt="" className="w-8 mr-4" /></div>
                        <p className="flex-0.5 w-full max-w-50 ml-2 text-start">Continue with Facebook</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
