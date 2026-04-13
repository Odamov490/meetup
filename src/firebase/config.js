import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyCkjaxRC2q3V1y58OvraEce9aDC_ptcLuE",
  authDomain: "meetup-d67f6.firebaseapp.com",
  projectId: "meetup-d67f6",
  storageBucket: "meetup-d67f6.firebasestorage.app",
  messagingSenderId: "942720343437",
  appId: "1:942720343437:web:12d42e1360b65eaa23b1c4",
  measurementId: "G-FNK8X9T5JC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);