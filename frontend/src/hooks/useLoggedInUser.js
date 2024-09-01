import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedInUser = () => {
  const { user } = useUserAuth();
  const email = user?.email;
  const phoneNumber = user?.phoneNumber; // Assuming `phoneNumber` is available in the auth context
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        let url;
        if (email) {
          url = `https://twitter-cxhu.onrender.com/loggedInUser?email=${encodeURIComponent(
            email
          )}`;
        } else if (phoneNumber) {
          url = `https://twitter-cxhu.onrender.com/loggedInUser?phoneNumber=${encodeURIComponent(
            phoneNumber
          )}`;
        } else {
          throw new Error("No email or phone number provided.");
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
