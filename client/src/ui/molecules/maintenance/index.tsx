import { useUserData } from "../../../user-context";
import "./index.scss";

export default function Maintenance() {
  const userData = useUserData();
  return (
    <button className="auth-container maintenance">
      🚧 Maintenance ongoing 🚧
      <div className="maintenance-info-container">
        <div className="maintenance-info">{userData?.maintenance}</div>
      </div>
    </button>
  );
}
