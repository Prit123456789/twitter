import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  
  apiKey: "AIzaSyD5GU77dnk6QbOOaUcMzqCqhoIVhvkynug",
  authDomain: "website-like-twitter-76754.firebaseapp.com",
  projectId: "website-like-twitter-76754",
  storageBucket: "website-like-twitter-76754.appspot.com",
  messagingSenderId: "200427848918",
  appId: "1:200427848918:web:8da9b87413fdd599143577",
  measurementId: "G-YCVZJ5KBJH"
}

const app = initializeApp(firebaseConfig);
const auth= getAuth(app);
export default auth;