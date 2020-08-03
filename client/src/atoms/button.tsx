import * as React from "react";

type ButtonProps = {
  /**
   * Label text for the button
   */
  label: string,
  /**
   * The `type` of the button.
   * Available options are:
   * `button` or `submit`
   */
  type?: "button",
  /**
   * The button state.
   * Available options are:
   * `positive`, `danger`, `outline`, `ghost`, `inactive`
   * Combinations are also possible such as:
   * `outline positive`
   */
  state?: "primary"
}

export default function Button({ label, type, state }: ButtonProps) {
  return (
      <button type={type} className={`button ${state}`}>{label}</button>
  );
}
