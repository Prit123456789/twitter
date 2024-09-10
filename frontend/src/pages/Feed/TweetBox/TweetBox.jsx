import React, { useState, useEffect, useRef, useCallback } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedInUser from "../../../hooks/useLoggedInUser";
import RecordRTC from "recordrtc";

function TweetBox() {
  const { t } = useTranslation("translations");
  const [post, setPost] = useState("");
  const [imageurl, setimageurl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [loggedInUser] = useLoggedInUser();
  const { user } = useUserAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(false);

  const recorderRef = useRef(null);
  const name = loggedInUser[0]?.name
    ? loggedInUser[0]?.name
    : user?.displayName;
  const userProfilePic =
    loggedInUser[0]?.profileImage ||
    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";
  const username = user.email ? user?.email?.split("@")[0] : user.phoneNumber;

  const email = user?.email;
  const phoneNumber = user?.phoneNumber;

  const handleUploadImage = async (e) => {
    // ... (same image upload logic as before)
  };

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new RecordRTC(stream, { type: "audio" });
        recorderRef.current = recorder;
        recorder.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    };

    if (otpVerified) {
      startRecording();
    }
  }, [otpVerified]);

  const handleTweet = async (e) => {
    e.preventDefault();
    if (!imageurl && !audioBlob && !post) {
      return; // No content to post
    }

    const identifier = email
      ? `email=${email}`
      : `phoneNumber=${phoneNumber.replace("+", "")}`;
    await fetch(`https://twitter-cxhu.onrender.com/loggedInUser?${identifier}`);

    const formData = new FormData();
    formData.append("profilePhoto", userProfilePic);
    formData.append("post", post);
    formData.append("photo", imageURL);
    formData.append("username", username);
    formData.append("name", name);

    if (email || enteredEmail) {
      formData.append("email", email || enteredEmail);
    }

    if (phoneNumber) {
      formData.append("phoneNumber", phoneNumber);
    }

    if (audioBlob) {
      const audioFile = new File([audioBlob], "audio.mp3", {
        type: "audio/mp3",
      });
      formData.append("audio", audioFile);
    }

    try {
      console.log("Sending Post Request");
      const postResponse = await fetch(
        "https://twitter-cxhu.onrender.com/post",
        {
          method: "POST",
          body: formData,
        }
      );
      const postData = await postResponse.json();
      console.log("Post Response:", postData);
      setPost("");
      setimageurl("");
      setImageURL("");
      setAudioBlob(null);
    } catch (error) {
      console.error("Error posting tweet:", error);
    }
  };

  // Play the recorded audio
  const handlePlayAudio = useCallback(() => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      audioElement.play();
    }
  }, [audioBlob]);

  const sendOtp = async (emailForOtp) => {
    if (emailForOtp) {
      try {
        await axios.post("https://twitter-cxhu.onrender.com/send-email-otp", {
          email: emailForOtp,
        });
        alert("OTP sent to your email");
        setOtpSent(true);
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Failed to send OTP. Please try again.");
      }
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const emailForOtp = email || enteredEmail;
    if (otpSent && otp) {
      try {
        await axios.post("https://twitter-cxhu.onrender.com/verify-email-otp", {
          email: emailForOtp,
          otp: otp,
        });
        alert("OTP verification successful");
        setOtpVerified(true); // This triggers the recording start in useEffect
        setOtpSent(false);
        setVerificationError(false);
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setVerificationError(true);
      }
    }
  };

  const handleStartRecording = async () => {
    const emailForOtp = email || enteredEmail;
    sendOtp(emailForOtp);
  };

  const handleStopRecording = async () => {
    if (recorderRef.current && recorderRef.current.stream) {
      try {
        recorderRef.current.stopRecording(async () => {
          const blob = await recorderRef.current.getBlob();
          setAudioBlob(blob);
          setIsRecording(false);

          recorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
          recorderRef.current = null;
        });
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  };

  return (
    <div className="tweetBox">
      <form onSubmit={handleTweet}>
        <div className="tweetBox__input">
          <Avatar src={userProfilePic} />
          <input
            type="text"
            placeholder={t("What's happening?")}
            onChange={(e) => setPost(e.target.value)}
            value={post}
          />
        </div>

        <div className="mediaIcons_tweetButton">
          <label htmlFor="file" className="imageIcon">
            {imageurl ? (
              <p>{t("Uploading Image")}</p>
            ) : (
              <p>
                {imageurl && !isLoading ? (
                  <p>{t("Image Uploaded")}</p>
                ) : (
                  <AddPhotoAlternateOutlinedIcon />
                )}
              </p>
            )}
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleUploadImage}
          />
          <label className="micIcons">
            {isRecording ? (
              <MicOffIcon onClick={handleStopRecording} />
            ) : (
              <MicIcon onClick={handleStartRecording} />
            )}
          </label>
          {audioBlob && (
            <Button onClick={handlePlayAudio} className="tweetBox__playButton">
              {t("Play Audio")}
            </Button>
          )}

          <Button
            type="submit"
            className="tweetBox__tweetButton"
            disabled={!post && !imageURL && !audioBlob}>
            Tweet
          </Button>
        </div>
        {!email && isLoading && (
          <>
            <input
              placeholder={t("Enter Email")}
              className="email"
              value={enteredEmail}
              onChange={(e) => setEnteredEmail(e.target.value)}
              required
            />
            <button onClick={sendOtp} className="otp-btn">
              {t("Send")}
            </button>
          </>
        )}
        {otpSent && !otpVerified && (
          <>
            <input
              placeholder={t("Enter OTP")}
              className="email"
              type="text"
              value={otp}
              maxLength={4}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
              required
            />
            <button onClick={verifyOtp} className="otp-btn">
              {t("Verify")}
            </button>
            {verificationError && (
              <p className="error-message">
                {t("OTP verification failed. Please try again.")}
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}

export default TweetBox;
