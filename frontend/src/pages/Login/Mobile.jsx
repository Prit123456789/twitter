import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../../context/UserAuthContext";
import "react-phone-number-input/style.css";

function Mobile() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation("translations");
  const { signInWithPhone } = useUserAuth();

  const validatePhoneNumber = () => isValidPhoneNumber(phoneNumber);

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value || "");
  };

  const handleSendOtp = async (e) => {
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
        console.log("OTP sent successfully");
      } catch (error) {
        console.error("Error during OTP sending:", error);
        setError(error.message);
      }
    } else {
      setError("Invalid Phone Number");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length === 6 && confirmationResult) {
      try {
        await confirmationResult.confirm(otp);
        navigate("/");
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setError("Incorrect OTP, please try again.");
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

          <form className="form-container" onSubmit={handleSendOtp}>
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
            />
            <button className="btn" type="submit">
              {t("Send")}
            </button>
          </form>

          {confirmationResult && (
            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                className="email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("Enter OTP")}
              />
              <button className="btn" type="submit">
                {t("Verify")}
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
