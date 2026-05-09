// src/context/AuthContext.jsx
import { useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebaseClient";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isNEUEmail = (email) => email?.endsWith("@neu.edu.ph");

  const fetchRole = async (email) => {
    try {
      const adminDoc = await getDoc(doc(db, "admins", email));
      return adminDoc.exists() ? "admin" : "user";
    } catch {
      return "user";
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;

      if (!isNEUEmail(email)) {
        await signOut(auth);
        setAuthError("Only @neu.edu.ph accounts are allowed.");
        return;
      }

      const userRole = await fetchRole(email);
      setRole(userRole);
      setUser(result.user);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setAuthError("Sign-in failed. Please try again.");
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email;

        if (!isNEUEmail(email)) {
          await signOut(auth);
          setUser(null);
          setRole(null);
        } else {
          const userRole = await fetchRole(email);
          setUser(firebaseUser);
          setRole(userRole);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, authLoading, authError, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;