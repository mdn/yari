import React from "react";

import Login from "../../ui/molecules/login";

const defaults = {
  title: "Molecules/Auth",
};

export default defaults;

export const signIn = () => {
  return (
    <div className="auth-container">
      <Login />
    </div>
  );
};
