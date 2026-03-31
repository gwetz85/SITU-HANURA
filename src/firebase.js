import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration with resilience for Vercel
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Fail-safe initialization
let app;
let db;

try {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.error("Firebase Configuration is missing or using placeholders. Please set VITE_FIREBASE_* environment variables.");
  } else {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export { db };
