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

const COURSES_COLLECTION = "courses";
const coursesCollection = collection(db, COURSES_COLLECTION);

/**
 * Get all active courses
 */
export async function getCourses() {
  try {
    const q = query(coursesCollection, where("isActive", "==", true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (err) {
    console.error("Error fetching courses:", err);
    throw new Error(`Failed to fetch courses: ${err.message}`);
  }
}

/**
 * Add a new course
 */
export async function addCourse(courseData) {
  try {
    const docRef = await addDoc(coursesCollection, {
      ...courseData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef;
  } catch (err) {
    console.error("Error adding course:", err);
    throw new Error(`Failed to add course: ${err.message}`);
  }
}

/**
 * Update course information
 */
export async function updateCourse(id, updatedFields) {
  try {
    const courseDoc = doc(db, COURSES_COLLECTION, id);

    await updateDoc(courseDoc, {
      ...updatedFields,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error updating course:", err);
    throw new Error(`Failed to update course: ${err.message}`);
  }
}

/**
 * Disable a course (Soft Delete)
 * Sets isActive = false instead of removing the document
 * @param {string} courseId
 */
export async function disableCourse(courseId) {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);

    await updateDoc(courseRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });

  } catch (err) {
    console.error("Error disabling course:", err);
    throw new Error(`Failed to disable course: ${err.message}`);
  }
}