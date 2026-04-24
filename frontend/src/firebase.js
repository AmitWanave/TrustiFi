import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArSPVqLH0x5p9Y1HJwf3gz71zCzeCatDI",
  authDomain: "trustifi-login.firebaseapp.com",
  projectId: "trustifi-login",
  storageBucket: "trustifi-login.firebasestorage.app",
  messagingSenderId: "449061215203",
  appId: "1:449061215203:web:fd2a224f86c9f6edc81ed6",
  measurementId: "G-QD1EYPDYKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
