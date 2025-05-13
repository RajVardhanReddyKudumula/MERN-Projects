import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDuEgh1IbWGX79YCzPJxKUQRmfbdEVcqjM",
  authDomain: "trade-skills-not-money.firebaseapp.com",
  projectId: "trade-skills-not-money",
  storageBucket: "trade-skills-not-money.firebasestorage.app",
  messagingSenderId: "983603767263",
  appId: "1:983603767263:web:485e05dff4eb0e7612c66a",
  measurementId: "G-QG7L30BBWS",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  provider,
  db,
  storage,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL,
  signInWithPopup,
  signOut,
};
