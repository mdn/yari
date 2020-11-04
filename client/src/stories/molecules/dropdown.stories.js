import React from "react";

import Dropdown from "../../ui/molecules/dropdown";
import avatarImage from "../../assets/avatar.png";

const config = {
  title: "Molecules/Dropdown",
};

export default config;

export const dropdown = () => {
  const label = (
    <>
      <img src={avatarImage} className="avatar" alt="username" />
      <span className="avatar-username">username</span>
    </>
  );
  return (
    <Dropdown id="user-avatar-menu" label={label} right={true} hideArrow={true}>
      <li>
        <a href="edit">{"Edit profile"}</a>
      </li>
      <li>
        <a href="signout">{"Sign out"}</a>
      </li>
    </Dropdown>
  );
};
