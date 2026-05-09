// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function LoginPage() {
  const { signInWithGoogle, authError, authLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to home once user is confirmed
  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Syllabus & Curriculum Map</h1>
          <p className="text-sm text-gray-500 text-center">
            Sign in with your NEU Google account to continue
          </p>
        </div>

        {/* Error message */}
        {authError && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 text-center">
            {authError}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={signInWithGoogle}
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Google SVG icon */}
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3L37.3 9.6C34 6.5 29.2 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.7-.2-3.3-.5-4.9z" />
            <path fill="#FF3D00" d="M6.3 15.5l6.6 4.8C14.7 17 19.1 14 24 14c3.1 0 5.8 1.1 7.9 3L37.3 9.6C34 6.5 29.2 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 11z" />
            <path fill="#4CAF50" d="M24 45.5c5.1 0 9.8-1.9 13.3-5.1l-6.2-5.2C29.2 37 26.7 38 24 38c-5.2 0-9.6-3.3-11.3-8H6.1C9.3 40.7 16.1 45.5 24 45.5z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41.2 35.2 44.5 30.5 44.5 25c0-1.7-.2-3.3-.5-4.9z" />
          </svg>
          Sign in with Google
        </button>

        <p className="text-xs text-gray-400 text-center">
          Only <span className="font-semibold">@neu.edu.ph</span> accounts are permitted
        </p>
      </div>
    </div>
  );
}