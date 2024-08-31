import React, { useState } from "react";
import "./ChatBot.css";
import botface from "./botface.png";
import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import { useTranslation } from "react-i18next";

const ChatBot = () => {
  const [heading, setHeading] = useState("");

  const [isLoading, setIsLoading] = useState("");
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([]);

  const { t } = useTranslation("translations");

  const onSent = async (prompt) => {
    const url = `https://twitter-api45.p.rapidapi.com/search.php?query=${encodeURIComponent(
      prompt
    )}&search_type=Top&count=1000`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "4fb7d936e4mshd4d0257d04a4ca3p102f9fjsn1f3a5a6424ba",
        "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const messageData = await response.json();
      console.log("messageData", messageData.timeline);
      setMessages(messageData.timeline);
      setHeading(`${prompt} posts on twitter`);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSendMessage = () => {
    setIsLoading(true);
    if (input.trim()) {
      onSent(input).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="head">
        <img src={botface} alt="" />
        <p className="P">{"Tweet Bot"}</p>
      </div>

      <div className="Msg">
        <div className="Msg-Box">
          {isLoading ? (
            <div className="loading">
              <hr />
            </div>
          ) : (
            <>
              {heading && (
                <div className="hr">
                  <h2>{heading}</h2>
                </div>
              )}
              {messages.map((message, index) => (
                <div className="post" key={index}>
                  <div className="post__avatar">
                    <Avatar src={message.user_info.avatar} />
                  </div>
                  <div className="post__body">
                    <div className="post__header">
                      <div className="post__headerText">
                        <h3>
                          {message.user_info.name}
                          <span className="post__headerSpecial">
                            <VerifiedUserIcon className="post__badge" />
                            <p>
                              @{message.user_info.screen_name.toLowerCase()}
                            </p>
                          </span>
                        </h3>
                      </div>
                      <div className="post__headerDescription">
                        <p>{message.text}</p>
                      </div>
                    </div>
                    {message.media.photo && (
                      <img
                        src={message.media.photo[0]?.media_url_https}
                        alt=""
                        width="400"
                        style={{ maxHeight: "500px", objectFit: "cover" }}
                      />
                    )}
                    <div className="post__footer">
                      <ChatBubbleOutlineIcon
                        className="post_footer_icon"
                        fontSize="small"
                      />
                      <RepeatIcon
                        className="post_footer_icon"
                        fontSize="small"
                      />
                      <FavoriteBorderIcon
                        className="post_footer_icon"
                        fontSize="small"
                      />
                      <PublishIcon
                        className="post_footer_icon"
                        fontSize="small"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="chatbot-input">
        <div className="input-div">
          <input
            autoFocus="true"
            className="place"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t("What do you want to see ??")}
          />
          <button onClick={() => handleSendMessage()}>{t("Send")}</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
