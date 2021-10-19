import { Button } from "../../atoms/button";

import "./index.scss";

const WatchCustomMenu = () => {
  return (
    <form
      className="watch-custom-menu"
      role="menu"
      aria-labelledby="WatchMenu-button"
    >
      <Button>Customize Notifications</Button>
    </form>
  );
};

export default WatchCustomMenu;
