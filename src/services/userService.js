import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebaseClient";

// ── Get all users ─────────────────────────────────────────────────────────
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return users.sort((a, b) => {
    const da = a.lastLogin?.toDate?.() ?? new Date(a.lastLogin ?? 0);
    const db_ = b.lastLogin?.toDate?.() ?? new Date(b.lastLogin ?? 0);
    return db_ - da;
  });
}

// ── Get role of a single user by email ────────────────────────────────────
export async function getUserRole(email) {
  const userSnap = await getDoc(doc(db, "users", email));
  if (!userSnap.exists()) return null;
  return userSnap.data().role || "student";
}

// ── Upsert user on login ──────────────────────────────────────────────────
export async function upsertUser(firebaseUser) {
  const email = firebaseUser.email;
  const userRef = doc(db, "users", email);
  const userSnap = await getDoc(userRef);
  const now = new Date();

  const profileData = {
    displayName: firebaseUser.displayName || "",
    photoURL: firebaseUser.photoURL || "",
    uid: firebaseUser.uid,
    lastLogin: now,
  };

  if (userSnap.exists()) {
    // Returning user — keep existing role, just update profile
    await setDoc(userRef, profileData, { merge: true });
  } else {
    // First-time login — create document with role "student"
    await setDoc(userRef, {
      email,
      role: "student",
      isBlocked: false,
      createdAt: now,
      ...profileData,
    });
  }
}

// ── Promote to admin ──────────────────────────────────────────────────────
export async function promoteToAdmin(email) {
  await setDoc(
    doc(db, "users", email),
    { role: "admin", updatedAt: new Date() },
    { merge: true }
  );
}

// ── Demote back to student ────────────────────────────────────────────────
export async function demoteFromAdmin(email) {
  await setDoc(
    doc(db, "users", email),
    { role: "student", updatedAt: new Date() },
    { merge: true }
  );
}

// ── Add admin by email ────────────────────────────────────────────────────
export async function addAdminByEmail(email) {
  const userRef = doc(db, "users", email);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    // Existing user — upgrade to admin
    await setDoc(userRef, { role: "admin", updatedAt: new Date() }, { merge: true });
  } else {
    // Pre-create the document so it's ready when they first log in
    await setDoc(userRef, {
      email,
      role: "admin",
      isBlocked: false,
      createdAt: new Date(),
      displayName: "",
      photoURL: "",
      uid: "",
    });
  }
}

// ── Block / Unblock ───────────────────────────────────────────────────────
export async function blockUser(email) {
  await setDoc(
    doc(db, "users", email),
    { isBlocked: true, blockedAt: new Date() },
    { merge: true }
  );
}

export async function unblockUser(email) {
  await setDoc(
    doc(db, "users", email),
    { isBlocked: false, blockedAt: null },
    { merge: true }
  );
}

// ── Delete user ───────────────────────────────────────────────────────────
export async function deleteUser(email) {
  await deleteDoc(doc(db, "users", email));
}