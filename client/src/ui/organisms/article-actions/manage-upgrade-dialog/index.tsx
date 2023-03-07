import { useLocale } from "../../../../hooks";
import { Button } from "../../../atoms/button";
import { Icon } from "../../../atoms/icon";

export function ManageOrUpgradeDialogCollections({ setShow }) {
  const locale = useLocale();

  return (
    <div
      className="article-actions-submenu manage-upgrade-dialog show"
      role="menu"
      aria-labelledby="manage-upgrade-dialog-button"
    >
      <button onClick={() => setShow(false)} className="header mobile-only">
        <span className="header-inner">
          <Icon name="chevron" />
          Back
        </span>
      </button>
      <p>You've reached the limit of articles you can save!</p>
      <p>
        Manage your collection or upgrade to MDN Plus to unlock unlimited saves
      </p>
      <div className="mdn-form-item is-button-row">
        <Button type="secondary" href={`/${locale}/plus/collections`}>
          Manage
        </Button>
        <Button href={`/${locale}/plus`}>Upgrade</Button>
      </div>
    </div>
  );
}
