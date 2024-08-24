import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../../context/UserAuthContext";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from '@mui/icons-material/Twitter';
import "./Login.css";
import { useTranslation } from "react-i18next";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {t}= useTranslation('translations')
    const [error, setError] = useState("");
    const { logIn, googleSignIn } = useUserAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await logIn(email, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
            window.alert(err.message);
        }
    };
    const handleReset=()=>{
        navigate("/reset");
    }
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
                    <img className=" image" src={twitterimg} alt="twitterImage" />
                </div>

                <div className="form-container">
                    <div className="form-box" >
                        <TwitterIcon style={{ color: "skyblue" }} />
                        <h2 className="heading">{t('Happening now')}</h2>

                        {error && <p>{error.message}</p>}
                        <form onSubmit={handleSubmit}>

                            <input
                                type="email" className="email"
                                placeholder={t("Email address")}
                                onChange={(e) => setEmail(e.target.value)}
                            />



                            <input className="password"
                                type="password"
                                placeholder={t("Password")}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <div className="btn-login">
                                <button type="submit" className="btn" >{t('Log In')}</button>
                            </div>
                        </form>
                                 <p onClick={handleReset} className="forgot">{t('Forgot password?')}</p>
                        <hr />
                        <div>
                            <GoogleButton

                                className="g-btn"
                                type="light"
                                marginLeft='80px'
                                onClick={handleGoogleSignIn}
                            />


                        </div>
                    </div>
                    <div>
                       {t("Don't have an account?")}
                        <Link
                            to="/signup"
                            style={{
                                textDecoration: 'none',
                                color: 'var(--twitter-color)',
                                fontWeight: '600',
                                marginLeft: '2px'
                            }}
                        >
                            {t('Sign Up')}
                        </Link>
                    </div>

                </div>


            </div>


        </>
    );
};

export default Login;
