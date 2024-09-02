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
          console.error("No email or phone number provided."); // Updated error message
          setError("No email or phone number provided.");
          return; // Exit early if both are missing
        }

        let url;
        if (email) {
          url = `https://twitter-cxhu.onrender.com/loggedInUser?email=${encodeURIComponent(
            email
          )}`;
        } else if (phoneNumber) {
          url = `https://twitter-cxhu.onrender.com/loggedInUser?phoneNumber=${encodeURIComponent(
            phoneNumber
          )}`;
        }

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

  return [loggedInUser, setLoggedInUser];
};

export default useLoggedInUser;
