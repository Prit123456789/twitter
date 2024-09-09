import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCkiALQ9qNVskszacOKdopCHqWoy0X79Sg",
  authDomain: "app-like-twitter-58321.firebaseapp.com",
  projectId: "app-like-twitter-58321",
  storageBucket: "app-like-twitter-58321.appspot.com",
  messagingSenderId: "1064039332597",
  appId: "1:1064039332597:web:9eac2763fe342936ade3bc",
  measurementId: "G-K925FWXN5M",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default auth;
