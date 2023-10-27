// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-website-81739.firebaseapp.com",
  projectId: "real-estate-website-81739",
  storageBucket: "real-estate-website-81739.appspot.com",
  messagingSenderId: "950577038262",
  appId: "1:950577038262:web:92e3dadec3ae22823ef717"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);