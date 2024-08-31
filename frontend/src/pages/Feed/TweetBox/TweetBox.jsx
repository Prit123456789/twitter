import React, { useState, useEffect, useRef } from "react";
import "./TweetBox.css";
import { Avatar, Button, TextField } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedInUser from "../../../hooks/useLoggedInUser";
import MicRecorder from "mic-recorder-to-mp3";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

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
  const [audioURL, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [isAudioUploadAllowed, setIsAudioUploadAllowed] = useState(false);

  const userProfilePic = loggedInUser[0]?.profileImage
    ? loggedInUser[0]?.profileImage
    : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

  useEffect(() => {
    const checkAudioUploadTime = () => {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      setIsAudioUploadAllowed(currentHour >= 14 && currentHour <= 19);
    };

    checkAudioUploadTime();

    const interval = setInterval(checkAudioUploadTime, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const handleUploadImage = (e) => {
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
        setImageURL(res.data.data.display_url);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

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
      setAudioURL("");
      setAudioBlob(null);
    }
  };

  const handlePlayAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      audioElement.play();
    }
  };

  const sendOtp = async () => {
    try {
      await axios.post("https://twitter-cxhu.onrender.com/send-email-otp", {
        email,
      });
      alert("OTP sent to your email");
      setOtpSent(true);
    } catch (error) {
      console.error(
        "Error sending OTP:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Failed to send OTP: " +
          (error.response ? error.response.data.error : error.message)
      );
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post(
        "https://twitter-cxhu.onrender.com/verify-email-otp",
        {
          email,
          otp,
        }
      );
      if (response.data.success) {
        setOtpVerified(true);
        alert("OTP verified successfully");
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.error(
        "Error verifying OTP:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Failed to verify OTP: " +
          (error.response ? error.response.data.error : error.message)
      );
    }
  };

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

          <div className="micIcon">
            {isRecording ? (
              <MicOffIcon onClick={handleStopRecording} />
            ) : (
              <MicIcon onClick={handleStartRecording} />
            )}
          </div>

          {otpSent && !otpVerified && (
            <div className="otpVerification">
              <TextField
                label="Enter OTP"
                variant="outlined"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
              />
              <Button onClick={verifyOtp}>Verify OTP</Button>
            </div>
          )}

          <Button className="tweetBox__tweetButton" type="submit">
            Tweet
          </Button>
        </div>
      </form>
      <button onClick={handlePlayAudio} disabled={!audioBlob}>
        Play
      </button>
    </div>
  );
}

export default TweetBox;
