import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import twitterimg from "../../image/twitter.jpeg";
import { useTranslation } from "react-i18next";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import PhoneIcon from "@mui/icons-material/Phone";
import "./Login.css";

const Signup = ({ userBrowser, userDevice, userOS, userIP }) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation("translations");
  const { signUp, googleSignIn } = useUserAuth();
  let navigate = useNavigate();

  const handlePhone = () => {
    navigate("/mobile");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signUp(email, password);

      const user = {
        username,
        name,
        email,
        browser: userBrowser,
        device: userDevice,
        os: userOS,
        ip: userIP,
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

      if (data.acknowledged) {
        console.log(data);
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
      window.alert(err.message);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img className="image" src={twitterimg} alt="twitterImage" />
        </div>

        <div className="form-container">
          <div>
            <TwitterIcon className="Twittericon" style={{ color: "skyblue" }} />
            <h2 className="heading">{t("Happening now")}</h2>

            <div className="d-flex align-items-sm-center">
              <h3 className="heading1">{t("Join twitter today")}</h3>
            </div>

            {error && <p className="errorMessage">{error}</p>}
            <form onSubmit={handleSubmit}>
              <input
                className="display-name"
                type="text"
                placeholder="@username"
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                className="display-name"
                type="text"
                placeholder={t("Enter Full Name")}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="email"
                type="email"
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
                  {t("Sign Up")}
                </button>
              </div>
            </form>
            <hr />
            <div className="google-button">
              <GoogleButton
                className="g-btn"
                type="light"
                onClick={handleGoogleSignIn}
              />
            </div>
            <div>
              <button className="phone-btn" type="button" onClick={handlePhone}>
                <PhoneIcon style={{ color: "green" }} />
                Sign in with Phone
              </button>
            </div>
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
    </>
  );
};

export default Signup;
