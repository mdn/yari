import { Button } from "../../ui/atoms/button";

export function showMoreButton(setSelectAllChecked, setOffset, list: any[]) {
  return (
    <div className="pagination">
      <Button
        type="primary"
        onClickHandler={() => {
          setSelectAllChecked(false);
          setOffset(list.length);
        }}
      >
        Show more
      </Button>
    </div>
  );
}
