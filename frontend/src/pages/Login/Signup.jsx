import React, { useState } from "react";
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
  const [error, setError] = useState("");
  const { t } = useTranslation("translations");
  const { signUp, googleSignIn } = useUserAuth();
  const navigate = useNavigate();

  const handlePhone = () => {
    navigate("/mobile");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signUp(email, password);
      navigate("/");

      // Send user data to backend; browser details and IP will be handled server-side
      const user = {
        username,
        name,
        email,
      };

      const response = await fetch(
        "https://twitter-cxhu.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      const data = await response.json();
      if (!data.acknowledged) {
        throw new Error("Registration failed.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();

    try {
      const user = await googleSignIn();
      const userEmail = user.email;
      navigate("/");

      // Send login info to backend, including email from Google sign-in
      await axios.post(
        "https://twitter-cxhu.onrender.com/loginHistory",
        { systemInfo: { email: userEmail } },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log(error.message);
      setError("Google sign-in failed.");
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
          <hr />
          <GoogleButton
            className="g-btn"
            type="light"
            onClick={handleGoogleSignIn}
          />
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
