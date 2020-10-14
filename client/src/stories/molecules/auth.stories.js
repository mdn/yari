import React from "react";

import Login from "../../ui/molecules/login";

export default {
  title: "Molecules/Auth",
};

export const signIn = () => {
  return (
    <div className="auth-container">
      <Login />
    </div>
  );
};
