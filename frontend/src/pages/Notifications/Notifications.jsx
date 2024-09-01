import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../context/UserAuthContext";
import "./Page.css";
import { useTranslation } from "react-i18next";

function Notifications() {
  const { t } = useTranslation("translations");
  const { user } = useUserAuth();
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoginHistory = async () => {
      setLoading(true);
      try {
        // Determine endpoint based on user's login method
        let endpoint = "";
        if (user?.email) {
          endpoint = `https://twitter-cxhu.onrender.com/loginHistory/${user.email}`;
        } else if (user?.phoneNumber) {
          endpoint = `https://twitter-cxhu.onrender.com/phoneHistory/${user.phoneNumber}`;
        } else {
          console.error(
            "User has neither email nor phoneNumber available for login history."
          );
          return;
        }

        const response = await axios.get(endpoint);
        console.log("Login history data:", response.data); // Debugging line
        setLoginHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch login history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginHistory();
  }, [user]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatIPs = (ips) => {
    if (typeof ips === "string") {
      return ips
        .split(",")
        .map((ip, index) => <li key={index}>{ip.trim()}</li>);
    } else if (Array.isArray(ips)) {
      return ips.map((ip, index) => <li key={index}>{ip}</li>);
    }
    return <li>{ips}</li>;
  };

  return (
    <div className="Log">
      <h2 className="head">{t("Welcome to Notification Page")}</h2>
      {loading ? (
        <div className="loader" />
      ) : (
        <div className="login-history">
          <h3 style={{ color: "black" }}>{t("Login History")}</h3>
          {loginHistory.length > 0 ? (
            loginHistory.map((entry, index) => (
              <div key={index} className={`login-entry`}>
                <p>
                  {t("Browser")}: {entry.browser || "Unknown Browser"}
                </p>
                <p>
                  {t("OS")}: {entry.os || "Unknown OS"}
                </p>
                <p>
                  {t("Device")}:{" "}
                  {entry.device
                    ? typeof entry.device === "object"
                      ? `${entry.device.vendor || "Unknown Vendor"} ${
                          entry.device.model || "Unknown Model"
                        } (${entry.device.type || "Unknown Type"})`
                      : entry.device
                    : "Unknown Device"}
                </p>
                <p>{t("IP Address")}:</p>
                <ul>{formatIPs(entry.ip)}</ul>
                <p>
                  {t("On")}: {formatDate(entry.timestamp)}
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

