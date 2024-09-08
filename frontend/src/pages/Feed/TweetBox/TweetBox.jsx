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
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loggedInUser] = useLoggedInUser();
  const { user } = useUserAuth();
  const email = user?.email;
  const phoneNumber = user?.phoneNumber;
  const [otpVerified, setOtpVerified] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isAudioUploadAllowed, setIsAudioUploadAllowed] = useState(false);
  const recorderRef = useRef(null);

  const userProfilePic =
    loggedInUser[0]?.profileImage ||
    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";
  const username = user.email ? user?.email?.split("@")[0] : user.phoneNumber;

  useEffect(() => {
    const checkAudioUploadTime = () => {
      const currentHour = new Date().getHours();
      setIsAudioUploadAllowed(currentHour >= 14 && currentHour <= 19);
    };

    checkAudioUploadTime();
    const interval = setInterval(checkAudioUploadTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadImage = async (e) => {
    setIsLoading(true);
    const image = e.target.files[0];

    const formData = new FormData();
    formData.set("image", image);

    try {
      const response = await axios.post(
        "https://api.imgbb.com/1/upload?key=5ccca74448be7fb4c1a7baebca13e0d2",
        formData
      );
      setImageURL(response.data.data.display_url);
      setimageurl(response.data.data.display_url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTweet = async (e) => {
    e.preventDefault();
    console.log("Starting Tweet Post");

    const identifier = email ? `email=${email}` : `phoneNumber=${phoneNumber}`;
    const response = await fetch(
      `https://twitter-cxhu.onrender.com/loggedInUser?${identifier}`
    );
    const data = await response.json();
    setName(data[0]?.name);

    console.log("Form Data:", {
      profilePhoto: userProfilePic,
      post,
      photo: imageURL,
      username,
      name,
      email: email || enteredEmail,
      phoneNumber: phoneNumber || "",
    });

    if (name) {
      const formData = new FormData();
      formData.append("profilePhoto", userProfilePic);
      formData.append("post", post);
      formData.append("photo", imageURL);
      formData.append("username", username);
      formData.append("name", name);
      formData.append("email", email || enteredEmail);
      formData.append("phoneNumber", phoneNumber || "");

      if (audioBlob) {
        const audioFile = new File([audioBlob], "audio.mp3", {
          type: "audio/mp3",
        });
        const audioFormData = new FormData();
        audioFormData.append("audio", audioFile);

        try {
          console.log("Uploading Audio");
          const audioUploadResponse = await fetch(
            "https://twitter-cxhu.onrender.com/upload-audio",
            {
              method: "POST",
              body: audioFormData,
            }
          );
          const audioData = await audioUploadResponse.json();
          console.log("Audio Upload Response:", audioData);

          formData.append("audioURL", audioData.secure_url);
        } catch (error) {
          console.error("Error uploading audio:", error);
        }
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
        setImageURL("");
        setAudioBlob(null);
      } catch (error) {
        console.error("Error posting tweet:", error);
      }
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

  // Send OTP if the user is logged in with phoneNumber
  const sendOtp = async (emailForOtp) => {
    if (emailForOtp) {
      try {
        await axios.post("https://twitter-cxhu.onrender.com/send-email-otp", {
          email: emailForOtp,
        });
        alert("OTP sent to your email");
        setOtpSent(true); // Update OTP sent state here
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Failed to send OTP. Please try again.");
      }
    }
  };

  // Verify OTP

  // Verify OTP
  const verifyOtp = async () => {
    const emailForOtp = email || enteredEmail;

    if (!emailForOtp) {
      alert("Please provide an email address to verify OTP.");
      return;
    }

    console.log(
      "Attempting to verify OTP for:",
      emailForOtp,
      "with OTP:",
      otp.trim()
    );

    try {
      const response = await axios.post(
        "https://twitter-cxhu.onrender.com/verify-email-otp",
        {
          email: emailForOtp,
          otp: otp.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response from OTP verification:", response.data);

      if (response.data.success) {
        setOtpVerified(true);
        alert("OTP verified successfully");
      } else {
        alert(response.data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please try again.");
    }
  };

  // Start recording audio
  const handleStartRecording = async () => {
    const emailForOtp = email || enteredEmail;

    console.log("Checking conditions for starting recording");
    console.log("OTP Sent:", otpSent);
    console.log("OTP Verified:", otpVerified);
    console.log("Is Audio Upload Allowed:", isAudioUploadAllowed);
    console.log("Phone Number:", phoneNumber);
    console.log("Email or Entered Email:", emailForOtp);

    // If OTP has not been sent, send it first
    if (!otpSent && emailForOtp) {
      await sendOtp(emailForOtp);
    } else if (otpVerified && isAudioUploadAllowed) {
      // Start recording only if OTP is verified and within allowed hours
      startRecording();
    } else if (!otpVerified) {
      alert("Please verify the OTP before starting recording.");
    } else if (!isAudioUploadAllowed) {
      alert("Audio uploads are only allowed between 2 PM and 7 PM IST.");
    }
  };

  const startRecording = async () => {
    if (!recorderRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        recorderRef.current = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/mp3",
          recorderType: RecordRTC.MediaStreamRecorder,
          timeSlice: 1000,
          ondataavailable: (blob) => {
            setAudioBlob(blob);
          },
        });
        recorderRef.current.startRecording();
        setIsRecording(true);
        console.log("Recording started successfully");
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Microphone access is required to record audio.");
      }
    }
  };

  // Stop recording audio
  const handleStopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current.getBlob();
        setAudioBlob(blob);
      });
      setIsRecording(false);
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
            {isLoading ? (
              <p>{t("Uploading Image")}</p>
            ) : (
              <p>
                {imageurl ? (
                  "Image Uploaded"
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
          </>
        )}
      </form>
    </div>
  );
}

export default TweetBox;
