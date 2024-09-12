import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../../context/UserAuthContext";
import "react-phone-number-input/style.css";
import axios from "axios";

function Mobile() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("translations");
  const { signInWithPhone } = useUserAuth();

  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      const isChromeBrowser =
        userAgent.includes("Chrome") && !userAgent.includes("Edg");
      setIsChrome(isChromeBrowser);
    };

    detectBrowser();
  }, []);

  const validatePhoneNumber = () => isValidPhoneNumber(phoneNumber);

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value || "");
  };

  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://twitter-cxhu.onrender.com/send-email-otp", {
        email,
      });
      setSuccess(true);
      setError("");
      console.log("Email OTP sent successfully");
    } catch (error) {
      console.error("Error during Email OTP sending:", error);
      setError("Failed to send OTP to email. Please try again.");
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    try {
      const isVerified = await axios.post(
        "https://twitter-cxhu.onrender.com/verify-email-otp",
        {
          email,
          otpEmail,
        }
      );
      if (isVerified) {
        setEmailVerified(true);
        setError("");
        console.log("Email OTP verified successfully");
      } else {
        setError("Incorrect email OTP, please try again.");
      }
    } catch (error) {
      console.error("Error verifying Email OTP:", error);
      setError("Failed to verify email OTP. Please try again.");
    }
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    if (validatePhoneNumber()) {
      try {
        const result = await signInWithPhone(
          phoneNumber,
          "recaptcha-container"
        );
        setConfirmationResult(result);
        setSuccess(true);
        setError("");
        console.log("SMS OTP sent successfully");
      } catch (error) {
        console.error("Error during SMS OTP sending:", error);
        setError("Failed to send OTP to phone. Please try again.");
      }
    } else {
      setError("Invalid Phone Number");
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (otp.length === 6 && confirmationResult) {
      try {
        await confirmationResult.confirm(otp);
        navigate("/");
      } catch (error) {
        console.error("Error verifying SMS OTP:", error);
        setError("Incorrect SMS OTP, please try again.");
      }
    } else {
      setError("Please enter a 6-digit OTP code");
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

          {isChrome && !emailVerified && (
            <>
              <p>
                Since you're using google chrome browser you must authenticate
                with email to proceed to login
              </p>
              <form onSubmit={handleSendEmailOtp}>
                <input
                  type="email"
                  className="email"
                  placeholder={t("Enter your email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="btn" type="submit">
                  {t("Send Email OTP")}
                </button>
              </form>
            </>
          )}

          {isChrome && !emailVerified && otpEmail && (
            <form onSubmit={handleVerifyEmailOtp}>
              <input
                type="text"
                className="otp-field"
                placeholder={t("Enter OTP sent to email")}
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                required
              />
              <button className="btn" type="submit">
                {t("Verify Email OTP")}
              </button>
            </form>
          )}

          {(!isChrome || emailVerified) && (
            <form className="form-container" onSubmit={handleSendPhoneOtp}>
              <PhoneInput
                className="email"
                international
                defaultCountry="IN"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder={t("Enter your phone number")}
                error={
                  phoneNumber && !validatePhoneNumber()
                    ? t("Invalid Phone Number")
                    : undefined
                }
                required
              />
              <button className="btn" type="submit">
                {t("Send SMS OTP")}
              </button>
            </form>
          )}

          {confirmationResult && (
            <form onSubmit={handleVerifyPhoneOtp}>
              <input
                type="text"
                className="email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("Enter SMS OTP")}
                required
              />
              <button className="btn" type="submit">
                {t("Verify SMS OTP")}
              </button>
            </form>
          )}
        </div>

        <Link
          to="/login"
          style={{
            textDecoration: "none",
            color: "var(--twitter-color)",
            fontWeight: "600",
            marginLeft: "200px",
          }}>
          {t("Back to login page")}
        </Link>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default Mobile;
