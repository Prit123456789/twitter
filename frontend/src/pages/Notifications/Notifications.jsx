import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../context/UserAuthContext";
import "./Page.css";
import { useTranslation } from "react-i18next";

function Notifications() {
  const { t } = useTranslation("translations");
  const { user } = useUserAuth(); // Get the logged-in user
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoginHistory = async () => {
      setLoading(true); // Set loading before fetching data
      try {
        // Check if user has email and fetch specific login history
        const endpoint = user?.email
          ? `https://twitter-cxhu.onrender.com/loginHistory/${user.email}`
          : "https://twitter-cxhu.onrender.com/loginHistory";

        // Fetch the login history data
        const response = await axios.get(endpoint);
        setLoginHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch login history:", error);
      } finally {
        setLoading(false); // Reset loading state after data fetch or error
      }
    };

    fetchLoginHistory();
  }, [user]);

  // Helper function to format the timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Formats to a readable date-time string
  };
  const formatIPs = (ips) => {
    // Check if ips is a string and split by commas if needed
    if (typeof ips === "string") {
      return ips
        .split(",")
        .map((ip, index) => <li key={index}>{ip.trim()}</li>);
    } else if (Array.isArray(ips)) {
      // If already an array, just map through it
      return ips.map((ip, index) => <li key={index}>{ip}</li>);
    }
    // Fallback if format is unexpected
    return <li>{ips}</li>;
  };

  return (
    <div className="Log">
      <h2 className="head">{t("Welcome to Notification Page")}</h2>
      {loading ? (
        <div className="loader" /> /* Ensures loader occupies space correctly */
      ) : (
        <div className="login-history">
          <h3 style={{ color: "black" }}>{t("Login History")}</h3>
          {loginHistory.length > 0 ? (
            loginHistory.map((entry, index) => (
              <div key={index} className={`login-entry`}>
                <p>
                  {t("Browser")}: {entry.browser}
                </p>
                <p>
                  {t("OS")}: {entry.os}
                </p>
                <p>
                  {t("Device")}: {entry.device}
                </p>
                <p>{t("IP Address")}:</p>
                <ul>{formatIPs(entry.ip)}</ul>
                <p>
                  {t("On")}: {formatDate(entry.timestamp)}{" "}
                </p>
              </div>
            ))
          ) : (
            <p className="no-history">{t("No login history available")}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
