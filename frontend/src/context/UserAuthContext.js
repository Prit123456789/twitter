import { createContext, useContext, useEffect, useState } from "react";
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
} from "firebase/auth";
import auth from "./firebase";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({});

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function logOut() {
    return signOut(auth);
  }

  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider).then((result) => {
      return result.user; // Return the user object from the result
    });
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function signInWithPhone(phoneNumber, recaptchaContainerId) {
    // Set up RecaptchaVerifier
    const appVerifier = new RecaptchaVerifier(
      recaptchaContainerId,
      {
        size: "invisible", // Can be "normal" for a visible recaptcha
      },
      auth
    );

    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Auth user:", currentUser);
        setUser({
          email: currentUser.email || null,
          phoneNumber: currentUser.phoneNumber || null,
          uid: currentUser.uid,
        });
      } else {
        setUser({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
