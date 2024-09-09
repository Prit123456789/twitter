// TimeRestrictedComponent.js
import React, { useEffect, useState } from "react";
import UAParser from "ua-parser-js";

const isWithinTimeframe = (startHour, endHour) => {
  const currentTime = new Date();
  const options = { timeZone: "Asia/Kolkata", hour12: false };
  const currentHourIST = new Date()
    .toLocaleString("en-US", options)
    .split(",")[1]
    .trim()
    .split(":")[0];
  const hour = parseInt(currentHourIST, 10);

  return hour >= startHour && hour < endHour;
};

const TimeRestrictedComponent = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const parser = new UAParser(userAgent);
    const { device } = parser.getResult();

    if (device.type === "mobile") {
      const allowed = isWithinTimeframe(10, 13);
      setIsAllowed(allowed);
    }
  }, []);

  if (!isAllowed) {
    return (
      <div>
        Access is restricted for mobile devices outside of 10 AM to 1 PM IST.
      </div>
    );
  }

  return <>{children}</>;
};

export default TimeRestrictedComponent;
