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
        // Encode the email and phone number
        const response = email
          ? await fetch(
              `https://twitter-cxhu.onrender.com/loggedInUser?email=${email}`
            )
          : await fetch(
              `https://twitter-cxhu.onrender.com/loggedInUser?phoneNumber=${phoneNumber.replace(
                "+",
                ""
              )}`
            );

        if (!response.ok) {
          console.error(`Error: ${response.status} - ${response.statusText}`);
          return;
        }

        const data = await response.json();
        setLoggedInUser(data);
      } catch (error) {
        console.error("Error fetching logged-in user data:", error);
      }
    };

    if (email || phoneNumber) {
      fetchLoggedInUser();
    }
  }, [email, phoneNumber, loggedInUser]);

  return [loggedInUser, setLoggedInUser];
};

export default useLoggedInUser;
