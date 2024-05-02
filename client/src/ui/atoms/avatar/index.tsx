import { UserData } from "../../../user-context";

import "./index.scss";

export const Avatar = ({ userData }: { userData: UserData }) => {
  // If we have user data and the user is logged in, show their
  // profile pic, defaulting to the dino head if the avatar
  // URL doesn't work.
  const avatarImage = "/assets/avatar.png";

  return (
    <div
      className={
        userData?.isSubscriber ? "avatar-wrap is-subscriber" : "avatar-wrap"
      }
      aria-hidden="true"
    >
      <img alt="" className="avatar" src={userData?.avatarUrl || avatarImage} />
    </div>
  );
};
