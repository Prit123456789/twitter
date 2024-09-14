import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedInUser = () => {
  const { user } = useUserAuth();
  const [loggedInUser, setLoggedInUser] = useState({});

  useEffect(() => {
    if (user?.email) {
      fetch(
        `https://twitter-cxhu.onrender.com/loggedInUser?email=${user?.email}`
      )
        .then((res) => res.json())
        .then((data) => {
          setLoggedInUser(data);
        })
        .catch((error) => {
          console.error("Error fetching user posts:", error);
        });
    } else if (user?.phoneNumber) {
      fetch(
        `https://twitter-cxhu.onrender.com/loggedInUser?phoneNumber=${user?.phoneNumber.replace(
          "+",
          ""
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setLoggedInUser(data);
        })
        .catch((error) => {
          console.error("Error fetching user posts:", error);
        });
    }
  }, [user?.email]);

  return [loggedInUser, setLoggedInUser];
};

export default useLoggedInUser;
