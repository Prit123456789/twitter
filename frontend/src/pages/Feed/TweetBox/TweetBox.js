import React, { useState, useEffect } from "react";
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
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [recordedAudios, setRecordedAudios] = useState([]);
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
      const userPost = {
        profilePhoto: userProfilePic,
        post: post,
        photo: imageURL,
        audio: audioURL,
        username: username,
        name: name,
        email: email,
      };

      setPost("");
      setImageURL("");
      setAudioURL("");

      fetch("https://localhost:5000/post", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(userPost),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        });
    }
  };

  const startRecording = () => {
    if (isAudioUploadAllowed) {
      Mp3Recorder.start()
        .then(() => {
          setRecording(true);
        })
        .catch((e) => console.error(e));
    } else {
      alert("Audio uploads are only allowed between 2 PM and 7 PM IST.");
    }
  };

  const stopRecording = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const audioFile = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        });

        const formData = new FormData();
        formData.append("audio", audioFile);

        axios
          .post("http://localhost:5000/record", formData) // Adjust URL if necessary
          .then((res) => {
            setAudioURL(res.data.audioUrl);
          })
          .catch((error) => {
            console.error("Error uploading audio:", error);
          });

        setRecording(false);
      })
      .catch((e) => console.error(e));
  };

  const fetchRecordedAudios = () => {
    axios
      .get("https://localhost:5000/record")
      .then((response) => {
        setRecordedAudios(response.data);
      })
      .catch((error) => {
        console.error("Error fetching recorded audios:", error);
      });
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
            {recording ? (
              <Button onClick={stopRecording}>Stop</Button>
            ) : (
              <MicIcon onClick={startRecording} />
            )}
          </div>

          <Button className="tweetBox__tweetButton" type="submit">
            Tweet
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TweetBox;
