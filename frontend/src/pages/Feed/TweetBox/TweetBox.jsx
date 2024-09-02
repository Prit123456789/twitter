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

function OtpVerification({ otp, setOtp, verifyOtp }) {
  return (
    <div>
      <input
        className="otpVerification"
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button className="otp-btn" onClick={verifyOtp}>
        Verify OTP
      </button>
    </div>
  );
}

function TweetBox() {
  const { t } = useTranslation("translations");
  const [post, setPost] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loggedInUser] = useLoggedInUser();
  const { user } = useUserAuth();
  const email = user?.email;
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [isAudioUploadAllowed, setIsAudioUploadAllowed] = useState(false);

  const userProfilePic =
    loggedInUser[0]?.profileImage ||
    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

  // Check if audio upload is allowed based on the current time
  useEffect(() => {
    const checkAudioUploadTime = () => {
      const currentHour = new Date().getHours();
      setIsAudioUploadAllowed(currentHour >= 14 && currentHour <= 19); // Allow uploads from 2 PM to 7 PM IST
    };

    checkAudioUploadTime();
    const interval = setInterval(checkAudioUploadTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Setup media recorder for audio recording
  useEffect(() => {
    const setupMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
          setAudioBlob(event.data);
        });

        mediaRecorderRef.current.addEventListener("stop", () => {
          stream.getTracks().forEach((track) => track.stop());
        });
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    setupMediaRecorder();

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle image upload
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
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tweet post
  const handleTweet = async (e) => {
    e.preventDefault();

    if (user?.providerData[0]?.providerId === "password") {
      const response = await fetch(
        `https://twitter-cxhu.onrender.com/loggedInUser?email=${email}`
      );
      const data = await response.json();
      setName(data[0]?.name);
      setUsername(data[0]?.username);
    } else {
      setName(user?.displayName);
      setUsername(email?.split("@")[0]);
    }

    if (name) {
      const formData = new FormData();
      formData.append("profilePhoto", userProfilePic);
      formData.append("post", post);
      formData.append("photo", imageURL);
      formData.append("username", username);
      formData.append("name", name);
      formData.append("email", email);

      if (audioBlob) {
        const audioFile = new File([audioBlob], "audio.mp3", {
          type: "audio/mp3",
        });
        formData.append("audio", audioFile);

        try {
          const cloudinaryResponse = await axios.post(
            "https://api.cloudinary.com/v1_1/dgziwljwc/raw/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Basic ${btoa(
                  "819573983982481:wkmuP9qfqbaTHAdfmFnAfMxR1SE"
                )}`,
              },
            }
          );
          const cloudinaryAudioURL = cloudinaryResponse.data.secure_url;
          formData.append("audio", cloudinaryAudioURL);
        } catch (error) {
          console.error("Error uploading audio to Cloudinary:", error);
        }
      }

      try {
        const postResponse = await fetch(
          "https://twitter-cxhu.onrender.com/post",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await postResponse.json();
        console.log(data);
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

  // Send OTP
  const sendOtp = async () => {
    try {
      await axios.post("https://twitter-cxhu.onrender.com/send-email-otp", {
        email,
      });
      alert("OTP sent to your email");
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  // Verify OTP

  const verifyOtp = async () => {
    if (!otpSent) {
      alert("OTP has not been sent yet.");
      return;
    }

    // Validate OTP length
    if (otp.trim().length !== 4) {
      alert("OTP must be exactly 4 digits.");
      return;
    }

    // Ensure email is available
    if (!email) {
      alert("Email is required for verification.");
      return;
    }

    try {
      // Prepare the payload with trimmed and validated data
      const payload = {
        email: email.trim(), // Ensure there is no extra whitespace
        otp: otp.trim(), // Ensure OTP is trimmed
      };

      // Log the payload to debug if necessary
      console.log("Sending OTP verification request with payload:", payload);

      // Make the request to verify OTP
      const response = await axios.post(
        "https://twitter-cxhu.onrender.com/verify-email-otp",
        payload,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set headers
          },
        }
      );

      // Check the response for success
      if (response.data.success && response.data.isOtpValid) {
        setOtpVerified(true);
        alert("OTP verified successfully.");
      } else {
        alert("Invalid OTP, please try again.");
      }
    } catch (error) {
      // Enhanced error handling with specific response feedback
      if (error.response) {
        console.error("Error verifying OTP:", error.response.data);
        alert(
          `Failed to verify OTP: ${
            error.response.data.message || "Unknown error."
          }`
        );
      } else {
        console.error("Error sending verification request:", error.message);
        alert("Failed to verify OTP. Please try again later.");
      }
    }
  };

  // Start recording audio
  const handleStartRecording = () => {
    if (!otpSent) {
      sendOtp();
    } else if (
      otpVerified &&
      mediaRecorderRef.current &&
      isAudioUploadAllowed
    ) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else if (!otpVerified) {
      alert("Please verify the OTP before starting recording.");
    } else if (!isAudioUploadAllowed) {
      alert("Audio uploads are only allowed between 2 PM and 7 PM IST.");
    }
  };

  // Stop recording audio
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
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
            required
          />
        </div>
        <div className="mediaIcons_tweetButton">
          <label htmlFor="image" className="imageIcon">
            {isLoading ? (
              <p>{t("Uploading Image")}</p>
            ) : (
              <p>
                {imageURL ? (
                  "Image Uploaded"
                ) : (
                  <AddPhotoAlternateOutlinedIcon />
                )}
              </p>
            )}
          </label>
          <input
            type="file"
            id="image"
            className="imageInput"
            onChange={handleUploadImage}
          />
          <div className="audio-controls">
            {audioBlob ? (
              <MicOffIcon className="micIcon" onClick={handlePlayAudio} />
            ) : isRecording ? (
              <MicOffIcon className="micIcon" onClick={handleStopRecording} />
            ) : (
              <MicIcon className="micIcon" onClick={handleStartRecording} />
            )}
          </div>
          <Button type="submit" className="tweetBox__tweetButton">
            {t("Tweet")}
          </Button>
        </div>
      </form>
      {otpSent && !otpVerified && (
        <OtpVerification otp={otp} setOtp={setOtp} verifyOtp={verifyOtp} />
      )}
    </div>
  );
}

export default TweetBox;
