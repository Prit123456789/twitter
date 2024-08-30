import React, { useState, useEffect, useRef } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicIcon from "@mui/icons-material/Mic";
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
  const [username, setUsername] = useState(" ");
  const [loggedInUser] = useLoggedInUser();
  const { user } = useUserAuth();
  const email = user?.email;
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

    // Optionally check time every minute to update the state dynamically
    const interval = setInterval(checkAudioUploadTime, 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const constraints = { audio: true };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        const options = { mimeType: "audio/wav" }; // Adjust mimeType as needed
        mediaRecorderRef.current = new MediaRecorder(stream, options);

        mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
          setAudioBlob(event.data);
        });
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
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

  const handleTweet = (e) => {
    e.preventDefault();

    if (user?.providerData[0]?.providerId === "password") {
      fetch(`https://twitter-cxhu.onrender.com/loggedInUser?email=${email}`)
        .then((res) => res.json())
        .then((data) => {
          setName(data[0]?.name);
          setUsername(data[0]?.username);
        });
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
      }

      fetch("https://twitter-cxhu.onrender.com/post", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          // Clear the post, image, and audio state after successful submission
          setPost("");
          setImageURL("");
          setAudioURL("");
          setAudioBlob(null);
        });
    }
  };

  // const Verify = () => {
  //   try {
  //     if (isAudioUploadAllowed) {
  //       axios.post("https://twitter-cxhu.onrender.com/send-email-otp", {
  //         email,
  //       });
  //       alert("OTP sent to your email");
  //       setOtpSent(true);
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error sending OTP:",
  //       error.response ? error.response.data : error.message
  //     );
  //     alert(
  //       "Failed to send OTP: " +
  //         (error.response ? error.response.data.error : error.message)
  //     );
  //   }
  // };
  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }

<<<<<<< HEAD
    const handleStopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const audioDataURL = reader.result;
          setAudioURL(audioDataURL);
        };
      }
    };
    const handlePlayAudio = () => {
      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = new Audio(audioUrl);
        audioElement.play();
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
=======
  const stopRecording = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then((res) => {
        setAudioURL(res.data.audioUrl);
      })
      .catch((error) => {
        console.error("Error uploading audio:", error);
      });
  };
  // const fetchRecordedAudios = () => {
  //   axios
  //     .get("http://localhost:5000/record")
  //     .then((response) => {
  //       setRecordedAudios(response.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching recorded audios:", error);
  //     });
  // };

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
            {recording ? (
              <Button onClick={stopRecording}>Stop</Button>
            ) : (
              <MicIcon onClick={startRecording} />
            )}
>>>>>>> 622e5a399fa70988d9a7657e1963eea50433c1b5
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
                <Button onClick={handleStopRecording}>Stop</Button>
              ) : (
                <MicIcon onClick={handleStartRecording} />
              )}
            </div>

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
  };
}
export default TweetBox;
