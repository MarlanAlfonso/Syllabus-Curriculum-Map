import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const courses = [
  // paste the 10 course objects here
];

async function seed() {
  for (const course of courses) {
    const docRef = await addDoc(collection(db, "courses"), {
      ...course,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Seeded: ${course.courseCode} → ${docRef.id}`);
  }
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });