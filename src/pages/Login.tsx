import { useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

// Mock User Type
type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
};

export default function Login() {
  const [user, setUser] = useState<User | null>(null);

  // Mock Login Function
  const loginWithProvider = async (providerName: string) => {
    console.log(`Logging in with ${providerName}...`);
    
    // Simulate API call delay
    setTimeout(() => {
      setUser({
        uid: "mock-user-123",
        displayName: "Demo User",
        email: "demo@example.com",
      });
    }, 1000);
  };

  if (user) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen text-black w-full grid place-items-center bg-[url('/img/imgLogin/BGLogin.svg')] bg-cover relative"
        id="Login"
      >
        <div className="z-10 absolute inset-0 opacity-30 bg-[url('/img/imgLogin/LerneyJourneyBgStar.gif')] pointer-events-none"></div>
        <div className="p-8 z-40 rounded-3xl bg-white shadow-lg w-full max-w-[20rem] lg:max-w-sm text-center justify-items-center mt-16 relative">
          <img
            src="/img/Logo/Learney-Journey_logo.png"
            alt=""
            className="max-w-80 object-cover mb-2"
          />
          <h1 className="text-2xl mb-5">Login to Start</h1>
          <div className="space-y-2 mb-2">
            <button
              onClick={() => loginWithProvider("Google")}
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
              onClick={() => loginWithProvider("Facebook")}
              className="w-full flex  px-4 py-2 rounded-full shadow-md hover:shadow-lg bg-white"
            >
              <div className="flex w-full text-center content-center justify-items-center justify-center items-center">
                <div className="flex-none w-10">
                  <img
                    src="/img/icon/Facebook_icon.png"
                    alt=""
                    className="w-9 mr-4"
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
    </>
  );
}
