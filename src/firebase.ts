// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
} = {
  apiKey: "AIzaSyDscJX9OCMR9wMpfXKzDuI1qWATxGESf6Y",
  authDomain: "idealroutine.firebaseapp.com",
  projectId: "idealroutine",
  storageBucket: "idealroutine.firebasestorage.app",
  messagingSenderId: "506392110752",
  appId: "1:506392110752:web:b0bf54198294d2e6c68bc5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app); 