import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  onAuthStateChanged,
  RecaptchaVerifier,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import auth from "./firebase";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Failed to set persistence:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("onAuthStateChanged triggered. Current user:", currentUser);
      if (currentUser) {
        const userData = {
          identifier: currentUser.email || currentUser.phoneNumber,
          type: currentUser.email ? "email" : "phoneNumber",
          uid: currentUser.uid,
        };
        setUser(userData);
        console.log("User data set:", userData);
      } else {
        setUser(null);
        console.log("No user logged in");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const logIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => {
    return signOut(auth);
  };

  const googleSignIn = () => {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const signInWithPhone = (phoneNumber, recaptchaContainerId) => {
    const appVerifier = new RecaptchaVerifier(
      recaptchaContainerId,
      {
        size: "invisible",
      },
      auth
    );

    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  return (
    <userAuthContext.Provider
      value={{
        user,
        logIn,
        signUp,
        logOut,
        googleSignIn,
        resetPassword,
        signInWithPhone,
      }}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
