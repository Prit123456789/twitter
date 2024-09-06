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
  const [otpSent] = useState(false);
  const [otpVerified] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [enteredEmail] = useState("");
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isAudioUploadAllowed, setIsAudioUploadAllowed] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

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

  // Setup media recorder
  const setupMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Accumulate audio chunks
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
        setAudioBlob(audioBlob);
        audioChunks.current = []; // Reset chunks
        stream.getTracks().forEach((track) => track.stop());
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required to record audio.");
    }
  };

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
    console.log("Starting Tweet Post");

    const identifier = email ? `email=${email}` : `phoneNumber=${phoneNumber}`;
    const response = await fetch(
      `https://twitter-cxhu.onrender.com/loggedInUser?${identifier}`
    );
    const data = await response.json();
    setName(data[0]?.name);
    setUsername(data[0]?.username);

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
        const data = await postResponse.json();
        console.log("Post Response:", data);
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
  const handleStartRecording = async () => {
    const emailForOtp = email || enteredEmail;

    if (!otpSent && phoneNumber && emailForOtp) {
      sendOtp(emailForOtp);
    } else if (otpVerified && isAudioUploadAllowed) {
      if (!mediaRecorderRef.current) {
        await setupMediaRecorder(); // Set up media recorder if not already set up
      }

      mediaRecorderRef.current.start(); // Start recording only when mic icon is clicked
      setIsRecording(true);
    } else if (!otpVerified && phoneNumber) {
      alert("Please verify the OTP before starting recording.");
    } else if (!isAudioUploadAllowed) {
      alert("Audio uploads are only allowed between 2 PM and 7 PM IST.");
    }
  };

  // Stop recording audio
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
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
          <label htmlFor="file" className="imageIcon">
            <AddPhotoAlternateOutlinedIcon />
            <input
              type="file"
              id="file"
              className="imageInput"
              onChange={handleUploadImage}
            />
          </label>

          <div
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading}>
            {isRecording ? (
              <label className="micOffIcon">
                <MicOffIcon />
              </label>
            ) : (
              <label className="micIcon">
                <MicIcon />
              </label>
            )}
          </div>

          {audioBlob && (
            <Button onClick={handlePlayAudio} disabled={isLoading}>
              Play
            </Button>
          )}

          <Button
            type="submit"
            className="tweetBox__tweetButton"
            disabled={isLoading}>
            Tweet
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TweetBox;
