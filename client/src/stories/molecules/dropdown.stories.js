import React from "react";

import Dropdown from "../../ui/molecules/dropdown";
import avatarImage from "../../assets/avatar.png";

export default {
  title: "Molecules/Dropdown",
};

export const dropdown = () => {
  const label = (
    <>
      <img src={avatarImage} className="avatar" alt="username" loading="lazy" />
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
