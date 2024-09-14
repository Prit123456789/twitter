import React, { useState, useEffect } from "react";
import "./mainprofile.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddLinkIcon from "@mui/icons-material/AddLink";
import Post from "./Post/Post";
import { useNavigate } from "react-router-dom";
import EditProfile from "../EditProfile/EditProfile";
import axios from "axios";
import useLoggedInUser from "../../../hooks/useLoggedInUser";
import "../MyMapComponent";
import MyMapComponent from "../MyMapComponent";

function MainProfile({ user }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser] = useLoggedInUser();
  const username = user.email ? user?.email?.split("@")[0] : user.phoneNumber;
  const phoneNumber = user?.phoneNumber
    ? user.phoneNumber.replace("+", "")
    : null;
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (user?.email) {
      fetch(`https://twitter-cxhu.onrender.com/userPost?email=${user?.email}`)
        .then((res) => res.json())
        .then((data) => {
          setPosts(data);
        })
        .catch((error) => {
          console.error("Error fetching user posts:", error);
        });
    } else if (phoneNumber) {
      fetch(
        `https://twitter-cxhu.onrender.com/userPost?phoneNumber=${phoneNumber}`
      )
        .then((res) => res.json())
        .then((data) => {
          setPosts(data);
        })
        .catch((error) => {
          console.error("Error fetching user posts:", error);
        });
    }
  }, [user?.email, phoneNumber]);

  const handleUploadCoverImage = (e) => {
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
        const url = res.data.data.display_url;
        const identifier = user?.email ? user?.email : phoneNumber;
        const userCoverImage = {
          coverImage: url,
        };
        setIsLoading(false);

        if (url) {
          fetch(`https://twitter-cxhu.onrender.com/userUpdates/${identifier}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userCoverImage),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Cover image updated successfully", data);
            })
            .catch((error) => {
              console.error("Error updating cover image:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error uploading cover image:", error);
        setIsLoading(false);
      });
  };

  const handleUploadProfileImage = (e) => {
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
        const url = res.data.data.display_url;
        const identifier = user?.email ? user?.email : phoneNumber;
        const userProfileImage = {
          profileImage: url,
        };
        setIsLoading(false);

        if (url) {
          fetch(`https://twitter-cxhu.onrender.com/userUpdates/${identifier}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userProfileImage),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Profile image updated successfully", data);
            })
            .catch((error) => {
              console.error("Error updating profile image:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error uploading profile image:", error);
        setIsLoading(false);
      });
  };

  return (
    <div className="body">
      <ArrowBackIcon className="arrow-icon" onClick={() => navigate("/")} />
      <h4 className="heading-4">@{username}</h4>
      <div className="mainprofile">
        <div className="profile-bio">
          {
            <div>
              <div className="coverImageContainer">
                <img
                  src={
                    loggedInUser[0]?.coverImage
                      ? loggedInUser[0]?.coverImage
                      : "https://www.proactivechannel.com/Files/BrandImages/Default.jpg"
                  }
                  alt=""
                  className="coverImage"
                />
                <div className="hoverCoverImage">
                  <div className="imageIcon_tweetButton">
                    <label htmlFor="image" className="imageIcon">
                      {isLoading ? (
                        <LockResetIcon className="photoIcon photoIconDisabled " />
                      ) : (
                        <CenterFocusWeakIcon className="photoIcon" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="image"
                      className="imageInput"
                      onChange={handleUploadCoverImage}
                    />
                  </div>
                </div>
              </div>
              <div className="avatar-img">
                <div className="avatarContainer">
                  <img
                    src={
                      loggedInUser[0]?.profileImage
                        ? loggedInUser[0]?.profileImage
                        : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                    }
                    className="avatar"
                    alt=""
                  />
                  <div className="hoverAvatarImage">
                    <div className="imageIcon_tweetButton">
                      <label htmlFor="profileImage" className="imageIcon">
                        {isLoading ? (
                          <LockResetIcon className="photoIcon photoIconDisabled " />
                        ) : (
                          <CenterFocusWeakIcon className="photoIcon" />
                        )}
                      </label>
                      <input
                        type="file"
                        id="profileImage"
                        className="imageInput"
                        onChange={handleUploadProfileImage}
                      />
                    </div>
                  </div>
                </div>
                <div className="userInfo">
                  <div>
                    <h3 className="heading-3">
                      {loggedInUser[0]?.name
                        ? loggedInUser[0].name
                        : user && user.displayName}
                    </h3>
                    <p className="usernameSection">@{username}</p>
                  </div>
                  <EditProfile user={user} loggedInUser={loggedInUser} />
                </div>
                <div className="infoContainer">
                  {loggedInUser[0]?.bio ? <p>{loggedInUser[0].bio}</p> : ""}
                  <div className="locationAndLink">
                    {loggedInUser[0]?.location ? (
                      <p className="subInfo">
                        <MyLocationIcon /> {loggedInUser[0].location}
                      </p>
                    ) : (
                      ""
                    )}
                    {loggedInUser[0]?.website ? (
                      <p className="subInfo link">
                        <AddLinkIcon /> {loggedInUser[0].website}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <MyMapComponent user={user} loggedInUser={loggedInUser} />
                <h4 className="tweetsText">Tweets</h4>
                <hr />
              </div>
              {posts.map((p) => (
                <Post p={p} key={p.username} />
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default MainProfile;
