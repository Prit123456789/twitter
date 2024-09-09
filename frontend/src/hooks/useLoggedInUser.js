import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedInUser = () => {
  const { user } = useUserAuth();
  const email = user?.email;
  const phoneNumber = user?.phoneNumber;
  const [loggedInUser, setLoggedInUser] = useState({});

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const identifier = email || phoneNumber.replace("+", "");

        const response = await fetch(
          `https://twitter-cxhu.onrender.com/loggedInUser/${identifier}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setLoggedInUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (email || phoneNumber) {
      fetchLoggedInUser();
    }
  }, [email, phoneNumber]);

  return [loggedInUser, setLoggedInUser];
};

export default useLoggedInUser;
