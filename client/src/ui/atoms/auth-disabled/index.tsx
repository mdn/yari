import "./index.scss";

export function AuthDisabled() {
  return (
    <div className="auth-disbled">
      <p>
        <strong>Authentication disabled: </strong>Authentication and the user
        settings app is currently disabled.
      </p>
    </div>
  );
}
