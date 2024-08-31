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

  return (
    <div className="page">
      <h2 className="head">{t("Welcome to Notification Page")}</h2>
      {loading ? (
        <div className="loader" /> /* Ensures loader occupies space correctly */
      ) : (
        <div className="login-history">
          <h3 style={{ color: "black" }}>{t("Login History")}</h3>
          {loginHistory.length > 0 ? (
            loginHistory.map((entry, index) => (
              <div
                key={index}
                className={`login-entry 
                `}>
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
