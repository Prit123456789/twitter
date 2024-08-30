import React, { useState, useEffect } from "react";
import "./Mobile.css";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useTranslation } from "react-i18next";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import auth from "../../context/firebase"; // Ensure this path is correct

function Mobile() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("translations");
  const { signInWithPhone } = useUserAuth();

  useEffect(() => {
    // Initialize RecaptchaVerifier only once when the component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            // reCAPTCHA solved
            console.log("reCAPTCHA solved");
          },
          "expired-callback": () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            console.log("reCAPTCHA expired. Please try again.");
          },
        },
        auth
      );
    }
  }, []);

  const validatePhoneNumber = () => {
    const regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(phoneNumber);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (validatePhoneNumber()) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          appVerifier
        );
        setConfirmResult(confirmationResult);
        setSuccess(true);
      } catch (error) {
        setError(error.message);
      }
    } else {
      setError("Invalid Phone Number");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length === 6 && confirmResult) {
      try {
        const userCredential = await confirmResult.confirm(otp);
        alert(`Verified: ${userCredential.user.uid}`);
        navigate("/");
      } catch (error) {
        setError(error.message);
      }
    } else {
      setError("Please enter a six-digit OTP code");
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img className="image" src={twitterimg} alt="twitterImage" />
      </div>

      <div className="form-container">
        <div className="form-box">
          <TwitterIcon style={{ color: "skyblue" }} />
          <h2 className="heading">{t("Happening now")}</h2>

          {error && <p className="error-message">{error}</p>}
          {success && (
            <p className="success-message">{t("OTP Sent Successfully")}</p>
          )}

          <form className="form-container" onSubmit={handleSendOtp}>
            <input
              className="email"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t("Enter phone number")}
            />
            <button className="btn" type="submit">
              {t("Send OTP")}
            </button>
          </form>

          {confirmResult && (
            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                className="email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("Enter OTP")}
              />
              <button className="btn" type="submit">
                {t("Verify OTP")}
              </button>
            </form>
          )}
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default Mobile;
