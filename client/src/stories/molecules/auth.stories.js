import React from "react";

import Login from "../../ui/molecules/login";

const config = {
  title: "Molecules/Auth",
};

export default config;

export const signIn = () => {
  return (
    <div className="auth-container">
      <Login />
    </div>
  );
};
