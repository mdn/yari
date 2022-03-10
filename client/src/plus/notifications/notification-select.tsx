import { Button } from "../../ui/atoms/button";
import { Checkbox } from "../../ui/molecules/notifications-watch-menu/atoms/checkbox";

export default function SelectedNotificationsBar({
  isChecked,
  onSelectAll,
  onStarSelected,
  onDeleteSelected,
  onUnstarSelected,
  buttonStates,
  onUnwatchSelected,
  watchedTab,
}) {
  return (
    <form className="select-all-toolbar">
      <Checkbox name="select-all" onChange={onSelectAll} checked={isChecked} />
      {!watchedTab && (
        <>
          <Button
            type="secondary"
            isDisabled={!buttonStates.starEnabled}
            onClickHandler={onStarSelected}
          >
            Star
          </Button>
          <Button
            type="secondary"
            isDisabled={!buttonStates.unstarEnabled}
            onClickHandler={onUnstarSelected}
          >
            Unstar
          </Button>
          <Button
            type="secondary"
            isDisabled={!buttonStates.deleteEnabled}
            onClickHandler={onDeleteSelected}
          >
            Delete
          </Button>
        </>
      )}
      {watchedTab && (
        <Button
          type="secondary"
          isDisabled={!buttonStates.unwatchEnabled}
          onClickHandler={onUnwatchSelected}
        >
          Unwatch
        </Button>
      )}
    </form>
  );
}
