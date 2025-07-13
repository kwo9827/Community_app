import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCG6x7KDAHHkanpBV4SyyHNYeCj-EM7IJw",
  authDomain: "communitymvp-68d46.firebaseapp.com",
  projectId: "communitymvp-68d46",
  storageBucket: "communitymvp-68d46.firebasestorage.app",
  messagingSenderId: "796462450162",
  appId: "1:796462450162:web:cb932d9bd08b3b52be576b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);  
