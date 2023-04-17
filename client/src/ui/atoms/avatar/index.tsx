import { UserData } from "../../../user-context";

import "./index.scss";

export const Avatar = ({ userData }: { userData: UserData }) => {
  // If we have user data and the user is logged in, show their
  // profile pic, defaulting to the dino head if the avatar
  // URL doesn't work.
  const avatarImage = `${process.env.PUBLIC_URL || ""}/assets/avatar.png`;

  return (
    <>
      <figure
        className={
          userData?.isSubscriber ? "avatar-wrap is-subscriber" : "avatar-wrap"
        }
      >
        <img
          alt="Avatar"
          className="avatar"
          src={userData?.avatarUrl || avatarImage}
        />
      </figure>
      <span className="avatar-username visually-hidden">
        {userData?.username}
      </span>
    </>
  );
};
