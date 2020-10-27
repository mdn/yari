import * as React from "react";

type ButtonProps = {
  /**
   * The `type` of the button
   */
  buttonType?: "button" | "submit" | "reset";
  /**
   * The button state.
   * Available options are:
   * `positive`, `danger`, `outline`, `ghost`, `inactive`
   * Combinations are also possible such as:
   * `outline positive`
   */
  state?: string;
  children: React.ReactNode;
};

export const Button = ({
  buttonType = "button",
  state = "primary",
  children,
}: ButtonProps) => {
  return (
    <button type={buttonType} className={`button ${state}`}>
      {children}
    </button>
  );
};
