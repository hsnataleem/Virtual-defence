// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // ✅ Add this

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPLa6AhLGYG8d9J_L-D5HsKhVEzz3Jwo0",
  authDomain: "login-553cb.firebaseapp.com",
  projectId: "login-553cb",
  storageBucket: "login-553cb.appspot.com", // ✅ Fix (remove .firebasestorage.app)
  messagingSenderId: "138041442684",
  appId: "1:138041442684:web:9c6e18198336b91b0524f9",
  measurementId: "G-9136763R6T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth + Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firestore
const db = getFirestore(app);

// Storage
const storage = getStorage(app);  // ✅ Add this

export { auth, googleProvider, db, storage };  // ✅ Export it
