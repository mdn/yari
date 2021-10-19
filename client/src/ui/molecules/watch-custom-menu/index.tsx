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

      <input type="checkbox" name="WatchContentUpdates" />
      <label htmlFor="">Content Updates</label>

      <fieldset>
        <label htmlFor="">Browser Compatability Data</label>
      </fieldset>
    </form>
  );
};

export default WatchCustomMenu;
