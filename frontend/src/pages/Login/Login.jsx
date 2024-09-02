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
  const [googleUserEmail, setGoogleUserEmail] = useState("");
  const { logIn, googleSignIn } = useUserAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("translations");

  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      const isChromeBrowser =
        userAgent.includes("Chrome") && !userAgent.includes("Edg");
      setIsChrome(isChromeBrowser);
    };

    detectBrowser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOtpSent(false);

    try {
      await logIn(email, password);

      if (isChrome) {
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
        await axios.post(
          "https://twitter-cxhu.onrender.com/loginHistory",
          { systemInfo: { email } },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
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
        { email: googleUserEmail || email, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        navigate("/");
        await axios.post(
          "https://twitter-cxhu.onrender.com/loginHistory",
          { systemInfo: { email: googleUserEmail || email } },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
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
    setError("");
    setOtpSent(false);

    try {
      const user = await googleSignIn();
      setGoogleUserEmail(user.email);

      if (isChrome) {
        const otpResponse = await axios.post(
          "https://twitter-cxhu.onrender.com/send-email-otp",
          { email: user.email },
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
        await axios.post(
          "https://twitter-cxhu.onrender.com/loginHistory",
          { systemInfo: { email: user.email } },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      setError(error.message);
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

          {error && <p className="errorMessage">{error}</p>}
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

            <div className="btn-login">
              <button type="submit" className="btn">
                {t("Log In")}
              </button>
            </div>
          </form>

          {/* OTP fields and button should be placed here for both login and Google sign-in */}
          {isChrome && otpSent && (
            <>
              <input
                className="otp-field"
                type="text"
                placeholder={t("Enter OTP")}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="button" className="otp" onClick={handleVerify}>
                {t("Verify")}
              </button>
            </>
          )}

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
