import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedInUser = () => {
  const { user } = useUserAuth();
  const email = user?.email;
  const phoneNumber = user?.phoneNumber;
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
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
          throw new Error("Failed to fetch user data.");
        }
        const data = await response.json();
        setLoggedInUser(data);
      } catch (error) {
        console.error("Error fetching logged-in user data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email, phoneNumber]);

  return [loggedInUser, setLoggedInUser, loading, error];
};

export default useLoggedInUser;
