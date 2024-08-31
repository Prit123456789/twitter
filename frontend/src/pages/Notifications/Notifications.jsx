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
      if (user?.email) {
        try {
          const response = await axios.get(
            `https://twitter-cxhu.onrender.com/loginHistory/${user.email}`
          );
          setLoginHistory(response.data);
        } catch (error) {
          console.error("Failed to fetch login history:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLoginHistory();
  }, [user]);

  if (loading) {
    return <p className="spinner" />; // Or use a custom loader here
  }

  return (
    <div className="page">
      <h2 className="head">{t("Welcome to Notification Page")}</h2>
      <div className="login-history">
        <h3>{t("Login History")}</h3>
        {loginHistory.length > 0 ? (
          <ul>
            {loginHistory.map((entry, index) => (
              <li key={index}>
                <p>
                  {t("Email")}: {entry.email}
                </p>
                <p>
                  {t("Browser")}: {entry.browser}
                </p>
                <p>
                  {t("OS")}: {entry.os}
                </p>
                <p>
                  {t("Device")}: {entry.device}
                </p>
                <p>
                  {t("IP Address")}: {entry.ip}
                </p>
                <hr />
              </li>
            ))}
          </ul>
        ) : (
          <p>{t("No login history available")}</p>
        )}
      </div>
    </div>
  );
}

export default Notifications;
