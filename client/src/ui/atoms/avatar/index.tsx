import { UserData } from "../../../user-context";

import "./index.scss";

export const Avatar = ({ userData }: { userData: UserData }) => {
  // If we have user data and the user is logged in, show their
  // profile pic, defaulting to the dino head if the avatar
  // URL doesn't work.
  const avatarImage = `${process.env.PUBLIC_URL || ""}/assets/avatar.png`;

  return (
    <>
      <img
        alt={userData.username || ""}
        className="avatar"
        src={userData.avatarUrl || avatarImage}
      />
      <span className="avatar-username visually-hidden">
        {userData.username}
      </span>
    </>
  );
};
