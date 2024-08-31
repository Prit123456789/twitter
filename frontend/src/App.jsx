// App.jsx
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login/Login";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Signup from "./pages/Login/Signup";
import ProtectedRoute from "./pages/ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import "./App.css";
import Home from "./pages/Home";
import Explore from "./pages/Explore/Explore";
import Feed from "./pages/Feed/Feed";
import Messages from "./pages/Messages/Messages";
import Bookmarks from "./pages/Bookmarks/Bookmarks";
import Languages from "./pages/Lists/Languages";
import Profile from "./pages/Profile/Profile";
import Reset from "./pages/Login/Reset";
import Mobile from "./pages/Login/Mobile";
import More from "./pages/More/More";
import Notifications from "./pages/Notifications/Notifications";
import MyMapComponent from "./pages/Profile/MyMapComponent";
import ChatBot from "./pages/ChatBot/ChatBot";
import "./Translation/Translation";
// import VerifyLogin from "./VerifyLogin"; // Import the new VerifyLogin component

function App() {
  return (
    <div className="app">
      <SpeedInsights />
      <BrowserRouter>
        <UserAuthContextProvider>
          {/* Include VerifyLogin at the root level or wherever appropriate */}
          {/* <VerifyLogin /> */}
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }>
              <Route index element={<Feed />} />
            </Route>
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }>
              <Route path="feed" element={<Feed />} />
              <Route path="explore" element={<Explore />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="messages" element={<Messages />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="languages" element={<Languages />} />
              <Route path="profile" element={<Profile />} />
              <Route path="more" element={<More />} />
              <Route path="chatbot" element={<ChatBot />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/mobile" element={<Mobile />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/maps" element={<MyMapComponent />} />
          </Routes>
        </UserAuthContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
