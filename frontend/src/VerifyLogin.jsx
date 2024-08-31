// VerifyLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UAParser from "ua-parser-js";

function VerifyLogin() {
  const [verificationResult, setVerificationResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const parser = new UAParser();
      const uaResult = parser.getResult();

      const browser = uaResult.browser.name;
      const os = uaResult.os.name;
      const deviceType = uaResult.device.type || "desktop";

      try {
        const response = await axios.post(
          "http://localhost:5000/verify-login",
          {
            browser,
            os,
            deviceType,
          }
        );

        setVerificationResult(response.data.message);

        if (response.data.requiresOtp) {
          navigate("/login");
        } else if (response.data.accessGranted) {
          navigate("/home/feed");
        } else {
          navigate("/access-denied");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setVerificationResult("Verification failed");
        navigate("/error");
      }
    };

    verifyUser();
  }, [navigate]);

  if (!verificationResult) {
    return <div>Loading verification...</div>;
  }

  return null; // Render nothing or a loading spinner
}

export default VerifyLogin;
