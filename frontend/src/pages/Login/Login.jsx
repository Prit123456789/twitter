import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../../context/UserAuthContext";
import axios from "axios";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import PhoneIcon from "@mui/icons-material/Phone";
import "./Login.css";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isChrome, setIsChrome] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { logIn, googleSignIn } = useUserAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("translations");

  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) {
        setIsChrome(true);
      } else {
        setIsChrome(false);
      }
    };

    detectBrowser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOtpSent(false);

    try {
      // Login using the provided email and password
      await logIn(email, password);

      if (isChrome) {
        // Send OTP if the browser is Chrome
        const otpResponse = await axios.post(
          "https://twitter-cxhu.onrender.com/send-email-otp",
          { email },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (otpResponse.data.message === "OTP sent to your email") {
          setOtpSent(true);
        }
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
      window.alert(err.message);
    }
  };

  const handleVerify = async () => {
    setError("");

    try {
      const response = await axios.post(
        "https://twitter-cxhu.onrender.com/verify-email-otp",
        { email, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    navigate("/reset");
  };

  const handlePhone = () => {
    navigate("/mobile");
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      const user = await googleSignIn();
      navigate("/");

      await axios.post(
        "https://twitter-cxhu.onrender.com/loginHistory",
        { systemInfo: { email: user.email } },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log(error.message);
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

          {error && <p>{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="email"
              placeholder={t("Email address")}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="password"
              type="password"
              placeholder={t("Password")}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isChrome && otpSent && (
              <>
                <input
                  className="otp"
                  type="text"
                  placeholder={t("Enter OTP")}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button type="button" onClick={handleVerify}>
                  {t("Verify OTP")}
                </button>
              </>
            )}
            <div className="btn-login">
              <button type="submit" className="btn">
                {t("Log In")}
              </button>
            </div>
          </form>
          <p onClick={handleReset} className="forgot">
            {t("Forgot password?")}
          </p>
          <hr />
          <div>
            <GoogleButton
              className="g-btn"
              type="light"
              marginLeft="80px"
              onClick={handleGoogleSignIn}
            />
            <div>
              <button
                className="phone-btn"
                type="button"
                marginLeft="80px"
                onClick={handlePhone}>
                <PhoneIcon style={{ color: "green" }} />
                {t("Sign in with Phone")}
              </button>
            </div>
          </div>
        </div>
        <div>
          {t("Don't have an account?")}
          <Link
            to="/signup"
            style={{
              textDecoration: "none",
              color: "var(--twitter-color)",
              fontWeight: "600",
              marginLeft: "2px",
            }}>
            {t("Sign Up")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
