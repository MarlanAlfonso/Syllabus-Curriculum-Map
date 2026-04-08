// src/services/courseService.js

import { db } from "../lib/firebaseClient.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const coursesCollection = collection(db, "courses");

export async function getCourses() {
  const q = query(coursesCollection, where("isActive", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function addCourse(courseData) {
  const docRef = await addDoc(coursesCollection, {
    ...courseData,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef;
}

export async function updateCourse(id, updatedFields) {
  const courseDoc = doc(db, "courses", id);
  await updateDoc(courseDoc, {
    ...updatedFields,
    updatedAt: serverTimestamp(),
  });
}

export async function disableCourse(id) {
  const courseDoc = doc(db, "courses", id);
  await updateDoc(courseDoc, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}