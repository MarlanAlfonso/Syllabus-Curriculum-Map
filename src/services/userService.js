import {
  collection, getDocs, doc, setDoc,
  deleteDoc, getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebaseClient";

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  return users.sort((a, b) => {
    const da  = a.lastLogin?.toDate?.() ?? new Date(a.lastLogin ?? 0);
    const db_ = b.lastLogin?.toDate?.() ?? new Date(b.lastLogin ?? 0);
    return db_ - da;
  });
}

export async function upsertUser(user) {
  const userRef = doc(db, "users", user.email);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    // ── Existing user: only refresh profile info and lastLogin
    // Never overwrite role — it's managed by promote/demote
    await setDoc(
      userRef,
      {
        displayName: user.displayName || "",
        photoURL:    user.photoURL    || "",
        uid:         user.uid,
        lastLogin:   new Date(),
      },
      { merge: true }
    );
  } else {
    // ── New user: create doc with default role "user"
    await setDoc(userRef, {
      email:       user.email,
      displayName: user.displayName || "",
      photoURL:    user.photoURL    || "",
      uid:         user.uid,
      role:        "user",          // ← always "user" for new registrations
      lastLogin:   new Date(),
      createdAt:   new Date(),
    });
  }
}

export async function promoteToAdmin(email) {
  await setDoc(doc(db, "admins", email), { promotedAt: new Date() });
  await setDoc(
    doc(db, "users", email),
    { role: "admin", updatedAt: new Date() },
    { merge: true }
  );
}

export async function demoteFromAdmin(email) {
  await deleteDoc(doc(db, "admins", email));
  await setDoc(
    doc(db, "users", email),
    { role: "user", updatedAt: new Date() },
    { merge: true }
  );
}