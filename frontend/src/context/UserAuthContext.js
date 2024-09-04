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
import auth from "./firebase"; // Ensure this imports your configured Firebase auth instance

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log("Auth persistence set to local storage.");
      } catch (error) {
        console.error("Failed to set persistence:", error);
      }
    };

    initializeAuthPersistence();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email || null,
          phoneNumber: currentUser.phoneNumber || null,
          uid: currentUser.uid,
        });
      } else {
        setUser(null);
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
