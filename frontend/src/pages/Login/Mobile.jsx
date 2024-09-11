import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "react-phone-number-input/style.css"; // Import the styles for PhoneInput

function Mobile() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("translations");

  const validatePhoneNumber = () => {
    return isValidPhoneNumber(phoneNumber);
  };

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value || "");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (validatePhoneNumber()) {
      try {
        const confirmationResult = await axios.post(
          "https://twitter-cxhu.onrender.com/send-sms-otp",
          { phoneNumber }
        );

        setConfirmResult(confirmationResult);
        setSuccess(true);
        setError("");

        const response = await axios.post(
          "https://twitter-cxhu.onrender.com/phoneHistory",
          { phoneNumber },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Backend response:", response.data);
      } catch (error) {
        console.error("Error during OTP sending or logging:", error);
        setError(error.message);
      }
    } else {
      setError("Invalid Phone Number");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length === 4 && confirmResult) {
      try {
        await axios.post(
          "https://twitter-cxhu.onrender.com/verify-sms-otp",
          {
            phoneNumber: phoneNumber,
            otp: otp.trim(),
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        await axios.post(
          "https://twitter-cxhu.onrender.com/register",
          { user: phoneNumber },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        navigate("/");
        axios.post("https://twitter-cxhu.onrender.com/phoneHistory", {
          phoneNumber,
        });
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setError(error.message);
      }
    } else {
      setError("Please enter a 4-digit OTP code");
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
              defaultCountry="IN" // Set a default country if needed
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
                  {t("Verify")}
                </button>
              </form>
            )}
          </form>
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
