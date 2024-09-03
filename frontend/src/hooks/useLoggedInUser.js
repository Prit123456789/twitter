import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedInUser = () => {
  const { user } = useUserAuth();
  const email = user?.email;
  const phoneNumber = user?.phoneNumber;
  const [loggedInUser, setLoggedInUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log(
        "Fetching user data with email:",
        email,
        "or phoneNumber:",
        phoneNumber
      );

      try {
        setLoading(true);

        if (!email && !phoneNumber) {
          console.error("No email or phone number provided.");
          setError("No email or phone number provided.");
          return;
        }

        const url = email
          ? `https://twitter-cxhu.onrender.com/loggedInUser?email=${encodeURIComponent(
              email
            )}`
          : `https://twitter-cxhu.onrender.com/loggedInUser?phoneNumber=${encodeURIComponent(
              phoneNumber
            )}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch user data. Status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Fetched user data:", data);
        setLoggedInUser(data);
      } catch (error) {
        console.error("Error fetching logged-in user data:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (email || phoneNumber) {
      fetchUserData();
    }
  }, [email, phoneNumber, user]);

  return [loggedInUser, setLoggedInUser, loading, error];
};

export default useLoggedInUser;
