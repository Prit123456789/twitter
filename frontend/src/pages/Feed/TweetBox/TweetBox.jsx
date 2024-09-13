import React, { useState, useEffect, useRef } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicIcon from "@mui/icons-material/Mic";
import DoneIcon from "@mui/icons-material/Done";
import MicOffIcon from "@mui/icons-material/MicOff";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedInUser from "../../../hooks/useLoggedInUser";
import RecordRTC from "recordrtc";
import ReactAudioPlayer from "react-audio-player";

function TweetBox() {
  const { t } = useTranslation("translations");
  const [post, setPost] = useState("");
  const [imageurl, setimageurl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [loggedInUser] = useLoggedInUser();
  const { user } = useUserAuth();
  const [mobile, setMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [enteredEmail, setEnteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(false);

  const recorderRef = useRef(null);
  const name = loggedInUser[0]?.name
    ? loggedInUser[0]?.name
    : user?.displayName || user?.phoneNumber;
  const userProfilePic =
    loggedInUser[0]?.profileImage ||
    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";
  const username = user.email ? user?.email?.split("@")[0] : user.phoneNumber;
  const email = user?.email;
  const phoneNumber = user?.phoneNumber;

  const handleUploadImage = async (e) => {
    setIsLoading(true);
    const image = e.target.files[0];

    const formData = new FormData();
    formData.set("image", image);
    axios
      .post(
        "https://api.imgbb.com/1/upload?key=5ccca74448be7fb4c1a7baebca13e0d2",
        formData
      )
      .then((res) => {
        setimageurl(res.data.data.display_url);
        setImageURL(res.data.data.display_url);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const isInAllowedTimeRange = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const ISTOffset = 330;
    const IST = new Date(now.getTime() + (ISTOffset + offset) * 60000);
    const hours = IST.getHours();
    return hours >= 14 && hours <= 19;
  };
  useEffect(() => {
    const startRecording = async () => {
      try {
        if (isInAllowedTimeRange()) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const recorder = new RecordRTC(stream, { type: "audio" });
          recorderRef.current = recorder;
          recorder.startRecording();
          setIsRecording(true);
        } else {
          alert("Audio uploads are restricted beyond 2PM to 7PM IST");
        }
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    };

    if (otpVerified) {
      startRecording();
    }
  }, [otpVerified]);
  const getAudioDurationUsingContext = async (audioBlob) => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    return new Promise((resolve, reject) => {
      audioContext.decodeAudioData(
        arrayBuffer,
        (audioBuffer) => {
          resolve(audioBuffer.duration);
        },
        (error) => {
          reject("Error decoding audio data: " + error);
        }
      );
    });
  };

  const handleTweet = async (e) => {
    e.preventDefault();
    if (!imageurl && !audioBlob && !post) {
      return;
    }
    setIsLoading(true);

    if (audioBlob) {
      const audioSizeMB = audioBlob.size / (1024 * 1024);
      if (audioSizeMB > 100) {
        alert("Audio file size exceeds the 100 MB limit.");
        setIsLoading(false);
        return;
      }

      try {
        const duration = await getAudioDurationUsingContext(audioBlob);

        if (duration > 300) {
          alert("Audio duration exceeds the 5 minutes limit.");
          setIsLoading(false);
          return;
        }

        // Proceed with posting the tweet
        const identifier = email
          ? `email=${email}`
          : `phoneNumber=${phoneNumber.replace("+", "")}`;
        await fetch(
          `https://twitter-cxhu.onrender.com/loggedInUser?${identifier}`
        );

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

        const audioFile = new File([audioBlob], "audio.mp3", {
          type: "audio/mp3",
        });
        formData.append("audio", audioFile);

        const response = await fetch("https://twitter-cxhu.onrender.com/post", {
          method: "POST",
          body: formData,
        });

        const postData = await response.json();
        console.log("Post Response:", postData);
        setPost("");
        setimageurl("");
        setImageURL("");
        setAudioBlob(null);
        setIsLoading(false);
      } catch (error) {
        alert(error);
        setIsLoading(false);
      }
    } else {
      // Handling non-audio posts
      const identifier = email
        ? `email=${email}`
        : `phoneNumber=${phoneNumber.replace("+", "")}`;
      await fetch(
        `https://twitter-cxhu.onrender.com/loggedInUser?${identifier}`
      );

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

      fetch("https://twitter-cxhu.onrender.com/post", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((postData) => {
          console.log("Post Response:", postData);
          setPost("");
          setimageurl("");
          setImageURL("");
          setAudioBlob(null);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error posting tweet:", error);
          setIsLoading(false);
        });
    }
  };

  const sendOtp = async (emailForOtp) => {
    if (isInAllowedTimeRange()) {
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
    } else {
      alert("Audio uploads are restricted beyond 2PM to 7PM IST");
    }
  };

  const verifyOtp = async () => {
    const emailForOtp = email || enteredEmail;
    if (otpSent && otp) {
      try {
        await axios.post("https://twitter-cxhu.onrender.com/verify-email-otp", {
          email: emailForOtp,
          otp: otp,
        });
        alert("OTP verification successful");
        setOtpVerified(true);
        setOtpSent(false);
        setVerificationError(false);
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setVerificationError(true);
      }
    }
  };

  const handleStartRecording = async () => {
    setMobile(true);
    const emailForOtp = email || enteredEmail;
    sendOtp(emailForOtp);
  };
  const handleStopRecording = async () => {
    if (recorderRef.current) {
      try {
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current.getBlob();
          setAudioBlob(blob);
          setIsRecording(false);

          const stream = recorderRef.current.stream;
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }

          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

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
            {imageurl && isLoading ? (
              <p>{t("Uploading Image")}</p>
            ) : (
              <p>
                {imageurl && !isLoading ? (
                  <DoneIcon />
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
            {isRecording && isInAllowedTimeRange() ? (
              <MicOffIcon onClick={handleStopRecording} />
            ) : (
              <MicIcon onClick={handleStartRecording} />
            )}
          </label>
          {audioBlob && <ReactAudioPlayer src={audioUrl} controls />}

          <Button
            type="submit"
            className="tweetBox__tweetButton"
            disabled={!post && !imageURL && !audioBlob}>
            Tweet
          </Button>
        </div>
        {!email && isLoading && mobile && (
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
