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
  const phoneNumber = user?.phoneNumber;
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [enteredEmail, setEnteredEmail] = useState(""); // For entering email if logged in with phone number
  const [emailOtp, setEmailOtp] = useState(""); // For OTP verification for email
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isAudioUploadAllowed, setIsAudioUploadAllowed] = useState(false);
  const mediaRecorderRef = useRef(null);

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
        alert("Microphone access is required to record audio.");
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

    const identifier = email ? `email=${email}` : `phoneNumber=${phoneNumber}`;
    const response = await fetch(
      `https://twitter-cxhu.onrender.com/loggedInUser?${identifier}`
    );
    const data = await response.json();
    setName(data[0]?.name);
    setUsername(data[0]?.username);

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
          // Upload to Cloudinary
          const audioUploadResponse = await fetch(
            "https://twitter-cxhu.onrender.com/upload-audio",
            {
              method: "POST",
              body: audioFormData,
            }
          );
          const audioData = await audioUploadResponse.json();
          console.log(audioData);

          // Append Cloudinary URL to your formData
          formData.append("audioURL", audioData.secure_url);
        } catch (error) {
          console.error("Error uploading audio:", error);
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

  // Send OTP if the user is logged in with phoneNumber
  const sendOtp = async (emailForOtp) => {
    if (emailForOtp) {
      try {
        await axios.post("https://twitter-cxhu.onrender.com/send-email-otp", {
          email: emailForOtp,
        });
        alert("OTP sent to your email");
        setIsEmailOtpSent(true);
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Failed to send OTP. Please try again.");
      }
    }
  };

  // Start recording audio
  const handleStartRecording = () => {
    const emailForOtp = email || enteredEmail;
    if (!otpSent && phoneNumber && emailForOtp) {
      sendOtp(emailForOtp);
    } else if (
      otpVerified &&
      mediaRecorderRef.current &&
      isAudioUploadAllowed
    ) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else if (!otpVerified && phoneNumber) {
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
            accept="image/*"
            onChange={handleUploadImage}
          />
          <div className="audio-record-controls">
            {isRecording ? (
              <MicOffIcon onClick={handleStopRecording} />
            ) : (
              <MicIcon onClick={handleStartRecording} />
            )}
          </div>
          <Button
            className="tweetBox__tweetButton"
            variant="outlined"
            color="primary"
            type="submit">
            {t("Tweet")}
          </Button>
        </div>
      </form>

      {audioBlob && (
        <Button onClick={handlePlayAudio} color="primary" variant="text">
          Play
        </Button>
      )}
      {phoneNumber && !otpVerified && (
        <div>
          <input
            type="text"
            value={enteredEmail}
            onChange={(e) => setEnteredEmail(e.target.value)}
            placeholder="Enter your email for OTP"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => sendOtp(enteredEmail)}
            disabled={isEmailOtpSent}>
            {isEmailOtpSent ? "OTP Sent" : "Send OTP"}
          </Button>
          {isEmailOtpSent && (
            <div>
              <input
                type="text"
                placeholder="Enter OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
              />
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post(
                      "https://twitter-cxhu.onrender.com/verify-email-otp",
                      {
                        email: enteredEmail,
                        otp: emailOtp,
                      }
                    );
                    if (response.data.success) {
                      setOtpVerified(true);
                      alert("OTP verified successfully!");
                    } else {
                      alert("Invalid OTP. Please try again.");
                    }
                  } catch (error) {
                    alert("Error verifying OTP. Please try again.");
                  }
                }}
                disabled={otpVerified}>
                {t("Verify")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TweetBox;
