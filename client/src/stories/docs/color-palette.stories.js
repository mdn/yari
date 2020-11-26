import React from "react";

import { ColorItem } from "../components/color-item";
import style from "@mdn/minimalist/sass/shared-variables.module.scss";

const defaults = {
  title: "Docs/Color Palette",
};

export default defaults;

export const primaryColors = () => {
  return (
    <>
      <h2>Primary Colors</h2>
      <p>
        Below is the official MDN Web Docs primary colors. The combination of
        background and font color has been specifically chosen to ensure at
        least an AA WCAG color contrast ratio. For white, use{" "}
        <code>$primary-600(primary600 in JS)</code> and for black, use{" "}
        <code>$primary-100(primary100 in JS)</code>
      </p>
      <ul className="color-palette">
        <li>
          <ColorItem
            backgroundColor={style.primary100}
            sassVariable="$primary-100"
            jsVariable="primary100"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.primary200}
            sassVariable="$primary-200"
            jsVariable="primary200"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.primary300}
            sassVariable="$primary-300"
            jsVariable="primary300"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.primary400}
            sassVariable="$primary-400"
            jsVariable="primary400"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.primary500}
            sassVariable="$primary-500"
            jsVariable="primary500"
            color={style.neutral100}
          />
        </li>
      </ul>
    </>
  );
};

export const neutral = () => {
  return (
    <>
      <h2>Neutral</h2>
      <p>
        Below is the official MDN Web Docs neutral colors. The combination of
        background and font color has been specifically chosen to ensure at
        least an AA WCAG color contrast ratio. For white, use{" "}
        <code>$primary-600(primary600 in JS)</code> and for black, use{" "}
        <code>$primary-100(primary100 in JS)</code>
      </p>
      <ul className="color-palette">
        <li>
          <ColorItem
            backgroundColor={style.neutral100}
            sassVariable="$neutral-100"
            jsVariable="neutral100"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.neutral200}
            sassVariable="$neutral-200"
            jsVariable="neutral200"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.neutral300}
            sassVariable="$neutral-300"
            jsVariable="neutral300"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.neutral400}
            sassVariable="$neutral-400"
            jsVariable="neutral400"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.neutral500}
            sassVariable="$neutral-500"
            jsVariable="neutral500"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.neutral525}
            sassVariable="$neutral-525"
            jsVariable="neutral525"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.neutral550}
            sassVariable="$neutral-550"
            jsVariable="neutral550"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.neutral600}
            sassVariable="$neutral-600"
            jsVariable="neutral600"
            color={style.neutral100}
          />
        </li>
      </ul>
    </>
  );
};

export const reds = () => {
  return (
    <>
      <h2>Reds</h2>
      <p>
        Below is the official MDN Web Docs red color hues. The combination of
        background and font color has been specifically chosen to ensure at
        least an AA WCAG color contrast ratio. For white, use{" "}
        <code>$primary-600(primary600 in JS)</code> and for black, use{" "}
        <code>$primary-100(primary100 in JS)</code>
      </p>
      <ul className="color-palette">
        <li>
          <ColorItem
            backgroundColor={style.red100}
            sassVariable="$red-100"
            jsVariable="red100"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.red200}
            sassVariable="$red-200"
            jsVariable="red200"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.red300}
            sassVariable="$red-300"
            jsVariable="red300"
          />
        </li>
      </ul>
    </>
  );
};

export const yellows = () => {
  return (
    <>
      <h2>Yellows</h2>
      <p>
        Below is the official MDN Web Docs yellow color hues. The combination of
        background and font color has been specifically chosen to ensure at
        least an AA WCAG color contrast ratio. For white, use{" "}
        <code>$primary-600(primary600 in JS)</code> and for black, use{" "}
        <code>$primary-100(primary100 in JS)</code>
      </p>
      <ul className="color-palette">
        <li>
          <ColorItem
            backgroundColor={style.yellow100}
            sassVariable="$yellow-100"
            jsVariable="yellow100"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.yellow200}
            sassVariable="$yellow-200"
            jsVariable="yellow200"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.yellow300}
            sassVariable="$yellow-300"
            jsVariable="yellow300"
            color={style.neutral100}
          />
        </li>
      </ul>
    </>
  );
};

export const greens = () => {
  return (
    <>
      <h2>Greens</h2>
      <p>
        Below is the official MDN Web Docs green color hues. The combination of
        background and font color has been specifically chosen to ensure at
        least an AA WCAG color contrast ratio. For white, use{" "}
        <code>$primary-600(primary600 in JS)</code> and for black, use{" "}
        <code>$primary-100(primary100 in JS)</code>
      </p>
      <ul className="color-palette">
        <li>
          <ColorItem
            backgroundColor={style.green100}
            sassVariable="$green-100"
            jsVariable="green100"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.green200}
            sassVariable="$green-200"
            jsVariable="green200"
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.green300}
            sassVariable="$green-300"
            jsVariable="green300"
            color={style.neutral100}
          />
        </li>
        <li>
          <ColorItem
            backgroundColor={style.green400}
            sassVariable="$green-400"
            jsVariable="green400"
            color={style.neutral100}
          />
        </li>
      </ul>
    </>
  );
};

export const gradients = () => {
  return (
    <>
      <h2>Gradients</h2>
      <p>
        Below is the official MDN Web Docs gradients. The first of the gradient
        options should be your first, and only, choice if it will be used in
        combination with text. If purely decorative, such as a border or a
        loader, either of the gradients can be used. When using the first
        gradient with text, ensure that the font color is set to black(
        <code>$primary-100(primary100 in JS)</code>) to ensure at least an AA
        WCAG color contrast ratio.
      </p>
      <ul className="color-palette">
        <li>
          <div
            className="swatch"
            style={{
              backgroundImage: style.standardGradient,
              color: style.neutral100,
            }}
          >
            <ul className="color-names">
              <li>
                SASS: <code>"$standard-gradient"</code>
              </li>
              <li>
                JS: <code>"standardGradient"</code>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <div
            className="swatch"
            style={{
              backgroundImage: style.blueGradient,
              color: style.neutral600,
            }}
          >
            <ul className="color-names">
              <li>
                SASS: <code>"$blue-gradient"</code>
              </li>
              <li>
                JS: <code>"blueGradient"</code>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </>
  );
};
