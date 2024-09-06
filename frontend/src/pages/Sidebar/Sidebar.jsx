import React, { useState } from "react";
import "./Sidebar.css";
import SidebarOptions from "./SidebarOptions";
import TwitterIcon from "@mui/icons-material/Twitter";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import TranslateIcon from "@mui/icons-material/Translate";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreIcon from "@mui/icons-material/More";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Divider from "@mui/material/Divider";
import DoneIcon from "@mui/icons-material/Done";
import Button from "@mui/material/Button";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Avatar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CustomLink from "./CustomLink";
import useLoggedInUser from "../../hooks/useLoggedInUser";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Sidebar({ handleLogout, user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { t } = useTranslation("translations");
  const openMenu = Boolean(anchorEl);
  const [loggedInUser] = useLoggedInUser();
  const navigate = useNavigate();

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const result =
    loggedInUser[0]?.username || user.email
      ? user?.email?.split("@")[0]
      : user.phoneNumber;
  const phoneNumber = user?.phoneNumber;

  return (
    <div className="sidebar">
      <TwitterIcon className="sidebar__twitterIcon" />
      <CustomLink to="/home/feed">
        <SidebarOptions active Icon={HomeIcon} text={t("Home")} />
      </CustomLink>
      <CustomLink to="/home/explore">
        <SidebarOptions Icon={SearchIcon} text={t("Explore")} />
      </CustomLink>
      <CustomLink to="/home/notifications">
        <SidebarOptions
          Icon={NotificationsNoneIcon}
          text={t("Notifications")}
        />
      </CustomLink>
      <CustomLink to="/home/messages">
        <SidebarOptions Icon={MailOutlineIcon} text={t("Messages")} />
      </CustomLink>
      <CustomLink to="/home/bookmarks">
        <SidebarOptions Icon={BookmarkBorderIcon} text={t("Bookmarks")} />
      </CustomLink>
      <CustomLink to="/home/languages">
        <SidebarOptions Icon={TranslateIcon} text={t("Languages")} />
      </CustomLink>
      <CustomLink to="/home/profile">
        <SidebarOptions Icon={PermIdentityIcon} text={t("Profile")} />
      </CustomLink>
      <CustomLink to="/home/more">
        <SidebarOptions Icon={MoreIcon} text={t("More")} />
      </CustomLink>
      <CustomLink to="/home/chatbot">
        <Button
          icon={SmartToyIcon}
          variant="outlined"
          className="sidebar__tweet"
          fullWidth>
          {t("ChatBot")}
        </Button>
      </CustomLink>

      <div className="Profile__info">
        <Avatar
          src={
            loggedInUser[0]?.profileImage
              ? loggedInUser[0]?.profileImage
              : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
          }
        />
        <div className="user__info">
          <h4>
            {loggedInUser[0]?.name || user?.displayName || user?.phoneNumber}
          </h4>
          <h5>@{result}</h5>
        </div>
        <IconButton
          size="small"
          sx={{ ml: 2 }}
          aria-controls={openMenu ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openMenu ? "true" : undefined}
          onClick={handleClick}>
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClick={handleClose}
          onClose={handleClose}>
          <MenuItem
            className="Profile__info1"
            onClick={() => navigate("/home/profile")}>
            <Avatar
              src={
                loggedInUser[0]?.profileImage
                  ? loggedInUser[0]?.profileImage
                  : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
              }
            />
            <div className="user_info subUser_info">
              <div>
                <h4>
                  {loggedInUser[0]?.name ||
                    user?.displayName ||
                    user?.phoneNumber}
                </h4>
                <h5>@{result ? result : phoneNumber}</h5>
              </div>
              <ListItemIcon className="done__icon" color="blue">
                <DoneIcon />
              </ListItemIcon>
            </div>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
            {t("Add an existing account")}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            {t("Log Out")} @{result ? result : phoneNumber}
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}

export default Sidebar;
