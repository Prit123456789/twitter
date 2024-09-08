import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import twitterimg from "../../image/twitter.jpeg";
import axios from "axios";
import { useTranslation } from "react-i18next";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import PhoneIcon from "@mui/icons-material/Phone";
import "./Login.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);
  const { t } = useTranslation("translations");
  const { signUp, googleSignIn } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      const isChromeBrowser =
        userAgent.includes("Chrome") && !userAgent.includes("Edg");
      setIsChrome(isChromeBrowser);
    };

    detectBrowser();
  }, []);

  const handlePhone = () => {
    navigate("/mobile");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOtpSent(false);

    try {
      await signUp(email, password);

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
        await axios.post(
          "https://twitter-cxhu.onrender.com/register",
          { email, name, username },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setIsGoogleSignUp(true);

    try {
      const user = await googleSignIn();

      setEmail(user.email);

      if (isChrome) {
        const otpResponse = await axios.post(
          "https://twitter-cxhu.onrender.com/send-email-otp",
          { email: user.user.email },
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
        await axios.post(
          "https://twitter-cxhu.onrender.com/register",
          { email: user.user.email, name, username },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        navigate("/");

        await axios.post(
          "https://twitter-cxhu.onrender.com/loginHistory",
          { systemInfo: { email: user.user.email } },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.log(error.message);
      setError("Google sign-in failed.");
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
        await axios.post(
          "https://twitter-cxhu.onrender.com/register",
          { email, name, username },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
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
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img className="image" src={twitterimg} alt="Twitter" />
      </div>

      <div className="form-container">
        <div>
          <TwitterIcon className="Twittericon" style={{ color: "skyblue" }} />
          <h2 className="heading">{t("Happening now")}</h2>
          <h3 className="heading1">{t("Join Twitter today")}</h3>

          {error && <p className="errorMessage">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              className="display-name"
              type="text"
              placeholder="@username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="display-name"
              type="text"
              placeholder={t("Enter Full Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="email"
              type="email"
              placeholder={t("Email address")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="password"
              type="password"
              placeholder={t("Password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="btn-login">
              <button type="submit" className="btn">
                {t("Sign Up")}
              </button>
            </div>
          </form>

          {otpSent && (
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

          <hr />
          {!isGoogleSignUp && (
            <GoogleButton
              className="g-btn"
              type="light"
              onClick={handleGoogleSignIn}
            />
          )}
          <button className="phone-btn" type="button" onClick={handlePhone}>
            <PhoneIcon style={{ color: "green" }} />
            {t("Sign in with Phone")}
          </button>
          <div>
            {t("Already have an account?")}
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                color: "var(--twitter-color)",
                fontWeight: "600",
                marginLeft: "5px",
              }}>
              {t("Log In")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
