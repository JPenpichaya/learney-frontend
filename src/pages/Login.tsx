import { useEffect, useState } from "react";
import { auth, google, facebook } from "../lib/firebase";
import {
    signInWithPopup,
    onAuthStateChanged,
    getIdToken,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { useToken } from "../context/TokenContext";
import { Navigate } from "react-router-dom";

export default function Login() {
    const [user, setUser] = useState<User | null>(null);
    const { setToken } = useToken();

    // Keep user + token in state/context
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

    // For testing /me on backend
    // const callBackend = async () => {
    //     if (!auth.currentUser) {
    //         alert("Not logged in");
    //         return;
    //     }

    //     const token = await getIdToken(auth.currentUser, true);
    //     console.log("ID token prefix:", token.slice(0, 20));

    //     const res = await fetch(import.meta.env.VITE_API_BASE + "/api/me", {
    //         headers: { Authorization: `Bearer ${token}` },
    //     });

    //     const text = await res.text();
    //     alert(text);
    // };

    // Generic helper for Google/Facebook sign-in
    const loginWithProvider = async (
        provider: typeof google | typeof facebook
    ) => {
        try {
            // 1) Popup login with Firebase
            const cred = await signInWithPopup(auth, provider);
            const firebaseUser = cred.user;

            // 2) Get fresh ID token
            const token = await getIdToken(firebaseUser, true);

            // 3) Tell backend "here is my Firebase token"
            const res = await fetch(import.meta.env.VITE_API_BASE + "/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                console.error("Backend auth failed:", await res.text());
                throw new Error("Backend auth failed");
            }

            // (optional) you could read user data from backend here:
            // const data = await res.json();
            // console.log("Backend user:", data);
        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

    if (user)
        if (user) {
            return <Navigate to="/courses" replace />;
        }
    return (
        <div
            className="min-h-screen text-black min-w-screen grid place-items-center bg-[url('/img/imgLogin/BGLogin.svg')] bg-cover"
            id="Login"
        >
            <div className="z-10 absolute min-w-screen min-h-screen opacity-30 bg-[url('/img/imgLogin/LerneyJourneyBgStar.gif')]"></div>
            <div className="p-8 z-40 bg-white rounded-4xl shadow-lg w-full max-w-[20rem] lg:max-w-sm text-center justify-items-center">
                <img
                    src="/img/Logo/Learney-Journey_logo.png"
                    alt=""
                    className="max-w-80 object-cover mb-2"
                />
                <h1 className="text-2xl  mb-4.5">Login to Start</h1>
                <div className="space-y-2 mb-2">
                    <button
                        onClick={() => loginWithProvider(google)}
                        className="w-full flex px-4 py-2 rounded-full shadow-md hover:shadow-lg bg-white "
                    >
                        <div className=" flex w-full text-center content-center justify-items-center justify-center items-center">
                            <div className="flex-none w-10">
                                <img src="/img/icon/Google_Icon.svg" alt="" className="w-8" />
                            </div>
                            <p className="flex-0.5 w-full ml-2 max-w-50 text-start text-sm lg:text-base">
                                Continue with Google
                            </p>
                        </div>
                    </button>
                    <p className="text-center font-medium">or</p>
                    <button
                        onClick={() => loginWithProvider(facebook)}
                        className="w-full flex  px-4 py-2 rounded-full shadow-md hover:shadow-lg bg-white"
                    >
                        <div className="flex w-full text-center content-center justify-items-center justify-center items-center">
                            <div className="flex-none w-10">
                                <img
                                    src="/img/icon/FaceBook_Icon.svg"
                                    alt=""
                                    className="w-8 mr-4"
                                />
                            </div>
                            <p className="flex-0.5 w-full max-w-50 ml-2 text-start text-sm lg:text-base">
                                Continue with Facebook
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
